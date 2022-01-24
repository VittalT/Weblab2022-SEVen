import Minion from "./Minion";
import Tower from "./Tower";
import Player from "./Player";
import Point from "./Point";

export type TowerConstants = {
  health: number;
  healthRegenRate: number;
  goldRate: number;
  cost: number;
  minAdjBuildRadius: number;
  maxAdjBuildRadius: number;
  hitRadius: number;
};

export type MinionConstants = {
  damageRate: number;
  cost: number;
  speed: number;
  boundingRadius: number;
};

export type GameUpdateData = {
  time: number;
  hostId: string;
  idToName: Record<string, string>;
  playerToTeamId: Record<string, number>;
  isActive: boolean;
  winnerId: string | null;
  players: Record<string, Player>;
  towers: Record<number, Tower>;
  minions: Record<number, Minion>;
  goldMineLocs: Array<Point>;
};
