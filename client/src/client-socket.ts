import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = `${window.location.hostname}:${window.location.port}`;
export const socket = socketIOClient.io(endpoint);

socket.on("connect", () => {
  // // there is no need to initialize the socket connection immediately
  // post("/api/initsocket", { socketid: socket.id });
});

/** send a message to the server with the move you made */
export const clickGamePanelButton = (gameCode: string, clickType: ClickState, size: Size) => {
  // console.log(`B ${clickType} ${size}`);
  socket.emit("GamePanel/click", { gameCode: gameCode, clickType: clickType, size: size });
};

export const clickGameMap = (gameCode: string, x: number, y: number) => {
  // console.log(`B ${x} ${y}`);
  socket.emit("GameMap/click", { gameCode: gameCode, x: x, y: y });
};
