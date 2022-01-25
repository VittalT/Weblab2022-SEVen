import assert, { throws } from "assert";
import { updateDisplay, getIo, endGame } from "../server-socket";
import { ClickState, Size } from "../../shared/enums";
import Point from "../../shared/Point";
import Minion from "../../shared/Minion";
import Tower from "../../shared/Tower";
import Player from "../../shared/Player";
import {
  towerConstants,
  minionConstants,
  FPS,
  MAX_GAME_LEN_M,
  GoldConstants,
  canvasDimensions,
} from "../../shared/constants";
import { explosionConstants } from "../../shared/constants";
import GameMapModel, { GameMap } from "../models/Map";
import UserModel, { User } from "../models/User";

export class Game {
  private readonly gameCode: string;
  private readonly gameType: string;
  private hostId: string;
  private readonly playerIds: Array<string>;
  private readonly idToName: Record<string, string>;
  private isActive: boolean;
  private isInPlay: boolean;
  private isRated: boolean;

  private startTime: number;
  private winnerId: string | null;
  private readonly towers: Record<number, Tower>; // maps tower ID to tower object
  private maxTowerId: number;
  private readonly minions: Record<number, Minion>; // maps minion ID to minion object
  private maxMinionId: number;
  private readonly players: Record<string, Player>; // maps playerId to player object
  private readonly playerToTeamId: Record<string, number>; // maps userId to teamId

  private gameMapId: string;
  private goldMineLocs: Array<Point>;

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
    this.isRated = true;

