import express from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import { Request, Response, NextFunction } from "express";

import GameModel from "./models/Game";
import Game from "./models/Game";
import UserModel from "./models/User";
import MapModel from "./models/Map";
import { Mongoose } from "mongoose";
import { getTokenSourceMapRange, isAssertionExpression } from "typescript";

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

router.post("/createMap", (req: Request, res: Response) => {
  const newMap = new MapModel({
    name: req.body.name,
    creator_id: req.body.creator_id,
    num_players: req.body.num_players,
    gold_mines: req.body.gold_mines,
    towers: req.body.towers,
    created: req.body.created,
  });
  newMap.save().then(() => {
    res.status(200).send({ msg: "Successfully created map" });
  });
});

router.post("/createGame", (req: Request, res: Response) => {
  const newGame = new GameModel({
    is_private: req.body.is_private,
    game_code: req.body.game_code,
    map_id: req.body.map_id,
    created: Date.now(),
    creator_id: req.user ? req.user._id : "FAILED",
    players_ids: [req.user ? req.user._id : "FAILED"],
  });
  newGame.save().then(() => {
    res.status(200).send({ msg: "Success!" });
  });
});

// gets all games with a certain creator then takes the last one
router.get("/getGameByCreatorId", async (req: Request, res: Response) => {
  const allGames = await GameModel.find({ creator_id: req.query.creator_id!.toString() });
  if (allGames.length === 0) {
    console.log("didnt find anything");
    res.send({ msg: "Error" });
  } else {
    const lastStudent = allGames[allGames.length - 1];
    res.send({
      msg: "No Error",
      is_private: lastStudent.is_private,
      game_code: lastStudent.game_code,
      map_id: lastStudent.map_id,
      creator_id: lastStudent.creator_id,
      players_ids: lastStudent.players_ids,
    });
  }
});

router.post("/joinGame", async (req: Request, res: Response) => {
  const currGame = await GameModel.findOne({ game_code: req.body.game_code });
  const newIds = [...currGame.players_ids];
  newIds.push(req.user ? req.user._id : "FAILED");
  currGame.players_ids = newIds;
  await currGame.save();
  res.send({
    is_private: currGame.is_private,
    game_code: currGame.game_code,
    map_id: currGame.map_id,
    creator_id: currGame.creator_id,
    players_ids: currGame.players_ids,
  });
});

router.post("/leaveGame", async (req: Request, res: Response) => {
  const currGame = await GameModel.findOne({ game_code: req.body.game_code });
  const newIds = [...currGame.players_ids];
  const reqUserId = req.user ? req.user._id : "FAILED";
  const index = newIds.indexOf(reqUserId, 0);
  if (index > -1) {
    newIds.splice(index, 1);
  }
  currGame.players_ids = newIds;
  await currGame.save();
  res.send({
    is_private: currGame.is_private,
    game_code: currGame.game_code,
    map_id: currGame.map_id,
    creator_id: currGame.creator_id,
    players_ids: currGame.players_ids,
  });
});

// destroys the game in the database
router.post("/destroyGame", (req: Request, res: Response) => {
  GameModel.deleteMany({ creator_id: req.body.creator_id!.toString() }).then(() => {
    res.send({ msg: "Succesfully deleted" });
  });
});

router.get("/getUserName", async (req: Request, res: Response) => {
  const userObject = await UserModel.findOne({ _id: req.query.userId?.toString() });
  res.send({ userName: userObject.name });
});

router.get("/getPublicGames", (req: Request, res: Response) => {
  GameModel.find({ is_private: "public" }).then((lobbies: Array<typeof Game>) => {
    console.log(lobbies);
    res.send(lobbies);
  });
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req: Request, res: Response) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
