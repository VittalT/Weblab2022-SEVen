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
  const [gold, setGold] = useState(0);
  const [towerConstants, setTowerConstants] = useState({} as TowerConstants);
  const [minionConstants, setMinionConstants] = useState({} as MinionConstants);

  useEffect(() => {
    socket.on("update", (gameState: Record<number, GameState>) => {
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

  const processUpdate = (gameState: Record<number, GameState>) => {
    console.log(gameState);
    const game = gameState[props.gameId];
    console.log(game);
    updateGold(game);
    drawCanvas(game);
  };

  const updateGold = (game: GameState) => {
    console.log("gae");
    console.log(game);
    console.log(props.userId);
    const player = game.players[props.userId];
    console.log(player);
    setGold(player.gold);
  };

  const doNothing = () => {};

  return (
    <>
      <div className="Game-body">
        <div>
          {/* <NavigationButton onClickFunction={doNothing} text="Forfeit" destPath="/" /> */}
          <GameMap width={1600} height={750} gameId={props.gameId} />
        </div>
        <GamePanel
          width={1600}
          height={200}
          userId={props.userId}
          gameId={props.gameId}
          towerConstants={towerConstants}
          minionConstants={minionConstants}
          gold={gold}
        />
      </div>
    </>
  );
};

export default Game;
