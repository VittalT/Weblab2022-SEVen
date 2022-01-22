import assert, { throws } from "assert";
import { updateDisplay, getIo } from "../server-socket";

export class Game {
  private readonly gameCode: string;
  private readonly gameType: string;
  private hostId: string;
  private readonly playerIds: Array<string>;
  private readonly idToName: Record<string, string>;
  private activeStatus: string;

  private readonly startTime: number;
  private winnerId: string | null;
  private readonly towers: Record<number, Tower>; // id to tower
  private maxTowerId: number;
  private readonly minions: Record<number, Minion>; // id to minion
  private maxMinionId: number;
  private readonly players: Record<string, Player>; // id to player
  private readonly playerToTeamId: Record<string, number>; // playerId to teamId

  public constructor(
    gameCode: string,
    gameType: string,
    hostId: string,
    hostName: string,
    playerIds: Array<string>
  ) {
    this.gameCode = gameCode;
    this.gameType = gameType;
    this.hostId = hostId;
    this.playerIds = playerIds;
    this.idToName = {};
    this.idToName[hostId] = hostName;
    this.activeStatus = "active";

    this.startTime = Date.now();
    this.winnerId = null;
    this.towers = {} as Record<number, Tower>;
    this.maxTowerId = this.playerIds.length - 1;
    this.minions = {} as Record<number, Minion>;
    this.maxMinionId = 0;
    this.players = {} as Record<string, Player>;
    this.playerToTeamId = {} as Record<string, number>;
    this.gameLoop = this.gameLoop.bind(this);

    const numPlayers = this.playerIds.length;
    for (let teamId = 0; teamId < numPlayers; teamId++) {
      const userId = this.playerIds[teamId];
      const startTowerId = teamId;
      const dir = (2 * Math.PI) / numPlayers;
      const startTowerLoc = new Point(800 + 300 * Math.cos(dir), 375 + 300 * Math.sin(dir));
      const startTower = new Tower(50, startTowerLoc, Size.Small, []);
      const player = new Player(
        50,
        [startTowerId],
        [],
        ClickState.Tower,
        teamId,
        Size.Small,
        false,
        true
      );
      this.towers[startTowerId] = startTower;
      this.players[userId] = player;
      this.playerToTeamId[userId] = teamId;
    }
    getIo().emit("updatePublicLobby");
  }

  // updates all frontend playerlobbies to include most recent information
  public updateLobbies() {
    const hostName = this.idToName[this.hostId];
    const playerNames = this.playerIds.map((name: string) => this.idToName[name]);
    const data = {
      gameType: this.gameType,
      gameCode: this.gameCode,
      hostName: hostName,
      hostId: this.hostId,
      playerNames: playerNames,
    };
    getIo().in(this.gameCode).emit("updateLobbies", data); //should be to
  }

  // returns a boolean value on whether or not the join was successful
  public join(userId: string, userName: string): boolean {
    // CAN ADD LOGIC RELATED TO THE STATE OF THE GAME, HOW MANY PLAYER THERE ARE, etc.
    if (this.playerIds.includes(userId)) {
      return true;
    }
    this.playerIds.push(userId);
    this.idToName[userId] = userName;
    getIo().emit("updatePublicLobby");
    return true;
  }

  public leave(userId: string, userName: string): boolean {
    // remove player from playerIds
    const index = this.playerIds.indexOf(userId, 0);
    if (index > -1) {
      this.playerIds.splice(index, 1);
    }
    if (userId === this.hostId) {
      // if there are still players, select a new host
      if (this.playerIds.length > 0) {
        this.hostId = this.playerIds[0];
      } else {
        this.hostId = "NONE";
        this.activeStatus = "inactive";
      }
    }
    getIo().emit("updatePublicLobby");
    return true;
  }

  public hasPlayer(userId: string): boolean {
    return this.playerIds.includes(userId);
  }

  public getGameType(): string {
    return this.gameType;
  }

  public getHostName(): string {
    return this.idToName[this.hostId];
  }

  public getGameCode(): string {
    return this.gameCode;
  }

  public getPlayerNames(): Array<string> {
    return this.playerIds.map((name: string) => this.idToName[name].toString());
  }

  public toString(): string {
    return "Game With gameCode: " + this.gameCode;
  }

  public numPlayers(): string {
    return this.playerIds.length.toString();
  }

  public getActiveStatus(): string {
    return this.activeStatus;
  }

  public setInactive(): void {
    this.activeStatus = "inactive";
  }

  public getTeamId(userId: string): number {
    return this.playerToTeamId[userId];
  }

  public getHostId(): string {
    return this.hostId;
  }

  public getPlayer(userId: string): Player {
    return this.players[userId];
  }

  public getTower(towerId: number): Tower {
    return this.towers[towerId];
  }

