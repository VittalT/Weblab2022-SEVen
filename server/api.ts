import express from "express";
import auth from "./auth";
import { Request, Response, NextFunction } from "express";

// socket stuff:
const { getSocketFromUserID } = require("./server-socket");
import socketManager from "./server-socket";
const { games } = require("./data/games");
const { Game } = require("./data/Game");
const { clients } = require("./data/clients");

// util
const { generateGameCode } = require("./util");

import GameModel from "./models/Game";
import UserModel from "./models/User";
import MapModel from "./models/Map";
import { Mongoose } from "mongoose";
import {
  getTokenSourceMapRange,
  isAssertionExpression,
  isShorthandPropertyAssignment,
} from "typescript";
import { minionConstants, towerConstants } from "./models/GameState";
import assert from "assert";
const logic = require("./logic");

const router = express.Router();

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({ msg: "not logged in" });
  }
  res.send(req.user);
});

router.post("/initsocket", (req: Request, res: Response) => {
  // do nothing if user not logged in
  if (req.user) {
    const socket = socketManager.getSocketFromSocketID(req.body.socketid);
    if (socket !== undefined) socketManager.addUser(req.user, socket);
  }
  res.send({});
});

router.get("/getCurrRoomGameCode", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (userId in clients) {
    res.send({ gameCode: clients[userId].gameCode });
  } else {
    res.send({ gameCode: "none" });
  }
});

// req has only paramter public vs private
// this function creates a completely new game and updates all the backend data but does ont modify sockets
// it also calls updateLobbies(), which shouldmodify the frontend
router.post("/createGame", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const userId = req.user!._id;
  const userName = req.user!.name;
  const gameType = req.body.gameType;

  // do the other stuff
  let gameCode = generateGameCode(6);
  while (gameCode in games) {
    gameCode = generateGameCode(6);
  }
  const currGame = new Game(gameCode, gameType, userId, userName, [userId]);
  games[gameCode] = currGame;
  // leave the current game if the user is already in a game
  if (userId in clients && clients[userId].gameCode !== gameCode) {
    getSocketFromUserID[userId].leave(clients[userId].gameCode);
  }
  clients[userId] = {
    gameCode: gameCode,
  };
  currGame.updateLobbies;
  res.send({ gameCode: gameCode });
});

router.post("/joinGame", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const userId = req.user!._id;
  const userName = req.user!.name;
  const gameCode = req.body.gameCode;

  const currGame = games[gameCode];
  const joinedStatus = currGame.join(userId, userName);
  if (joinedStatus) {
    // leave the current game if the user is already in a game
    if (userId in clients && clients[userId].gameCode !== gameCode) {
      getSocketFromUserID[userId].leave(clients[userId].gameCode);
    }
    clients[userId] = {
      gameCode: gameCode,
    };
    currGame.updateLobbies;
    res.send({ gameCode: gameCode });
  }
});

router.post("/leaveGame", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const userId = req.user!._id;
  const userName = req.user!.name;
  const gameCode = req.body.gameCode;

  const currGame = games[gameCode];
  const leftStatus = currGame.leave(userId, userName);
  if (userId in clients) {
    delete clients[userId];
  }

  currGame.updateLobbies;
  res.send({ gameCode: gameCode });
});

router.post("/getLobbyInfo", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const userId = req.user!._id;
  const gameCode: string = clients[userId].gameCode;
  const currGame = games[gameCode];
  res.send({
    gameType: currGame.getGameType(),
    gameCode: currGame.getGameCode(),
    hostName: currGame.getHostName(),
    playerNames: currGame.getPlayerNames(),
  });
});

router.get("/getPublicGames", auth.ensureLoggedIn, (req: Request, res: Response) => {
  const data = new Array<{ hostName: string; gameCode: string }>();
  for (const gameCode of Object.keys(games)) {
    const game = games[gameCode];
    if (game.getGameType() === "public" && game.isActive === "true") {
      data.push({ hostName: game.getHostName(), gameCode: game.getGameCode() });
    }
  }
  res.send(data);
});

router.post("/createMap", (req: Request, res: Response) => {
  const newMap = new MapModel({
    name: req.body.name,
    creator_id: req.body.creator_id,
    creator_name: req.body.creator_name,
    num_players: req.body.num_players,
    gold_mines: req.body.gold_mines,
    towers: req.body.towers,
    created: req.body.created,
  });
  newMap.save().then(() => {
    res.status(200).send({ msg: "Successfully created map" });
  });
});

// returns false if game does not exist
router.post("/getGameActiveStatus", (req: Request, res: Response) => {
  const gameCode = req.body.gameCode;
  if (!(gameCode in Object.keys(games))) {
    res.send({ status: "false" });
  } else {
    const currGame = games[gameCode];
    res.send({
      status: currGame.getActiveStatus(),
    });
  }
});

router.post("/startGame", (req: Request, res: Response) => {
  console.log(req.body.gameCode);
  logic.createGameState(parseInt(req.body.gameId), req.body.userIds);
  res.send({});
});

// router.get("/gameConstants", (req: Request, res: Response) => {
//   res.send({ minionConstants: minionConstants, towerConstants: towerConstants });
// });

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req: Request, res: Response) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