    this.startTime = Date.now();
    this.winnerId = null;
    this.towers = {} as Record<number, Tower>;
    this.maxTowerId = this.playerIds.length - 1;
    this.minions = {} as Record<number, Minion>;
    this.maxMinionId = 0;
    this.players = {} as Record<string, Player>;
    this.playerToTeamId = {} as Record<string, number>;
    this.gameMapId = "61ef3fcacd275e74b9034d3e"; // from mongo.db account: "No Gold Mines"
    this.goldMineLocs = []; // updated when game starts
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
    const index = this.playerIds.indexOf(userId);
    if (index !== -1) {
      this.playerIds.splice(index, 1);
    } else {
      console.log(`Error: Player ${userId}: ${userName} is not present`);
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

  public updateGameMap(gameMapId: string) {
    this.gameMapId = gameMapId;
    getIo().in(this.gameCode).emit("updateGameMap", {
      gameCode: this.gameCode,
      gameMapId: gameMapId,
    });
  }

  public updateGameIsRated(isRated: boolean) {
    this.isRated = isRated;
    getIo().in(this.gameCode).emit("updateGameIsRated", {
      gameCode: this.gameCode,
      isRated: isRated,
    });
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

  public getGameMapId(): string {
    return this.gameMapId;
  }

  public getGameIsRated(): boolean {
    return this.isRated;
  }

  public getPlayerNames(): Array<string> {
    return this.playerIds.map((name: string) => this.idToName[name].toString());
  }

  public toString(): string {
    return "Game With gameCode: " + this.gameCode;
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
    const ret = this.players[userId];
    if (ret !== undefined && ret != null) {
      return ret;
    } else {
      assert.fail(`userId ${userId} is ${ret}`);
    }
  }

  public getTower(towerId: number): Tower {
    const ret = this.towers[towerId];
    if (ret !== undefined && ret != null) {
      return ret;
    } else {
      assert.fail(`towerId ${towerId} is ${ret}`);
    }
  }

  public getMinion(minionId: number): Minion {
    const ret = this.minions[minionId];
    if (ret !== undefined && ret != null) {
      return ret;
    } else {
      assert.fail(`minionId ${minionId} is ${ret}`);
    }
  }

  public toggleInfo(userId: string) {
    const player = this.getPlayer(userId);
    player.showInfo = !player.showInfo;
  }

  public start() {
    this.startTime = Date.now();
    const numPlayers = this.playerIds.length;
    const angle = (2 * Math.PI) / numPlayers;
    if (numPlayers < 2 || numPlayers > 4) {
      // TODO change to 2 eventually!!
      getIo().in(this.gameCode).emit("gameStartFailed");
      return;
    }
    for (let teamId = 0; teamId < numPlayers; teamId++) {
      // console.log(teamId);
      const userId = this.playerIds[teamId];

      const player = new Player(50, [], [], ClickState.Tower, -1, Size.Small, false, true);
      this.players[userId] = player;
      this.playerToTeamId[userId] = teamId;

      const dir = angle * teamId;
      const startTowerLoc = new Point(800 + 300 * Math.cos(dir), 375 + 300 * Math.sin(dir));
      this.addTower(userId, Size.Small, startTowerLoc, true);
    }
    getIo().in(this.gameCode).emit("startGame", { gameCode: this.gameCode });
    this.setGoldMineLocs();
    this.isInPlay = true;
    this.winnerId = null;
    this.gameLoop();
  }

  public setGoldMineLocs() {
    GameMapModel.findOne({ _id: this.gameMapId }).then((map: GameMap) => {
      for (const goldMine of map.gold_mines) {
        const goldMineLoc = new Point(goldMine.x, goldMine.y);
        this.goldMineLocs.push(goldMineLoc);
      }
    });
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

  public isInBounds(userId: string, loc: Point, size: Size): boolean {
    const gameWidth = canvasDimensions.x;
    const gameHeight = canvasDimensions.y;
    const currTowerRadius = towerConstants[size].hitRadius;
    if (loc.x < currTowerRadius || loc.x > gameWidth - currTowerRadius) {
      return false;
    }
    if (loc.y < currTowerRadius || loc.y > gameHeight - currTowerRadius) {
      return false;
    }
    return true;
  }

  public addTower(userId: string, towerSize: Size, loc: Point, isFirstTower: boolean) {
    const player = this.getPlayer(userId);
    const towerSizeConstants = towerConstants[towerSize];
    if (!isFirstTower && towerSizeConstants.cost > player.gold) {
      updateDisplay(userId, "Not enough gold!");
    } else if (
      !isFirstTower &&
      !this.closeEnough(userId, loc, towerSizeConstants.maxAdjBuildRadius)
    ) {
      updateDisplay(userId, "Not close enough to an ally tower!");
    } else if (!isFirstTower && !this.farEnough(userId, loc, towerSize)) {
      updateDisplay(userId, "Too close to an existing tower!");
    } else if (!this.isInBounds(userId, loc, towerSize)) {
      updateDisplay(userId, "Too close to game borders!");
    } else {
      updateDisplay(userId, "Tower successfuly deployed");
      if (!isFirstTower) player.gold -= towerSizeConstants.cost;
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

    // remove clickState so future minions cannot be spawned from this tower
    for (const userId of this.playerIds) {
      const player = this.getPlayer(userId);
      if (player.towerClickedId === towerId) {
        player.clickState = ClickState.Tower;
      }
    }

    const copyEnemyMinionIds = [...tower.enemyMinionIds];
    for (const enemyMinionId of copyEnemyMinionIds) {
      this.removeMinion(enemyMinionId);
      // if minions are not removed, their enemyTowerId must be updated to null / nearest tower
    }
    for (const player of Object.values(this.players)) {
      const idx = player.towerIds.indexOf(towerId);
      if (idx !== -1) {
        player.towerIds.splice(idx, 1);
        console.log(`Player ${player} has tower ${tower}`);
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
      updateDisplay(userId, "Minion successfully deployed");
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
      updateDisplay(userId, "Not enough gold");
    }
  }

  // removes the minion from the game
  public removeMinion(minionId: number) {
    const minion = this.getMinion(minionId);
    if (minion.targetTowerId !== null) {
      const targetTower = this.getTower(minion.targetTowerId);
      const idx = targetTower.enemyMinionIds.indexOf(minionId);
      if (idx !== -1) {
        targetTower.enemyMinionIds.splice(idx, 1);
      } else {
        console.log(`Error: Target tower ${targetTower} doesn't have enemy minion ${minion}`);
      }
      for (const player of Object.values(this.players)) {
        const idx2 = player.minionIds.indexOf(minionId);
        if (idx2 !== -1) {
          player.minionIds.splice(idx2, 1);
          console.log(`Player ${player} has minion ${minion}`);
        }
      }
    } else {
      console.log(`Error: Minion ${minion} targetTowerId is null`);
    }
    delete this.minions[minionId];
  }

  public explode(userId: string, towerId: number) {
    const tower = this.getTower(towerId);
    const player = this.getPlayer(userId);
    const explosionCost = explosionConstants.cost;
    if (player.gold > explosionCost) {
      player.gold -= explosionCost;
      const copyEnemyMinionIds = [...tower.enemyMinionIds];
      for (const enemyMinionId of copyEnemyMinionIds) {
        this.removeMinion(enemyMinionId);
      }
    } else {
      updateDisplay(userId, "Not enough gold to explode this tower");
    }
  }

  public gameLoop() {
    const msPerUpdate = 1000 / FPS;
    this.timeUpdate(msPerUpdate);
    this.sendGameState();

    const elapsed = Date.now() - this.startTime;
    if (this.winnerId !== null) {
      console.log("Winner is not null, winner id is " + this.winnerId);
      this.onGameEnd();
    } else {
      setTimeout(this.gameLoop, msPerUpdate);
    }
  }

  // checks to see if a winner is left
  public checkWin() {
    let remainingPlayers = 0;
    let remainingPlayerId = "";
    if (Date.now() - this.startTime > 10 * 60 * 1000) {
      this.winnerId = this.playerIds[0];
    }
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
      this.winnerId = remainingPlayerId; // this will cause game to end on next refresh
      console.log(`1 remaining player: ${this.winnerId}`);
    }
  }

  public onGameEnd(): void {
    this.isInPlay = false;
    if (this.winnerId !== null) {
      const winnerName = this.idToName[this.winnerId];
      endGame(this.gameCode, winnerName);
      setTimeout(() => {
        endGame(this.gameCode, winnerName); // --- THIS IS A REALLY JANK FIX LOL - eric
      }, 1000);
    } else {
      console.log("Error: winnerId is null");
    }
    if (this.isRated) {
      this.adjustRatingsAll();
    }
    this.clearGame();
  }

  public adjustRatingsAll(): void {
    console.log(this.playerIds);
    for (const playerId of this.playerIds) {
      console.log(playerId);
      if (playerId !== this.winnerId) {
        console.log("at least one is discovered");
        this.adjustRatingsPair(this.winnerId ?? assert.fail("no winner Id"), playerId);
      }
    }
  }

  //id1 is the winner here
  public async adjustRatingsPair(id1: string, id2: string): Promise<void> {
    let id1Rating: number = 0;
    let id2Rating: number = 0;

    const user1 = await UserModel.findOne({ _id: id1 });
    id1Rating = user1.rating;
    const user2 = await UserModel.findOne({ _id: id2 });
    id2Rating = user2.rating;

    const user1prob = 1 / (1 + Math.pow(10, (id1Rating - id2Rating) / 400));
    const user2prob = 1 - user1prob;
    id1Rating += 30 * (1 - user1prob);
    id2Rating += 30 * (0 - user2prob);

    user1.rating = Math.round(id1Rating);
    user1.save();
    user2.rating = Math.round(id2Rating);
    user2.save();
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
      time: Date.now() - this.startTime,
      hostId: this.hostId,
      idToName: this.idToName,
      playerToTeamId: this.playerToTeamId,
      isActive: this.isActive,
      winnerId: this.winnerId,
      players: this.players,
      towers: this.towers,
      minions: this.minions,
      goldMineLocs: this.goldMineLocs,
    };
    getIo().in(this.gameCode).emit("gameUpdate", gameUpdateData);
  }

  public timeUpdate(delta_t_s: number) {
    this.updateMinionLocs(delta_t_s);
    this.updateMinionDamage(delta_t_s);
    this.updateTowerRegenHealth(delta_t_s);
    this.updateTowerDeath(delta_t_s);
    this.updateGold(delta_t_s);
    this.updateGoldMines(delta_t_s);
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

  public updateTowerDeath(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      const copyTowerIds = [...player.towerIds];
      for (const towerId of copyTowerIds) {
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
        player.gold += towerConstants[tower.size].goldRate * delta_t_s;
      }
    }
  }

  public updateGoldMines(delta_t_s: number) {
    const copyGoldMineLocs = [...this.goldMineLocs];
    for (const [idx, goldMineLoc] of copyGoldMineLocs.entries()) {
      let goldFound = false;
      const goldSize = GoldConstants.realRadius;
      for (const userId of this.playerIds) {
        const player = this.getPlayer(userId);
        for (const towerId of player.towerIds) {
          const tower = this.getTower(towerId);
          const towerSize = towerConstants[tower.size].hitRadius;
          if (goldMineLoc.distanceTo(tower.location) <= goldSize + towerSize) {
            goldFound = true;
          }
        }
        for (const minionId of player.minionIds) {
          const minion = this.getMinion(minionId);
          const minionSize = minionConstants[minion.size].boundingRadius;
          if (goldMineLoc.distanceTo(minion.location) <= goldSize + minionSize) {
            goldFound = true;
          }
        }
        if (goldFound) {
          console.log(`Player ${player} found gold ${goldMineLoc}!`);
          player.gold += GoldConstants.gold;
          this.goldMineLocs.splice(idx, 1);
          break;
        }
      }
    }
  }

  public updateGamePanelClickState(userId: string, clickType: ClickState, size: Size) {
    updateDisplay(userId, "Place or select tower");
    if (this.isInPlay === false) {
      return;
    }
    console.log(`Clicked panel ${clickType} ${size}`);
    const player = this.getPlayer(userId);
    player.clickState = clickType;
    player.sizeClicked = size;
  }

  public getClickedAllyTowerId(userId: string, loc: Point) {
    const player = this.getPlayer(userId);
    for (const towerId of player.towerIds) {
      const tower = this.getTower(towerId);
      const towerSize = towerConstants[tower.size].hitRadius;
      if (tower.location.distanceTo(loc) <= towerSize) {
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

  public updateGameMapClickState(userId: string, loc: Point) {
    updateDisplay(userId, "Place or select tower");
    if (this.isInPlay === false) {
      return;
    }
    console.log(`Clicked map ${loc}`);
    const player = this.getPlayer(userId);
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
        updateDisplay(userId, "Please click on an ally tower");
      }
    } else if (player.clickState === ClickState.Tower) {
      this.addTower(userId, player.sizeClicked, loc, false);
    } else {
      // ClickState.MinionFirstTower
      const enemyTowerId = this.getClickedEnemyTowerId(userId, loc);
      if (enemyTowerId !== -1) {
        this.addMinion(userId, player.sizeClicked, player.towerClickedId, enemyTowerId);
      } else {
        updateDisplay(userId, "Please click on an enemy tower");
      }
    }
  }
}

module.exports = {
  Game,
};