  public getMinion(minionId: number): Minion {
    return this.minions[minionId];
  }

  public toggleInfo(userId: string) {
    const player = this.getPlayer(userId);
    player.showInfo = !player.showInfo;
  }

  public start() {
    getIo().in(this.gameCode).emit("startGame", { gameCode: this.gameCode });
  }

  public closeEnough(userId: string, loc: Point, maxDist: number): boolean {
    const player = this.getPlayer(userId);
    for (const towerId of player.towerIds) {
      const tower = this.getTower(towerId);
      if (tower.location.distanceTo(loc) <= maxDist) {
        return true;
      }
    }
    return false;
  }

  public farEnough(userId: string, loc: Point, minDist: number): boolean {
    const player = this.getPlayer(userId);
    for (const towerId of player.towerIds) {
      const tower = this.getTower(towerId);
      if (tower.location.distanceTo(loc) < minDist) {
        return false;
      }
    }
    return true;
  }

  public addTower(userId: string, towerSize: Size, loc: Point) {
    const player = this.getPlayer(userId);
    const towerSizeConstants = towerConstants[towerSize];
    if (towerSizeConstants.cost > player.gold) {
      updateDisplay(userId, `${loc} ; Not enough money`);
    } else if (!this.closeEnough(userId, loc, towerSizeConstants.maxAdjBuildRadius)) {
      updateDisplay(userId, `${loc} ; Not close enough to an ally tower`);
    } else if (!this.farEnough(userId, loc, towerSizeConstants.minAdjBuildRadius)) {
      updateDisplay(userId, `${loc} ; Too close to an ally tower`);
    } else {
      player.gold -= towerSizeConstants.cost;
      const newTower: Tower = {
        health: towerSizeConstants.health,
        location: loc,
        size: towerSize,
        enemyMinionIds: [],
      };
      const newTowerId = ++this.maxTowerId;
      this.towers[newTowerId] = newTower;
      player.towerIds.push(newTowerId);
    }
  }

  public removeTower(towerId: number) {
    const tower = this.getTower(towerId);
    for (const minionId of tower.enemyMinionIds) {
      const minion = this.getMinion(minionId);
      minion.targetTowerId = null;
    }
    for (const player of Object.values(this.players)) {
      const idx = player.towerIds.indexOf(towerId);
      if (idx !== -1) {
        player.towerIds.splice(idx, 1);
      }
    }
    delete this.towers[towerId];
  }

  public addMinion(userId: string, minionSize: Size, allyTowerId: number, enemyTowerId: number) {
    const player = this.getPlayer(userId);

    const minionSizeConstants = minionConstants[minionSize];
    const allyTower = this.getTower(allyTowerId);
    const enemyTower = this.getTower(enemyTowerId);

    if (minionSizeConstants.cost <= player.gold) {
      player.gold -= minionSizeConstants.cost;
      const dir = allyTower.location.angleTo(enemyTower.location);
      const allyRadius = towerConstants[allyTower.size].hitRadius;
      const enemyRadius = towerConstants[enemyTower.size].hitRadius;
      const startOffset = new Point(allyRadius * Math.cos(dir), allyRadius * Math.sin(dir));
      const endOffset = new Point(-enemyRadius * Math.cos(dir), -enemyRadius * Math.sin(dir));
      const newMinion: Minion = {
        location: allyTower.location.sum(startOffset),
        targetLocation: enemyTower.location.sum(endOffset),
        direction: dir,
        size: minionSize,
        targetTowerId: enemyTowerId,
        reachedTarget: false,
      };
      const newMinionId = ++this.maxMinionId;
      this.minions[newMinionId] = newMinion;
      player.minionIds.push(newMinionId);
      enemyTower.enemyMinionIds.push(newMinionId);
    } else {
      updateDisplay(userId, `${allyTower.location} -> ${enemyTower.location} ; Not enough money`);
    }
  }

  public removeMinion(minionId: number) {
    for (const player of Object.values(this.players)) {
      const minion = this.getMinion(minionId);
      const targetTower = this.getTower(minion.targetTowerId ?? assert.fail());
      const idx2 = targetTower.enemyMinionIds.indexOf(minionId);
      targetTower.enemyMinionIds.splice(idx2, 1);

      const idx = player.minionIds.indexOf(minionId);
      if (idx !== -1) {
        player.minionIds.splice(idx, 1);
      }
    }
    delete this.minions[minionId];
  }

  public explode(userId: string, towerId: number) {
    const tower = this.getTower(towerId);
    for (const enemyMinionId of tower.enemyMinionIds) {
      this.removeMinion(enemyMinionId);
    }
    tower.enemyMinionIds = [];
  }

  public gameLoop() {
    this.timeUpdate(1000 / FPS);
    this.sendGameState();

    const elapsed = Date.now() - this.startTime;
    if (this.winnerId !== null || elapsed < MAX_GAME_LEN_M * 60 * 1000) {
      setTimeout(this.gameLoop, 1000 / FPS);
    } else {
      this.onGameEnd();
    }
  }

