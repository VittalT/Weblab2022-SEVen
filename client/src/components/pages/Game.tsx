import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { MinionConstants, TowerConstants, GameState } from "../../../../server/models/GameState";
import { Router, RouteComponentProps } from "@reach/router";
import assert from "assert";
import NavigationButton from "../modules/NavigationButton";
import GameMap from "./GameMap";
import GamePanel from "./GamePanel";

type GameProps = RouteComponentProps & {
  userId: string;
  gameId: number;
};

const Game = (props: GameProps) => {
  const [winner, setWinner] = useState(null);
  const [gold, setGold] = useState(0);
  const [towerConstants, setTowerConstants] = useState({} as TowerConstants);
  const [minionConstants, setMinionConstants] = useState({} as MinionConstants);

  useEffect(() => {
    socket.on("update", (gameState: Map<number, GameState>) => {
      processUpdate(gameState);
    });
  }, []);

  useEffect(() => {
    get("/api/gameConstants").then(
      (gameConstants: { minionConstants: MinionConstants; towerConstants: TowerConstants }) => {
        setTowerConstants(gameConstants.towerConstants);
        setMinionConstants(gameConstants.minionConstants);
      }
    );
  }, []);

  const processUpdate = (gameState: Map<number, GameState>) => {
    const game = gameState.get(props.gameId) ?? assert.fail();
    updateGold(game);
    drawCanvas(game);
  };

  const updateGold = (game: GameState) => {
    const player = game.players.get(props.userId) ?? assert.fail();
    setGold(player.gold);
  };

  const doNothing = () => {};

  let winnerModal = null;
  if (winner) {
    winnerModal = <div className="Game-winner">the winner is {winner} yay cool cool</div>;
  }
  return (
    <>
      <div className="Game-body">
        <NavigationButton onClickFunction={doNothing} text="Forfeit" destPath="/" />
        <GameMap width={1000} height={800} gameId={props.gameId} />
        <GamePanel
          width={1000}
          height={200}
          userId={props.userId}
          gameId={props.gameId}
          towerConstants={towerConstants}
          minionConstants={minionConstants}
          gold={gold}
        />
        {winnerModal}
      </div>
    </>
  );
};

export default Game;
