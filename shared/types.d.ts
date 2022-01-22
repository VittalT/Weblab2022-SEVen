declare global {
  enum ClickState {
    Tower = "Tower",
    Minion = "Minion",
    MinionFirstTower = "Minion and Clicked First Tower",
    Explosion = "Explosion",
  }

  enum Size {
    Small = "Small",
    Medium = "Medium",
    Large = "Large",
  }

  type TowerConstants = {
    health: number;
    healthRegenRate: number;
    goldRate: number;
    cost: number;
    minAdjBuildRadius: number;
    maxAdjBuildRadius: number;
    hitRadius: number;
  };

  type MinionConstants = {
    damageRate: number;
    cost: number;
    speed: number;
    boundingRadius: number;
  };

  type GameUpdateData = {
    time: number;
    hostId: string;
    idToName: Record<string, string>;
    playerToTeamId: Record<string, number>;
    activeStatus: string;
    winnerId: string | null;
    players: Record<string, Player>;
    towers: Record<number, Tower>;
    minions: Record<number, Minion>;
  };
}
export {};
