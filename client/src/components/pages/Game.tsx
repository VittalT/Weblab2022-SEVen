import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
import { socket } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";

const Game = () => {
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on("update", (update) => {
      processUpdate(update);
    });
  }, []);

  const processUpdate = (update) => {
    drawCanvas(update);
  };

  let winnerModal = null;
  if (winner) {
    winnerModal = <div className="Game-winner">the winner is {winner} yay cool cool</div>;
  }
  return (
    <>
      <div className="Game-body">
        <canvas id="game-canvas" width="800" height="800" />
        {winnerModal}
      </div>
    </>
  );
};

export default Game;
