import type http from "http";
import { Server, Socket } from "socket.io";
import User from "../shared/User";
import UserModel from "./models/User";

import { games } from "./data/games";

let io: Server;

const userToSocketMap: Map<string, Socket> = new Map<string, Socket>(); // maps user ID to socket object
const socketToUserMap: Map<string, User> = new Map<string, User>(); // maps socket ID to user object

export const getSocketFromUserID = (userid: string) => userToSocketMap.get(userid);
export const getUserFromSocketID = (socketid: string) => socketToUserMap.get(socketid);
export const getSocketFromSocketID = (socketid: string) => io.sockets.sockets.get(socketid);

export const addUser = (user: User, socket: Socket): void => {
  const oldSocket = userToSocketMap.get(user._id);
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // TODO(weblab student): is this the behavior you want?
    oldSocket.disconnect();
    socketToUserMap.delete(oldSocket.id);
  }
  userToSocketMap.set(user._id, socket);
  socketToUserMap.set(socket.id, user);
};

export const removeUser = (user: User, socket: Socket): void => {
  if (user) userToSocketMap.delete(user._id);
  socketToUserMap.delete(socket.id);
};

export const updateDisplay = (userId: string, message: string) => {
  io.emit("updateDisplay", userId, message);
};

export const init = (server: http.Server): void => {
  io = new Server(server);
  io.on("connection", (socket) => {
    console.log(`socket has connected ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`socket has disconnected ${socket.id}`);
      const user = getUserFromSocketID(socket.id);
      if (user !== undefined) removeUser(user, socket);
    });
    socket.on("GamePanel/click", (click: { gameId: number; clickType: ClickState; size: Size }) => {
      // console.log(`C ${click.clickType} ${click.size}`);
      const user = getUserFromSocketID(socket.id);
      if (user) {
        games[click.gameId].updateGamePanelClickState(user._id, click.clickType, click.size);
      }
    });
    socket.on("GameMap/click", (click: { gameId: number; x: number; y: number }) => {
      // console.log(`C ${click.x} ${click.y}`);
      const user = getUserFromSocketID(socket.id);
      if (user) games[click.gameId].updateGameMapClickState(user._id, click.x, click.y);
    });
    // this is the function called by App, when a socket joins a room
    socket.on("joinRoom", (data: { user: User; userId: string; gameCode: string }) => {
      // connect socket
      const gameCode = data.gameCode;
      const userId = data.userId;
      const user = data.user;

      addUser(user, socket);

      const currGame = games[gameCode];

      if (currGame.hasPlayer(userId)) {
        socket.join(gameCode);
        console.log("socket " + socket.id + " has joined room " + gameCode);
        currGame.updateLobbies();
      }
    });
    socket.on("leaveRoom", (data: { user: User; userId: string; gameCode: string }) => {
      // connect socket
      const gameCode = data.gameCode;
      const userId = data.userId;
      const user = data.user;

      removeUser(user, socket);

      const currGame = games[gameCode];

      socket.leave(gameCode);
      console.log("socket " + socket.id + " has left room " + gameCode);
      currGame.updateLobbies();
    });
    socket.on("startGameTrigger", (data: { gameCode: string }) => {
      const gameCode = data.gameCode;

      if (gameCode in Object.keys(games)) {
        const currGame = games[gameCode];
        currGame.start();
      }
    });
  });
};

export const getIo = () => io;

export default {
  getIo,
  init,
  removeUser,
  addUser,
  getSocketFromSocketID,
  getUserFromSocketID,
  getSocketFromUserID,
  updateDisplay,
};
