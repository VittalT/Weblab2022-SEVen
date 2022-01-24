import assert, { throws } from "assert";
import { updateDisplay, getIo, endGame } from "../server-socket";
import { ClickState, Size } from "../../shared/enums";
import Point from "../../shared/Point";
import Minion from "../../shared/Minion";
import Tower from "../../shared/Tower";
import Player from "../../shared/Player";
import { towerConstants, minionConstants, FPS, MAX_GAME_LEN_M } from "../../shared/constants";
import { socket } from "../../client/src/client-socket";
import e from "express";

export class Game {
  private readonly gameCode: string;
  private readonly gameType: string;
  private hostId: string;
  private readonly playerIds: Array<string>;
  private readonly idToName: Record<string, string>;
  private isActive: boolean;
  private isInPlay: boolean;

  private readonly startTime: number;
  private winnerId: string | null;
  private readonly towers: Record<number, Tower>; // maps tower ID to tower object
  private maxTowerId: number;
  private readonly minions: Record<number, Minion>; // maps minion ID to minion object
  private maxMinionId: number;
  private readonly players: Record<string, Player>; // maps layerId to player object
  private readonly playerToTeamId: Record<string, number>; // maps userId to teamId

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
    this.isActive = true;
    this.isInPlay = false;

    this.startTime = Date.now();
    this.winnerId = null;
    this.towers = {} as Record<number, Tower>;
    this.maxTowerId = this.playerIds.length - 1;
    this.minions = {} as Record<number, Minion>;
    this.maxMinionId = 0;
    this.players = {} as Record<string, Player>;
    this.playerToTeamId = {} as Record<string, number>;
    this.gameLoop = this.gameLoop.bind(this);
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
        this.isActive = false;
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

  public getIsActive(): boolean {
    return this.isActive;
  }

  public setInActive(): void {
    this.isActive = false;
  }

  public getIsInPlay(): boolean {
    return this.isInPlay;
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
    const numPlayers = this.playerIds.length;
    const angle = (2 * Math.PI) / numPlayers;
    if (numPlayers < 1 || numPlayers > 4) {
      // EVENTUALLY, CHANGE TO TWO!!!!!!!!!!!!!!!!
      getIo().in(this.gameCode).emit("gameStartFailed");
      return;
    }
    for (let teamId = 0; teamId < numPlayers; teamId++) {
      console.log(teamId);
      const userId = this.playerIds[teamId];
      const startTowerId = teamId;
      const dir = angle * teamId;
      const startTowerLoc = new Point(800 + 300 * Math.cos(dir), 375 + 300 * Math.sin(dir));
      const startTower = new Tower(50, startTowerLoc, Size.Small, []);
      const player = new Player(
        50,
        [startTowerId],
        [],
        ClickState.Tower,
        startTowerId,
        Size.Small,
        false,
        true
      );
      this.towers[startTowerId] = startTower;
      this.players[userId] = player;
      this.playerToTeamId[userId] = teamId;
    }
    getIo().in(this.gameCode).emit("startGame", { gameCode: this.gameCode });
    this.isInPlay = true;
    this.winnerId = null;
    this.gameLoop();
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

  // i changed this function to check for all towers, and ensure that non overlap
  public farEnough(userId: string, loc: Point, size: Size): boolean {
    const currTowerRadius = towerConstants[size].hitRadius;
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const otherTower = this.getTower(towerId);
        const otherSize = otherTower.size;
        const otherRadius = towerConstants[otherSize].hitRadius;
        if (otherTower.location.distanceTo(loc) < currTowerRadius + otherRadius + 10) {
          return false;
        }
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
    } else if (!this.farEnough(userId, loc, towerSize)) {
      updateDisplay(userId, `${loc} ; Too close to an existing tower`);
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
      minion.targetTowerId = null; //-------------------------EITHER DELETE MINION OR REDIRECT IT!
    }
    for (const player of Object.values(this.players)) {
      const idx = player.towerIds.indexOf(towerId);
      if (idx !== -1) {
        player.towerIds.splice(idx, 1);
      }
    }
    delete this.towers[towerId];
  }

