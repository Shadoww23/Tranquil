import type { GameMechanics } from "./types";

export interface PatternDefinition {
  id: string;
  name: string;
  category: "monetization" | "manipulation" | "compulsion";
  defaultSeverity: "low" | "medium" | "high";
  description: string;
  howToIdentify: string;
  researchContext: string;
  mechanicsKey: keyof GameMechanics;
}

export const PATTERN_REGISTRY: PatternDefinition[] = [
  {
    id: "gacha-loop",
    name: "Gacha Loop",
    category: "monetization",
    defaultSeverity: "high",
    description:
      "A randomized reward system where players pay currency (real or virtual) for a chance to receive desired items. Desired outcomes are rare, driving repeated purchases.",
    howToIdentify:
      "Look for 'pulls', 'rolls', 'summons', or 'banners'. Advertised rates below 2% for top-tier items are a strong signal.",
    researchContext:
      "Gacha mechanics share structural features with slot machines: variable-ratio reinforcement schedules, which behavioral psychology identifies as the most powerful driver of repeated behavior. Multiple national gambling regulators have investigated or restricted these mechanics.",
    mechanicsKey: "hasGacha",
  },
  {
    id: "loot-boxes",
    name: "Loot Boxes",
    category: "monetization",
    defaultSeverity: "high",
    description:
      "Virtual containers purchased with real money that deliver randomized in-game items of varying rarity and value.",
    howToIdentify:
      "Purchasable mystery boxes, crates, or packs with randomized contents. Often styled as chests, cases, or capsules.",
    researchContext:
      "Loot boxes have been regulated or banned in Belgium and the Netherlands as gambling products. Research has found correlations between loot box spending and problem gambling symptom severity (Zendle & Cairns, 2018).",
    mechanicsKey: "hasLootBoxes",
  },
  {
    id: "pay-to-win",
    name: "Pay-to-Win",
    category: "monetization",
    defaultSeverity: "high",
    description:
      "Purchasable items, upgrades, or advantages that directly improve competitive performance against other players who have not paid.",
    howToIdentify:
      "Paid items that increase player stats, unlock stronger abilities, or accelerate progression in ways unavailable to non-paying players in competitive modes.",
    researchContext:
      "Pay-to-win mechanics undermine competitive integrity and create a two-tier player base divided by spending capacity rather than skill. Research on fairness perception shows they significantly reduce long-term engagement.",
    mechanicsKey: "hasPayToWin",
  },
  {
    id: "battle-pass",
    name: "Battle Pass",
    category: "monetization",
    defaultSeverity: "medium",
    description:
      "A time-limited seasonal subscription that rewards daily/weekly challenges to unlock cosmetic items. Players must stay engaged throughout the season to extract value.",
    howToIdentify:
      "Seasonal paid tiers with a progress track, typically $10–15 per season (8–12 weeks). Value proposition requires consistent play to justify purchase.",
    researchContext:
      "Battle passes are designed to maximize engagement through sunk-cost psychology: once purchased, players feel compelled to play regularly to avoid 'wasting' the purchase. They combine subscription revenue with time-pressure mechanics.",
    mechanicsKey: "hasBattlePass",
  },
  {
    id: "energy-system",
    name: "Energy System",
    category: "compulsion",
    defaultSeverity: "high",
    description:
      "An artificial resource that depletes as players engage and regenerates over real time, limiting how long a session can last without payment or waiting.",
    howToIdentify:
      "Stamina, lives, energy, or action points that refill on a timer (minutes/hours). Game halts when depleted unless you pay to refill.",
    researchContext:
      "Energy systems create artificial frustration to monetize play time itself. The temporal constraint is designed to prompt purchase at the exact moment of peak engagement, exploiting the momentum of an enjoyable session.",
    mechanicsKey: "hasEnergySystem",
  },
  {
    id: "daily-login-hook",
    name: "Daily Login Hook",
    category: "compulsion",
    defaultSeverity: "medium",
    description:
      "Reward systems structured to incentivize opening the game every day regardless of whether the player actually wants to play.",
    howToIdentify:
      "Login calendars, streak bonuses, or daily reward chests. Rewards escalate with consecutive days and reset if you miss a day.",
    researchContext:
      "Daily login systems apply operant conditioning (fixed-interval reinforcement) to create habitual game opening behavior. They are designed to disrupt the natural decision of whether to play and replace it with obligation.",
    mechanicsKey: "hasDailyLoginBonus",
  },
  {
    id: "fomo-pressure",
    name: "FOMO Pressure",
    category: "manipulation",
    defaultSeverity: "medium",
    description:
      "Time-limited content, events, or offers that will permanently disappear, creating urgency and fear of missing out on exclusive items.",
    howToIdentify:
      "Countdown timers on store items, limited-edition seasonal content, exclusive skins or cosmetics labeled 'never returning'. The word 'exclusive' combined with a deadline.",
    researchContext:
      "Przybylski et al. (2013) formalized the Fear of Missing Out (FoMO) construct. Games exploit this by attaching scarcity signals to social currency items, creating anxiety that is only relievable through immediate purchase.",
    mechanicsKey: "hasLimitedTimeEvents",
  },
  {
    id: "social-obligation",
    name: "Social Obligation",
    category: "manipulation",
    defaultSeverity: "medium",
    description:
      "Game mechanics that make a player feel responsible to other players, requiring them to log in or play to avoid letting teammates, clan members, or in-game friends down.",
    howToIdentify:
      "Guild contribution requirements, timed cooperative events that need minimum participation, social features that expose when you last logged in to your friends.",
    researchContext:
      "Social obligation mechanics exploit in-group loyalty and interpersonal accountability. They transform a personal leisure choice into a social commitment, making it harder to take natural breaks.",
    mechanicsKey: "hasSocialPressure",
  },
];
