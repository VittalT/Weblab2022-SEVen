const { getIo } = require("../server-socket");

class Game {
  private readonly gameCode: string;
  private readonly gameType: string;
  private hostId: string;
  private readonly playerIds: Array<string>;
  private readonly idToName: Map<string, string>;
  private activeStatus: string;

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
    this.idToName = new Map<string, string>();
    this.idToName.set(hostId, hostName);
    this.activeStatus = "active";
  }

  // updates all frontend playerlobbies to include most recent information
  public updateLobbies() {
    const hostName = this.idToName.get(this.hostId);
    const playerNames = this.playerIds.map((name: string) => this.idToName.get(name));
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
    this.idToName.set(userId, userName);
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
    return true;
  }

  public hasPlayer(userId: string): boolean {
    return this.playerIds.includes(userId);
  }

  public getGameType(): string {
    return this.gameType;
  }

  public getHostName(): string {
    return this.idToName.get(this.hostId)!;
  }

  public getGameCode(): string {
    return this.gameCode;
  }

  public getPlayerNames(): Array<string> {
    const playerNames = this.playerIds.map((name: string) => this.idToName.get(name)!.toString());
    return playerNames;
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
}

module.exports = {
  Game,
};
