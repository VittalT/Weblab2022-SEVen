import socketIOClient from "socket.io-client";
import { post } from "./utilities";
import { ClickState, Size } from "../../shared/enums";
const endpoint = `${window.location.hostname}:${window.location.port}`;
export const socket = socketIOClient.io(endpoint);

socket.on("connect", () => {
  // // there is no need to initialize the socket connection immediately
  // post("/api/initsocket", { socketid: socket.id });
});

/** send a message to the server with the move you made */
export const clickGamePanelButton = (
  gameCode: string,
  clickType: ClickState,
  size: Size,
  userId: string
) => {
  // console.log(`B ${clickType} ${size}`);
  socket.emit("GamePanel/click", {
    gameCode: gameCode,
    clickType: clickType,
    size: size,
    userId: userId,
  });
};

export const clickGameMap = (gameCode: string, x: number, y: number, userId: string) => {
  // console.log(`B ${x} ${y}`);
  socket.emit("GameMap/click", { gameCode: gameCode, x: x, y: y, userId: userId });
};

export const moveCursor = (gameCode: string, x: number, y: number, userId: string) => {
  // userId can be inferred from socket
  socket.emit("GameMap/moveCursor", { gameCode: gameCode, x: x, y: y, userId: userId });
};
