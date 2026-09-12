# $SNURP — launch brief (Pons · Robinhood Chain) — 2026-09-12

## The idea (original, verified unused)
Snurp is a brand-new creature: a chubby mint blob with a curling trunk. It snurps up trading fees and burns
$SNURP with them. It never stops eating, so the supply never stops shrinking.
- Name checked 2026-09-12: "snurp" → 0 tokens on Pons (⌘K search), no crypto results on the web.
- Rejected because they already exist: HUG (2 on Pons), tardigrade (96), Ouroboros (26), Glonk (Ricky Gervais coin).

## Why people can believe it
1. The rule is mechanical, not a promise: Pons v2 pays the creator 70% of the 1% trade fee into an escrow.
   The open-source bot (`bot/`) claims it, buys $SNURP, sends it to 0x…dEaD, and logs every tx hash.
2. Everything is public: repo github.com/snurpcoin/snurp, site on GitHub Pages, burns on Blockscout, live Snurp-o-meter.
3. Liquidity locks forever at graduation (Pons v2 locker has no withdraw).
4. Dev never sells. Dev-buy tokens only ever move to the burn address.

## How the project makes money (decided 2026-09-12)
- creatorTaxBps = 100 (1% builder tax), paid in ETH on every trade, disclosed on the site, README and launch record.
- Base creator fee share (70% of the 1% pool fee) → 100% burn. Never touch it; that is the pitch.
- Plus: dev buy appreciation, and Pons's buyback vault vesting bought-back tokens to the creator over 5 years.
- Site line: "1% feeds the builder, the rest of the fee feeds Snurp."

## Form values (ponsfamily.com/launchpad/create · v2)
- Name: Snurp
- Ticker: SNURP
- Description:
  Snurp eats fees. Snurp burns supply. Snurp never stops. 100% of the creator fee share buys back and burns $SNURP,
  forever. 1% builder tax, disclosed. Open-source burn bot, every burn on chain. Fair launch on Pons · 1B supply · liquidity locked.
- Image: assets/snurp.png (1024×1024, original art)
- X profile: create @snurpcoin first (I can't create accounts), or leave blank and add later
- Telegram: optional
- Paired asset: ETH (wallet only holds ETH; dev buy is in ETH; graduation at 4.2 ETH)
- Developer buy: 0.04 ETH (wallet 0.072 ETH after bridging on 2026-09-12; keep ~0.03 for the bot’s gas and first claims)
- Creator tax: 1% (creatorTaxBps = 100). If the v2 form hides it, look for an Advanced / creator tax field; it is a launch param.
- Buyback toggle: turn ON if the form offers it (protocol-level buybacks on top of ours)

## Wallet
OKX Wallet 0xa46368CF01a7dC13d8D74f982BC01295d15B69de · chain 4663 · 0.012048 ETH (≈$30) · connected on ponsfamily.com
Launch fee 0.0005 ETH · gas ≈ 0.1 gwei · factory.canLaunch(wallet) = true (checked 2026-09-12)

## After launch — in order
1. Copy the token address from the Pons page → docs/index.html `CONTRACT`, `PONS_URL`; bot/.env `TOKEN`. Commit, push.
2. Run the bot: `cd bot && npm run dry` then `npm start` (SIGNER_KEY = the launch wallet). Keep it on the Mac or the US VPS.
3. Post the first burn tx on X with the Snurp-o-meter link. Pin it.
4. Post in the Pons forum (/memestock) with the repo link. Reply to every "is this a rug" with the bot's tx list.
5. Daily: one screenshot of the meter, one snurp joke. Snurp's mood = how much it ate today.

## Addresses the bot uses
Pons v2 factory 0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e · fee escrow 0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e
meme hook 0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044 · Uniswap v4 PoolManager 0x8366a39cc670b4001a1121b8f6a443a643e40951
Universal Router 0x8876789976decbfcbbbe364623c63652db8c0904 · V4Quoter 0x8dc178efb8111bb0973dd9d722ebeff267c98f94