  // i skimmed this one lol - eric
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
      if (idx2 !== -1) {
        targetTower.enemyMinionIds.splice(idx2, 1);
      }

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
      const currMinion = this.getMinion(enemyMinionId);
      if (currMinion !== undefined) {
        if (currMinion.reachedTarget === true) {
          this.removeMinion(enemyMinionId);
        }
      }
    }
    tower.enemyMinionIds = [];
  }

  public gameLoop() {
    const msPerUpdate = 1000 / FPS;
    this.timeUpdate(msPerUpdate);
    this.sendGameState();

    const elapsed = Date.now() - this.startTime;
    if (this.winnerId !== null) {
      console.log("got here, winner id is " + this.winnerId);
      this.onGameEnd();
    } else {
      setTimeout(this.gameLoop, msPerUpdate);
    }
  }

  // checks to see if a winner is left
  public checkWin() {
    let remainingPlayers = 0;
    let remainingPlayerId = "";
    for (const playerId of Object.keys(this.players)) {
      const player = this.players[playerId];
      if (player.towerIds.length === 0) {
        player.inGame = false;
      }
      if (player.inGame === true) {
        remainingPlayers += 1;
        remainingPlayerId = playerId;
      }
    }
    if (remainingPlayers === 1) {
      console.log("got here");
      this.winnerId = remainingPlayerId; // this will cause game to end on next refresh
      console.log(this.winnerId);
    }
  }

  public onGameEnd(): void {
    this.isInPlay = false;
    console.log("inside onGameEnd, winner id is " + this.winnerId);
    if (this.winnerId !== null) {
      const winnerName = this.idToName[this.winnerId];
      endGame(this.gameCode, winnerName);
      setTimeout(() => {
        endGame(this.gameCode, winnerName); // --- THIS IS A REALLY JANK FIX LOL - eric
      }, 1000);
    } else {
      console.log("Error: winnerId is null");
    }
    this.clearGame();
  }

  public clearGame(): void {
    this.winnerId = null;
    for (const key in this.towers) {
      if (this.towers.hasOwnProperty(key)) {
        delete this.towers[key];
      }
    }
    this.maxTowerId = 0;
    for (const key in this.minions) {
      if (this.minions.hasOwnProperty(key)) {
        delete this.minions[key];
      }
    }
    this.maxMinionId = 0;
    for (const key in this.players) {
      if (this.players.hasOwnProperty(key)) {
        delete this.players[key];
      }
    }
    for (const key in this.playerToTeamId) {
      if (this.playerToTeamId.hasOwnProperty(key)) {
        delete this.playerToTeamId[key];
      }
    }
  }

  public sendGameState() {
    const gameUpdateData = {
      time: Date.now(),
      hostId: this.hostId,
      idToName: this.idToName,
      playerToTeamId: this.playerToTeamId,
      isActive: this.isActive,
      winnerId: this.winnerId,
      players: this.players,
      towers: this.towers,
      minions: this.minions,
    };
    getIo().in(this.gameCode).emit("gameUpdate", gameUpdateData);
  }

  public timeUpdate(delta_t_s: number) {
    this.updateMinionLocs(delta_t_s);
    this.updateMinionDamage(delta_t_s);
    this.updateTowerRegenHealth(delta_t_s);
    this.updateTowerDeath(delta_t_s);
    this.updateGold(delta_t_s);
    this.checkWin();
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
          if (targetTower !== undefined) {
            targetTower.health = Math.max(
              targetTower.health - minionConstants[minion.size].damageRate * delta_t_s,
              -1
            );
          }
        }
      }
    }
  }

  public updateTowerRegenHealth(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        if (tower !== undefined) {
          if (tower.enemyMinionIds.length === 0) {
            const maxHealth = towerConstants[tower.size].health;
            tower.health = Math.min(
              tower.health + towerConstants[tower.size].healthRegenRate * delta_t_s,
              maxHealth
            );
          }
        }
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
    // think this function was bugged earlier
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        if (tower !== undefined) {
          player.gold += towerConstants[tower.size].goldRate * delta_t_s;
        }
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

  // returns -1 if none, otherwise the enemy tower ID if it was clicked
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
}

module.exports = {
  Game,
};
