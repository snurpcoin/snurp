# Snurp ($SNURP)

**Snurp eats fees. Snurp burns supply. Snurp never stops.**

Snurp is a fair-launch memecoin on [Robinhood Chain](https://robinhood.com/us/en/support/articles/robinhood-chain-mainnet/) (chain id 4663), launched on [Pons](https://www.ponsfamily.com). This repository is the whole project: the mascot, the website, and the bot that does the burning. Everything Snurp promises is verifiable on chain.

## Live

| | |
|---|---|
| Token | `0x1204bc9E2EdCED1eF6f0dE2b04eEB756ca43ab53` |
| Bonding curve | `0x41CBa36e0C2b960A104b95125D592a1d9Ee8Ea07` |
| Pons | https://www.ponsfamily.com/launchpad/0x1204bc9E2EdCED1eF6f0dE2b04eEB756ca43ab53 |
| Explorer | https://robinhoodchain.blockscout.com/token/0x1204bc9E2EdCED1eF6f0dE2b04eEB756ca43ab53 |
| Site | https://snurpcoin.github.io/snurp/ |

## The Rule of Snurp

1. Every trade on Pons pays a 1% pool fee. 70% of it accrues to the creator wallet in the Pons v2 fee escrow. A separate 1% creator tax (`creatorTaxBps = 100`, set at launch and visible on chain) pays the team; it is the only fee the team keeps.
2. The creator wallet is Snurp's stomach. Every claim is spent buying $SNURP.
3. Every $SNURP bought is sent to `0x000000000000000000000000000000000000dEaD`.
4. Dev tokens never move anywhere except the dead address.

The builder tax is disclosed on the site, in this README and in the launch record. Nothing else is taken.

The bot in [`bot/`](bot/) is what executes the rule. It is open source so anyone can read it, run it, and check its transactions on [Blockscout](https://robinhoodchain.blockscout.com).

## Layout

| Path | What it is |
|---|---|
| `docs/` | The website (served by GitHub Pages). `index.html` reads live burn stats from Blockscout. |
| `bot/` | Buyback-and-burn bot. `node buyback.mjs` claims fees, buys, burns, and logs to `burns.json`. |
| `assets/` | Mascot source. `draw_snurp.py` draws `snurp.png` with Pillow; no stock art, no AI image model. |
| `SNURP-launch-brief.md` | Launch parameters, wallet, economics, and the post-launch checklist. |

## Running the bot

```bash
cd bot
npm install
cp .env.example .env   # fill in SIGNER_KEY (creator wallet) and TOKEN ($SNURP address)
npm run dry            # prints what it would do
npm start              # sends real transactions every INTERVAL_MIN minutes
```

Before graduation it buys on the Pons bonding curve. After graduation it swaps through the Uniswap v4 Universal Router on Robinhood Chain (`0x8876789976decbfcbbbe364623c63652db8c0904`) against the Pons meme-hook pool.

## Contracts it talks to (Pons v2, Robinhood Chain)

| Contract | Address |
|---|---|
| Launch factory | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| Fee escrow | `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e` |
| Meme hook | `0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044` |
| Uniswap v4 PoolManager | `0x8366a39cc670b4001a1121b8f6a443a643e40951` |
| Uniswap v4 Universal Router | `0x8876789976decbfcbbbe364623c63652db8c0904` |

Source for the Pons contracts: [ponsdotdev/ponsfamily](https://github.com/ponsdotdev/ponsfamily). Pons v2 is unaudited; so is this bot.

## Disclaimer

$SNURP is a memecoin with no intrinsic value and no promises. Tokens can go to zero. Nothing in this repository is financial advice. Snurp is not affiliated with Robinhood or Pons.
