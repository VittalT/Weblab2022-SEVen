/** game state */
import { Size } from "./enums";
import { TowerConstants, MinionConstants } from "./types";
export const towerConstants: Record<Size, TowerConstants> = {
  [Size.Small]: {
    health: 50,
    healthRegenRate: 0.5 / 1000,
    goldRate: 2 / 1000,
    cost: 25,
    minAdjBuildRadius: 60,
    maxAdjBuildRadius: 150,
    hitRadius: 60,
  },
  [Size.Medium]: {
    health: 150,
    healthRegenRate: 0.5 / 1000,
    goldRate: 3 / 1000,
    cost: 100,
    minAdjBuildRadius: 75,
    maxAdjBuildRadius: 180,
    hitRadius: 75,
  },
  [Size.Large]: {
    health: 500,
    healthRegenRate: 1 / 1000,
    goldRate: 5 / 1000,
    cost: 400,
    minAdjBuildRadius: 90,
    maxAdjBuildRadius: 210,
    hitRadius: 90,
  },
};

export const minionConstants: Record<Size, MinionConstants> = {
  [Size.Small]: {
    damageRate: 1 / 1000,
    cost: 15,
    speed: 40 / 1000,
    boundingRadius: 5,
  },
  [Size.Medium]: {
    damageRate: 3 / 1000,
    cost: 30,
    speed: 32 / 1000,
    boundingRadius: 8,
  },
  [Size.Large]: {
    damageRate: 5 / 1000,
    cost: 45,
    speed: 24 / 1000,
    boundingRadius: 10,
  },
};
export const explosionConstants = {
  cost: 250,
};

export const GoldConstants = {
  realRadius: 25,
  gold: 25,
};

export const FPS = 21;
export const MAX_GAME_LEN_M = 5;
