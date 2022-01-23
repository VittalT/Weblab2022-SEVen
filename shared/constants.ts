/** game state */
import { Size } from "./enums";
import { TowerConstants, MinionConstants } from "./types";
export const towerConstants: Record<Size, TowerConstants> = {
  [Size.Small]: {
    health: 50,
    healthRegenRate: 3,
    goldRate: 3,
    cost: 50,
    minAdjBuildRadius: 100,
    maxAdjBuildRadius: 150,
    hitRadius: 50,
  },
  [Size.Medium]: {
    health: 100,
    healthRegenRate: 5,
    goldRate: 5,
    cost: 100,
    minAdjBuildRadius: 120,
    maxAdjBuildRadius: 200,
    hitRadius: 70,
  },
  [Size.Large]: {
    health: 200,
    healthRegenRate: 10,
    goldRate: 10,
    cost: 200,
    minAdjBuildRadius: 140,
    maxAdjBuildRadius: 250,
    hitRadius: 90,
  },
};

export const minionConstants: Record<Size, MinionConstants> = {
  [Size.Small]: {
    damageRate: 5,
    cost: 10,
    speed: 400,
    boundingRadius: 10,
  },
  [Size.Medium]: {
    damageRate: 10,
    cost: 25,
    speed: 300,
    boundingRadius: 20,
  },
  [Size.Large]: {
    damageRate: 20,
    cost: 50,
    speed: 200,
    boundingRadius: 30,
  },
};

export const GoldConstants = {
  realRadius: 50,
};

export const FPS = 60;
export const MAX_GAME_LEN_M = 5;
