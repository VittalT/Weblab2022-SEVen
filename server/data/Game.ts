const { getIo } = require("../server-socket");

class Game {
  private readonly gameCode: string;
  private readonly gameType: string;
  private readonly hostId: string;
  private readonly playerIds: Array<string>;
  private readonly idToName: Map<string, string>;

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
  }

  // updates all frontend playerlobbies to include most recent information
  public updateLobbies() {
    const hostName = this.idToName.get(this.hostId);
    const playerNames = this.playerIds.map((name: string) => this.idToName.get(name));
    const data = {
      gameType: this.gameType,
      gameCode: this.gameCode,
      hostName: hostName,
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

  public hasPlayer(userId: string): boolean {
    return this.playerIds.includes(userId);
  }
}

module.exports = {
  Game,
};
