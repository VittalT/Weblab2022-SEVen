import express from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import { Request, Response, NextFunction } from "express";

import GameModel from "./models/Game";
import { Mongoose } from "mongoose";

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

router.post("/createGame", (req: Request, res: Response) => {
  const newGame = new GameModel({
    isPrivate: req.body.isPrivate,
    gameCode: req.body.gameCode,
    mapId: req.body.mapId,
    created: Date.now(),
    creatorId: req.user,
    playersIds: [req.user],
  });
  newGame.save().then(() => {
    res.status(200).send({ msg: "Success!" });
  });
});

router.get("/getGame", async (req: Request, res: Response) => {
  const students = await GameModel.find({ userId: req.query.userId });
  if (students.length === 0) {
    console.log("didnt find anything");
    res.send({ msg: "Error" });
  } else {
    const lastStudent = students[students.length - 1];
    res.send({
      msg: "No Error",
      isPrivate: lastStudent.isPrivate,
      gameCode: lastStudent.gameCode,
      mapId: lastStudent.mapId,
      creatorId: lastStudent.creatorId,
      playersIds: lastStudent.playersIds,
    });
  }
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
