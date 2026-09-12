// Post-graduation buy through Uniswap v4 (Universal Router, V4_SWAP command).
// Pool key per the Pons docs: currencies sorted ascending, fee 0, tickSpacing from the launch record, hooks = Pons meme hook.
import { encodeAbiParameters, encodePacked, parseAbi, zeroAddress } from 'viem';

const routerAbi = parseAbi(['function execute(bytes commands, bytes[] inputs, uint256 deadline) payable']);
const SWAP_EXACT_IN_SINGLE = 0x06, SETTLE_ALL = 0x0c, TAKE_ALL = 0x0f; // v4-periphery Actions
const V4_SWAP = 0x10;                                                  // Universal Router command

export async function buyOnV4({ wal, pub, account, router, token, hook, tickSpacing, amountIn, dry }) {
  const eth = zeroAddress;                                   // native ETH is address(0) in v4
  const zeroForOne = BigInt(eth) < BigInt(token);            // ETH sorts first, so buying the token is zeroForOne
  const poolKey = { currency0: eth, currency1: token, fee: 0, tickSpacing, hooks: hook };
  const minOut = 0n; // TODO: quote via V4Quoter 0x8dc178efb8111bb0973dd9d722ebeff267c98f94 and apply slippage
  const actions = encodePacked(['uint8', 'uint8', 'uint8'], [SWAP_EXACT_IN_SINGLE, SETTLE_ALL, TAKE_ALL]);
  const swapParams = encodeAbiParameters(
    [{ type: 'tuple', components: [
      { name: 'poolKey', type: 'tuple', components: [
        { name: 'currency0', type: 'address' }, { name: 'currency1', type: 'address' }, { name: 'fee', type: 'uint24' },
        { name: 'tickSpacing', type: 'int24' }, { name: 'hooks', type: 'address' } ] },
      { name: 'zeroForOne', type: 'bool' }, { name: 'amountIn', type: 'uint128' },
      { name: 'amountOutMinimum', type: 'uint128' }, { name: 'hookData', type: 'bytes' } ] }],
    [{ poolKey, zeroForOne, amountIn, amountOutMinimum: minOut, hookData: '0x' }]);
  const settle = encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [eth, amountIn]);
  const take   = encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [token, minOut]);
  const input  = encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, [swapParams, settle, take]]);
  const req = { address: router, abi: routerAbi, functionName: 'execute',
    args: [encodePacked(['uint8'], [V4_SWAP]), [input], BigInt(Math.floor(Date.now() / 1000) + 600)], value: amountIn, account };
  if (dry) { console.log('DRY_RUN would swap', amountIn.toString(), 'wei ETH for the token via', router); return null; }
  const hash = await wal.writeContract(req);
  const rc = await pub.waitForTransactionReceipt({ hash });
  if (rc.status !== 'success') throw new Error(`v4 swap ${hash} reverted`);
  return hash;
}
