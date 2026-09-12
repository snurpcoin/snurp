// Snurp buyback-and-burn bot — Robinhood Chain (4663) / Pons v2
// Loop: claim creator fees from the Pons fee escrow → buy $SNURP → send it to the dead address.
// Every step is a public transaction. Run: node buyback.mjs   (DRY_RUN=1 to only print)
import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseAbi, formatEther, parseEther, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'node:fs';

const RPC       = process.env.RPC || 'https://rpc.mainnet.chain.robinhood.com';
const TOKEN     = getAddress(process.env.TOKEN);                                                     // $SNURP token address
const FACTORY   = getAddress(process.env.FACTORY || '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e');   // Pons v2 launch factory
const ESCROW    = getAddress(process.env.ESCROW  || '0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e');   // Pons v2 fee escrow
const HOOK      = getAddress(process.env.HOOK    || '0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044');   // Pons v2 meme hook
const UROUTER   = getAddress(process.env.UNIVERSAL_ROUTER || '0x8876789976decbfcbbbe364623c63652db8c0904'); // Uniswap v4 Universal Router
const BURN      = '0x000000000000000000000000000000000000dEaD';
const INTERVAL  = Number(process.env.INTERVAL_MIN || 10) * 60_000;
const MIN_CLAIM = parseEther(process.env.MIN_CLAIM_ETH || '0.0005');
const GAS_KEEP  = parseEther(process.env.GAS_RESERVE_ETH || '0.0005');
const SLIPPAGE  = Number(process.env.SLIPPAGE_BPS || 500);
const DRY       = process.env.DRY_RUN === '1';
const LOG       = process.env.LOG_FILE || './burns.json';

const chain = { id: 4663, name: 'Robinhood Chain', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } };
const account = privateKeyToAccount(process.env.SIGNER_KEY);
const pub = createPublicClient({ chain, transport: http(RPC) });
const wal = createWalletClient({ chain, account, transport: http(RPC) });

const factoryAbi = parseAbi([
  'struct LaunchedToken { address token; address curve; address deployer; address creatorFeeRecipient; address pairToken; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; uint16 creatorTaxBps; bool buybackEnabled; uint8 phase; uint256 sweptQuote; uint256 sweptTokens; uint256 sweptAt; bool exists }',
  'function getLaunchedToken(address token) view returns (LaunchedToken)',
]);
const escrowAbi = parseAbi([
  'function balanceOf(address recipient) view returns (uint256)',
  'function claim()',
]);
const curveAbi = parseAbi([
  'function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)',
  'function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)',
  'function readyToGraduate() view returns (bool)',
  'function feeBps() view returns (uint256)',
]);
const erc20Abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]);

const log = (...a) => console.log(new Date().toISOString(), ...a);
function record(entry) {
  let arr = []; try { arr = JSON.parse(fs.readFileSync(LOG, 'utf8')); } catch {}
  arr.push(entry); fs.writeFileSync(LOG, JSON.stringify(arr, null, 2));
}
async function send(req) {
  if (DRY) { log('DRY_RUN would send', req.functionName, req.value ? formatEther(req.value) + ' ETH' : ''); return null; }
  const hash = await wal.writeContract(req);
  const rc = await pub.waitForTransactionReceipt({ hash });
  if (rc.status !== 'success') throw new Error(`tx ${hash} reverted`);
  return hash;
}

async function tick() {
  const launch = await pub.readContract({ address: FACTORY, abi: factoryAbi, functionName: 'getLaunchedToken', args: [TOKEN] });
  if (!launch.exists) throw new Error('token not found on the Pons v2 factory');
  const curve = launch.curve;

  // 1. claim creator fees (ETH) from the escrow
  const claimable = await pub.readContract({ address: ESCROW, abi: escrowAbi, functionName: 'balanceOf', args: [account.address] });
  log(`claimable ${formatEther(claimable)} ETH`);
  let claimHash = null;
  if (claimable >= MIN_CLAIM) {
    claimHash = await send({ address: ESCROW, abi: escrowAbi, functionName: 'claim', account });
    log('claimed', claimHash);
  }

  // 2. spend everything above the gas reserve on $SNURP
  const eth = await pub.getBalance({ address: account.address });
  const spend = eth > GAS_KEEP ? eth - GAS_KEEP : 0n;
  if (spend < MIN_CLAIM) { log(`nothing to spend (balance ${formatEther(eth)} ETH)`); return; }

  const graduated = launch.phase >= 2 || (await pub.readContract({ address: curve, abi: curveAbi, functionName: 'readyToGraduate' }));
  let buyHash = null;
  if (!graduated) {
    const [qr, tr] = await pub.readContract({ address: curve, abi: curveAbi, functionName: 'getReserves' });
    const feeBps = await pub.readContract({ address: curve, abi: curveAbi, functionName: 'feeBps' }).catch(() => 100n);
    const inAfterFee = spend * (10_000n - BigInt(feeBps)) / 10_000n;
    const out = tr * inAfterFee / (qr + inAfterFee);               // constant-product estimate
    const minOut = out * BigInt(10_000 - SLIPPAGE) / 10_000n;
    buyHash = await send({ address: curve, abi: curveAbi, functionName: 'buy', args: [spend, minOut, account.address], value: spend, account });
    log(`bought on curve with ${formatEther(spend)} ETH`, buyHash);
  } else {
    const { buyOnV4 } = await import('./v4swap.mjs');
    buyHash = await buyOnV4({ wal, pub, account, router: UROUTER, token: TOKEN, hook: HOOK, tickSpacing: launch.tickSpacing, amountIn: spend, dry: DRY });
    log(`bought on the v4 pool with ${formatEther(spend)} ETH`, buyHash);
  }

  // 3. burn every $SNURP this wallet holds
  const bal = await pub.readContract({ address: TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [account.address] });
  if (bal === 0n) { log('no tokens to burn'); return; }
  const burnHash = await send({ address: TOKEN, abi: erc20Abi, functionName: 'transfer', args: [BURN, bal], account });
  log(`burned ${formatEther(bal)} SNURP`, burnHash);
  record({ at: new Date().toISOString(), claimedEth: formatEther(claimable), spentEth: formatEther(spend), burned: formatEther(bal), claimHash, buyHash, burnHash });
}

log(`Snurp bot online. wallet ${account.address} token ${TOKEN} every ${INTERVAL / 60000} min ${DRY ? '(DRY RUN)' : ''}`);
for (;;) {
  try { await tick(); } catch (e) { log('error:', e.shortMessage || e.message); }
  await new Promise(r => setTimeout(r, INTERVAL));
}
