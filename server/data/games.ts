// holds all games, including inactive ones
import { Game } from "./Game";

export const games: Record<string, Game> = {};

module.exports = { games };
