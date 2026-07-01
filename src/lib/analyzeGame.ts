import type { AnalyzedGame, Game } from "./types";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  detectHabitPatterns,
  generateRecommendation,
} from "./engines";

/** Run all four scoring engines over a game to produce an AnalyzedGame. */
export function analyzeGame(game: Game): AnalyzedGame {
  const designRiskScore = calculateDesignRiskScore(game);
  const joyIndex = calculateJoyIndex(game, designRiskScore);
  const detectedPatterns = detectHabitPatterns(game);
  const recommendation = generateRecommendation(designRiskScore, joyIndex);
  return { ...game, designRiskScore, joyIndex, detectedPatterns, recommendation };
}

export function analyzeGames(games: Game[]): AnalyzedGame[] {
  return games.map(analyzeGame);
}
