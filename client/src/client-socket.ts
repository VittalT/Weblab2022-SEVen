import socketIOClient from "socket.io-client";
import { ClickState, Size } from "../../server/models/GameState";
import { post } from "./utilities";
const endpoint = `${window.location.hostname}:${window.location.port}`;
export const socket = socketIOClient.io(endpoint);

socket.on("connect", () => {
  // // there is no need to initialize the socket connection immediately
  post("/api/initsocket", { socketid: socket.id });
});

/** send a message to the server with the move you made */
export const clickGamePanelButton = (gameId: number, clickType: ClickState, size: Size) => {
  // console.log(`B ${clickType} ${size}`);
  socket.emit("GamePanel/click", { gameId: gameId, clickType: clickType, size: size });
};

export const clickGameMap = (gameId: number, x: number, y: number) => {
  // console.log(`B ${x} ${y}`);
  socket.emit("GameMap/click", { gameId: gameId, x: x, y: y });
};
