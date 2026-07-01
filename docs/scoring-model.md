# Design Risk scoring model

The Design Risk Score (0–100) estimates how *predatory* a game's design is. The
guiding principle is **score by harm, not by presence** — a mechanic only costs
points in proportion to how coercive or exploitative it actually is. This is what
keeps the model from penalising multiplayer/live-service games simply for being
monetised.

## The key fact: what purchases buy

Every direct-purchase mechanic scales by `monetizationImpact`:

| Impact | Meaning | Example |
|---|---|---|
| `none` | No real-money purchases | Stardew Valley |
| `cosmetic` | Skins/visuals only, no gameplay advantage | Rocket League, Valorant |
| `convenience` | Time-savers, no competitive power | Pokémon GO |
| `power` | Purchases affect gameplay, progression, or competition | Genshin, EA FC |

For curated games this fact is hand-verified (`src/lib/data.ts`). For games
imported from Steam it's inferred conservatively and the whole score is marked
**low confidence**.

## Weights

**Monetization**
- Pay-to-Win: `25`
- Gacha: `15`, `+10` if impact is `power`
- Loot Boxes: `12`, `+8` if impact is `power`
- Battle Pass: cosmetic `2` · convenience `6` · power `12`
- Season Pass: cosmetic `2` · convenience `5` · power `10`
- Microtransactions: cosmetic `2` · convenience `6` · power `12`
- In-Game Ads: `8`
- Paid DLC: `1` per title, capped at `5`

Randomised purchases (gacha, loot boxes) keep a meaningful baseline even when
cosmetic, because the gambling mechanic is itself a concern.

**Manipulation**
- FOMO / Limited-Time Events: `6`, `+6` if monetisation is `convenience`/`power`
  (i.e. events that pressure *spending*, not just cosmetic rotation)
- Social Pressure: `4`

**Compulsion**
- Energy System: `12`
- Daily Login Bonus: `5`

The total is the sum of all contributing factors, capped at 100. Each factor is
returned with the points it added and a plain-language reason, so a score can
always explain itself (see the "Why this score" section on any game page).

## Confidence

- **high** — scored from hand-verified data (`source` unset / `"verified"`)
- **low** — inferred from a Steam store listing (`source: "inferred"`)

## What this deliberately does *not* do

It does not treat "has a battle pass" or "has a store" as inherently predatory.
A cosmetic-only live-service game lands around *mindful*; genuine pay-to-win and
power-gacha land at *red-flag*. The score reflects coercion, not commerce.