  public sendGameState() {
    const gameUpdateData: GameUpdateData = {
      time: Date.now(),
      hostId: this.hostId,
      idToName: this.idToName,
      playerToTeamId: this.playerToTeamId,
      activeStatus: this.activeStatus,
      winnerId: this.winnerId,
      players: this.players,
      towers: this.towers,
      minions: this.minions,
    };
    getIo().in(this.gameCode).emit("gameUpdate", gameUpdateData);
  }

  public onGameEnd() {
    this.activeStatus = "inactive";
  }

  public timeUpdate(delta_t_s: number) {
    this.updateMinionLocs(delta_t_s);
    this.updateMinionDamage(delta_t_s);
    this.updateTowerRegenHealth(delta_t_s);
    this.updateTowerDeath(delta_t_s);
    this.updateGold(delta_t_s);
  }

  public updateMinionLocs(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const minionId of player.minionIds) {
        const minion = this.getMinion(minionId);
        if (!minion.reachedTarget) {
          const speed = minionConstants[minion.size].speed;
          const xSpeed = speed * Math.cos(minion.direction);
          const ySpeed = speed * Math.sin(minion.direction);
          minion.location.x += xSpeed * delta_t_s;
          minion.location.y += ySpeed * delta_t_s;
          if ((minion.location.x - minion.targetLocation.x) * xSpeed > 0) {
            minion.location = minion.targetLocation;
            minion.reachedTarget = true;
          }
        }
      }
    }
  }

  public updateMinionDamage(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const minionId of player.minionIds) {
        const minion = this.getMinion(minionId);
        if (minion.targetTowerId && minion.reachedTarget) {
          const targetTower = this.getTower(minion.targetTowerId);
          targetTower.health = Math.max(
            targetTower.health - minionConstants[minion.size].damageRate * delta_t_s,
            -1
          );
        }
      }
    }
  }

  public updateTowerRegenHealth(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        const maxHealth = towerConstants[tower.size].health;
        tower.health = Math.min(
          tower.health + towerConstants[tower.size].healthRegenRate * delta_t_s,
          maxHealth
        );
      }
    }
  }

  public updateTowerDeath(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        if (tower.health <= 0) {
          this.removeTower(towerId);
        }
      }
    }
  }

  public updateGold(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        player.gold += towerConstants[tower.size].goldRate * delta_t_s;
      }
    }
  }

  public updateGamePanelClickState(userId: string, clickType: ClickState, size: Size) {
    console.log(`D ${clickType} ${size}`);
    const player = this.getPlayer(userId);
    player.clickState = clickType;
    player.sizeClicked = size;
  }

  public getClickedAllyTowerId(userId: string, loc: Point) {
    const player = this.getPlayer(userId);
    for (const towerId of player.towerIds) {
      const tower = this.getTower(towerId);
      if (tower.location.distanceTo(loc) <= towerConstants[tower.size].hitRadius) {
        return towerId;
      }
    }
    return -1;
  }

  public getClickedEnemyTowerId(userId: string, loc: Point) {
    for (const otherId of Object.keys(this.players)) {
      if (otherId !== userId) {
        const possTowerId = this.getClickedAllyTowerId(otherId, loc);
        if (possTowerId !== -1) {
          return possTowerId;
        }
      }
    }
    return -1;
  }

  public updateGameMapClickState(userId: string, x: number, y: number) {
    console.log(`D ${x} ${y}`);
    const player = this.getPlayer(userId);
    const loc = new Point(x, y);
    if (player.clickState === ClickState.Minion || player.clickState === ClickState.Explosion) {
      const allyTowerId = this.getClickedAllyTowerId(userId, loc);
      if (allyTowerId !== -1) {
        if (player.clickState === ClickState.Minion) {
          player.clickState = ClickState.MinionFirstTower;
          player.towerClickedId = allyTowerId;
        } else {
          // ClickState.Explosion
          this.explode(userId, allyTowerId);
        }
      } else {
        updateDisplay(userId, "Must click on an ally tower");
      }
    } else if (player.clickState === ClickState.Tower) {
      this.addTower(userId, player.sizeClicked, loc);
    } else {
      // ClickState.MinionFirstTower
      const enemyTowerId = this.getClickedEnemyTowerId(userId, loc);
      if (enemyTowerId !== -1) {
        this.addMinion(userId, player.sizeClicked, player.towerClickedId, enemyTowerId);
      } else {
        updateDisplay(userId, "Must click on an enemy tower");
      }
    }
  }

  /** Checks whether a player has won, if a player won, change the game state */
  public checkWin() {
    // TODO
  }
}

module.exports = {
  Game,
};
