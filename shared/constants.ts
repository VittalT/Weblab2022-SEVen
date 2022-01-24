/** game state */
import { Size } from "./enums";
import { TowerConstants, MinionConstants } from "./types";
export const towerConstants: Record<Size, TowerConstants> = {
  [Size.Small]: {
    health: 50,
    healthRegenRate: 0.5 / 1000,
    goldRate: 3 / 1000,
    cost: 50,
    minAdjBuildRadius: 100,
    maxAdjBuildRadius: 150,
    hitRadius: 60,
  },
  [Size.Medium]: {
    health: 100,
    healthRegenRate: 0.5 / 1000,
    goldRate: 5 / 1000,
    cost: 100,
    minAdjBuildRadius: 120,
    maxAdjBuildRadius: 200,
    hitRadius: 75,
  },
  [Size.Large]: {
    health: 200,
    healthRegenRate: 1 / 1000,
    goldRate: 10 / 1000,
    cost: 200,
    minAdjBuildRadius: 140,
    maxAdjBuildRadius: 250,
    hitRadius: 90,
  },
};

export const minionConstants: Record<Size, MinionConstants> = {
  [Size.Small]: {
    damageRate: 1 / 1000,
    cost: 10,
    speed: 40 / 1000,
    boundingRadius: 5,
  },
  [Size.Medium]: {
    damageRate: 2 / 1000,
    cost: 25,
    speed: 30 / 1000,
    boundingRadius: 8,
  },
  [Size.Large]: {
    damageRate: 4 / 1000,
    cost: 50,
    speed: 20 / 1000,
    boundingRadius: 10,
  },
};

export const GoldConstants = {
  realRadius: 25,
};

export const FPS = 21;
export const MAX_GAME_LEN_M = 5;
