// import React, { useState, useEffect } from "react";

// import "../../utilities.css";
// import "../../input";
// import "./Game.css";
// import { socket } from "../../client-socket";
// import { drawCanvas } from "../../canvasManager";
// import { GameState } from "../../../../server/models/GameState";
// import { Router, RouteComponentProps } from "@reach/router";
// import assert from "assert";

// type GameProps = RouteComponentProps & {
//   userId: string;
//   gameId: number;
// };

// const Game = (props: GameProps) => {
//   const [winner, setWinner] = useState(null);

//   useEffect(() => {
//     socket.on("update", (gameState: Map<number, GameState>) => {
//       processUpdate(gameState);
//     });
//   }, []);

//   const processUpdate = (gameState: Map<number, GameState>) => {
//     const game = gameState.get(props.gameId) ?? assert.fail();
//     drawCanvas(game);
//   };

//   let winnerModal = null;
//   if (winner) {
//     winnerModal = <div className="Game-winner">the winner is {winner} yay cool cool</div>;
//   }
//   return (
//     <>
//       <div className="Game-body">
//         <canvas id="game-canvas" width="800" height="800" />
//         {winnerModal}
//       </div>
//     </>
//   );
// };

// export default Game;
