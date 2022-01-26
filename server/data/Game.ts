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
  playerConstants,
} from "../../shared/constants";
import { explosionConstants } from "../../shared/constants";
import GameMapModel, { GameMap } from "../models/Map";
import UserModel, { User } from "../models/User";
import { GameUpdateData } from "../../shared/types";

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
    const data = {
      gameType: this.gameType,
      gameCode: this.gameCode,
      hostName: hostName,
      hostId: this.hostId,
      playerIds: this.playerIds,
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

  public getPlayerIds(): Array<string> {
    return this.playerIds;
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

  public getTeamIdToName(): Record<number, string> {
    const teamIdToName: Record<number, string> = [];
    for (const userId in this.playerToTeamId) {
      const name = this.idToName[userId];
      const teamId = this.playerToTeamId[userId];
      teamIdToName[teamId] = name;
    }
    return teamIdToName;
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

  // public toggleInfo(userId: string) {
  //   const player = this.getPlayer(userId);
  //   player.showInfo = !player.showInfo;
  // }

  public start() {
    this.startTime = Date.now();
    const numPlayers = this.playerIds.length;
    const angle = (2 * Math.PI) / numPlayers;
    if (numPlayers < 2 || numPlayers > playerConstants.maxPlayers) {
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
      const startTowerLoc = new Point(
        canvasDimensions.width / 2 + 300 * Math.cos(dir),
        canvasDimensions.height / 2 + 300 * Math.sin(dir)
      );
      this.addTower(userId, Size.Small, startTowerLoc, true, false);
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
    const gameWidth = canvasDimensions.width;
    const gameHeight = canvasDimensions.height;
    const currTowerRadius = towerConstants[size].hitRadius;
    if (loc.x < currTowerRadius || loc.x > gameWidth - currTowerRadius) {
      return false;
    }
    if (loc.y < currTowerRadius || loc.y > gameHeight - currTowerRadius) {
      return false;
    }
    return true;
  }

  public closeToTombstone(player: Player, towerSize: Size, loc: Point): boolean {
    const towerRadius = towerConstants[towerSize].hitRadius;
    for (const tombstone of player.tombstones) {
      const tombstoneRadius = towerConstants[tombstone.tower.size].hitRadius;
      const timeFromDestroyed = (Date.now() - tombstone.time) / 1000;
      if (
        timeFromDestroyed < playerConstants.tombstoneCooldown &&
        loc.distanceTo(tombstone.tower.location) < towerRadius + tombstoneRadius + 10
      )
        return true;
    }
    return false;
  }

  public addTower(
    userId: string,
    towerSize: Size,
    loc: Point,
    isFirstTower: boolean,
    isTest: boolean
  ): boolean {
    const player = this.getPlayer(userId);
    const towerSizeConstants = towerConstants[towerSize];
    const timeFromLastTower = (Date.now() - player.lastTowerPlacedTime) / 1000;
    if (!isFirstTower && timeFromLastTower < playerConstants.towerCooldown) {
      updateDisplay(
        userId,
        `${playerConstants.towerCooldown} second tower cooldown to place tower!`
      );
    } else if (!isFirstTower && this.closeToTombstone(player, towerSize, loc)) {
      updateDisplay(
        userId,
        `${playerConstants.tombstoneCooldown} second cooldown to place near tombstone!`
      );
    } else if (!isFirstTower && player.gold < towerSizeConstants.cost) {
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
      updateDisplay(userId, isTest ? "Tower ready to place" : "Tower successfuly deployed");
      if (!isTest) {
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
        player.lastTowerPlacedTime = Date.now();
      }
      return true;
    }
    return false;
  }

  public removeTower(towerId: number) {
    const tower = this.getTower(towerId);

    // remove clickState so future minions cannot be spawned from this tower
    for (const userId of this.playerIds) {
      console.log("RT");
      const player = this.getPlayer(userId);
      if (player.towerIds)
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

  public changeTowerHealth(tower: Tower, amount: number) {
    // would display health bar weird if player.gold was out of range [-1, startRating]
    tower.health += amount;
    const maxHealth = towerConstants[tower.size].health;
    if (tower.health > maxHealth) tower.health = maxHealth;
    if (tower.health < -1) tower.health = -1;
  }

  // i skimmed this one lol - eric
  public addMinion(
    userId: string,
    minionSize: Size,
    allyTowerId: number,
    enemyTowerId: number,
    isTest: boolean
  ): boolean {
    const player = this.getPlayer(userId);

    const minionSizeConstants = minionConstants[minionSize];
    const allyTower = this.getTower(allyTowerId);
    const enemyTower = this.getTower(enemyTowerId);

    if (player.gold >= minionSizeConstants.cost) {
      updateDisplay(userId, isTest ? "Minion ready to send" : "Minion successfully deployed");
      if (!isTest) {
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
      }
      return true;
    } else {
      updateDisplay(userId, "Not enough gold");
      return false;
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
    if (player.gold >= explosionCost) {
      player.gold -= explosionCost;
      const copyEnemyMinionIds = [...tower.enemyMinionIds];
      for (const enemyMinionId of copyEnemyMinionIds) {
        this.removeMinion(enemyMinionId);
      }
    } else {
      updateDisplay(userId, "Not enough gold to explode this tower");
    }
  }

  public explodeNearby(userId: string, towerId: number) {
    const tower = this.getTower(towerId);
    const towerRadius = towerConstants[tower.size].hitRadius;
    const player = this.getPlayer(userId);
    if (player.gold > explosionConstants.cost) {
      player.gold -= explosionConstants.cost;
      for (const [minionId, minion] of [...Object.entries(this.minions)]) {
        const minionRadius = minionConstants[minion.size].boundingRadius;
        if (
          tower.location.distanceTo(minion.location) <=
          towerRadius + minionRadius + explosionConstants.range
        ) {
          this.removeMinion(parseInt(minionId));
        }
      }
      for (const [tower2Id, tower2] of [...Object.entries(this.towers)]) {
        const tower2Radius = towerConstants[tower2.size].hitRadius;
        if (
          tower.location.distanceTo(tower2.location) <=
          towerRadius + tower2Radius + explosionConstants.range
        ) {
          const damage = -explosionConstants.explosionHealthDamage;
          this.changeTowerHealth(tower2, damage);
        }
      }
    } else {
      updateDisplay(userId, "Not enough gold to explode this tower");
    }
  }
  public forfeit(playerId: string) {
    const player: Player = this.getPlayer(playerId);
    const towerIdsCopy = [...player.towerIds];
    const minionIdsCopy = [...player.minionIds];
    for (const towerId of towerIdsCopy) {
      this.removeTower(towerId);
      console.log("RTF");
    }
    for (const minionId of minionIdsCopy) {
      this.removeMinion(minionId);
      console.log("RMF");
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
    if (Date.now() - this.startTime > 0.1 * 60 * 1000) {
      this.winnerId = this.mostHealth();
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

  // returns id of player with the most health
  public mostHealth(): string {
    let winnerId = this.playerIds[0];
    let maxHealth = 0;
    for (const playerId of this.playerIds) {
      const player: Player = this.getPlayer(playerId);
      if (player !== undefined && player.inGame) {
        let totalHealth = 0;
        for (const towerId of player.towerIds) {
          const tower: Tower = this.getTower(towerId);
          if (tower !== undefined) {
            totalHealth += tower.health;
          }
        }
        if (totalHealth > maxHealth) {
          winnerId = playerId;
          maxHealth = totalHealth;
        }
      }
    }
    return winnerId;
  }

  public async onGameEnd(): Promise<void> {
    console.log("A");
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
    if (this.isRated && this.winnerId !== null) {
      await this.adjustRatingsAll();
      this.sendGameState();
    }
    await this.updatePlayerStats();
    this.clearGame();
  }

  public async updatePlayerStats(): Promise<void> {
    for (const playerId of this.playerIds) {
      const user = await UserModel.findById(playerId);
      user.games_played += 1;
      if (playerId === this.winnerId) {
        user.games_won += 1;
      }
      user.save();
    }
  }

  public async adjustRatingsAll(): Promise<void> {
    console.log("B");
    console.log(this.playerIds);
    for (const playerId of this.playerIds) {
      console.log(playerId);
      if (playerId !== this.winnerId) {
        console.log("at least one is discovered");
        await this.adjustRatingsPair(this.winnerId ?? assert.fail("no winner Id"), playerId);
      }
    }
  }

  public async adjustRatingsPair(winnerId: string, loserId: string): Promise<boolean> {
    console.log("YES");
    const winnerUser = await UserModel.findById(winnerId);
    let winnerIdRating = winnerUser.rating;
    console.log(winnerIdRating);
    console.log("RP1");
    const winner = this.getPlayer(winnerId);
    winner.prevRating = winnerIdRating;
    console.log(winner);

    const loserUser = await UserModel.findById(loserId);
    let loserIdRating = loserUser.rating;
    console.log("RP2");
    const loser = this.getPlayer(loserId);
    loser.prevRating = loserIdRating;

    const winnerExpectedProb = 1 / (1 + Math.pow(10, (loserIdRating - winnerIdRating) / 400));
    const loserExpectedProb = 1 - winnerExpectedProb;
    winnerIdRating += loserUser + 30 * (1 - winnerExpectedProb);
    loserIdRating += winnerUser + 30 * (0 - loserExpectedProb);

    winnerUser.rating = Math.round(winnerIdRating);
    winner.rating = winnerUser.rating;
    winnerUser.all_time_rating = Math.max(winnerUser.all_time_rating, winnerUser.rating);
    winnerUser.save();
    loserUser.rating = Math.round(loserIdRating);
    loser.rating = loserUser.rating;
    loserUser.all_time_rating = Math.max(loserUser.all_time_rating, loserUser.rating);
    loserUser.save();
    return true;
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
    const gameUpdateData: GameUpdateData = {
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
    this.updateGold(delta_t_s);
    this.updateGoldMines(delta_t_s);
    this.updateMinionLocs(delta_t_s);
    this.updateTowerRegenHealth(delta_t_s);
    this.updateMinionDamage(delta_t_s);
    this.updateTowerDeath(delta_t_s);
    this.updateCanPlaceTower(delta_t_s);
    this.updateCanExplode(delta_t_s);
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
          const damage = -minionConstants[minion.size].damageRate * delta_t_s;
          this.changeTowerHealth(targetTower, damage);
        }
      }
    }
  }

  public updateTowerRegenHealth(delta_t_s: number) {
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        if (tower.enemyMinionIds.length === 0) {
          const healthRegen = towerConstants[tower.size].healthRegenRate * delta_t_s;
          this.changeTowerHealth(tower, healthRegen);
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
          player.tombstones.push({ time: Date.now(), tower: tower });
        }
      }
    }
  }

  public updateGold(delta_t_s: number) {
    // think this function was bugged earlier
    for (const player of Object.values(this.players)) {
      for (const towerId of player.towerIds) {
        const tower = this.getTower(towerId);
        const genGold = towerConstants[tower.size].goldRate * delta_t_s;
        player.gold += genGold;
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

  public updateCanPlaceTower(delta_t_s: number) {
    for (const [userId, player] of Object.entries(this.players)) {
      // check if the location passes all the checks, without actually adding a tower
      player.canPlaceTower = this.addTower(
        userId,
        player.sizeClicked,
        player.cursorLoc,
        false,
        true
      );
    }
  }

  public updateCanExplode(delta_t_s: number) {
    for (const [userId, player] of Object.entries(this.players)) {
      const allyTowerId = this.getClickedAllyTowerId(userId, player.cursorLoc);
      // console.log(`ally ${allyTowerId}`);
      if (allyTowerId !== -1) {
        player.canExplode = true;
        player.hoverAllyTower = this.getTower(allyTowerId);
      } else {
        player.canExplode = false;
      }
    }
  }

  public updateGamePanelClickState(userId: string, clickType: ClickState, size: Size) {
    updateDisplay(userId, "Place or select tower");
    if (this.isInPlay === false) {
      return;
    }
    console.log(`Clicked panel ${clickType} ${size}`);
    console.log("A1");
    const player = this.getPlayer(userId);
    player.clickState = clickType;
    player.sizeClicked = size;
  }

  public getClickedAllyTowerId(userId: string, loc: Point) {
    console.log("A2");
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
          this.explodeNearby(userId, allyTowerId);
        }
      } else {
        updateDisplay(userId, "Please click on an ally tower");
      }
    } else if (player.clickState === ClickState.Tower) {
      this.addTower(userId, player.sizeClicked, loc, false, false);
    } else {
      // ClickState.MinionFirstTower
      const enemyTowerId = this.getClickedEnemyTowerId(userId, loc);
      if (enemyTowerId !== -1) {
        this.addMinion(userId, player.sizeClicked, player.towerClickedId, enemyTowerId, false);
      } else {
        updateDisplay(userId, "Please click on an enemy tower");
      }
    }
  }

  public updateGameMapCursorLoc(userId: string, loc: Point) {
    if (this.isInPlay === false) {
      return;
    }
    console.log("A4");
    const player = this.getPlayer(userId);
    player.cursorLoc = loc;
  }
}

module.exports = {
  Game,
};
