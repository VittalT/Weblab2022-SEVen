import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps, navigate } from "@reach/router";
import assert from "assert";
import NavigationButton from "../modules/NavigationButton";
import GameMap from "./GameMap";
import GamePanel from "./GamePanel";
import BackButton from "../modules/BackButton";
import { ClickState, Size } from "../../../../shared/enums";
import { GameUpdateData } from "../../../../shared/types";

type GameProps = RouteComponentProps & {
  userId: string;
  gameCode: string;
};

const Game = (props: GameProps) => {
  const [gold, setGold] = useState(0);
  const [clickState, setClickState] = useState(ClickState.Tower);
  const [sizeClicked, setSizeClicked] = useState(Size.Small);
  //   const [towerConstants, setTowerConstants] = useState({} as TowerConstants);
  //   const [minionConstants, setMinionConstants] = useState({} as MinionConstants);
  const [displayText, setDisplayText] = useState("Initial");
  const [isInPlay, setIsInplay] = useState(true);
  const [winnerName, setWinnerName] = useState("");

  useEffect(() => {
    socket.on("gameUpdate", (gameUpdateData: GameUpdateData) => {
      processUpdate(gameUpdateData);
    });
    socket.on("updateDisplay", (data: { message: string }) => {
      setDisplayText(data.message);
    });
    socket.on("endGame", (data: { winnerName: string }) => {
      setIsInplay(false);
      setWinnerName(data.winnerName);
    });
    socket.on("startGame", (data: { gameCode: string }) => {
      setIsInplay(true);
    });

    return () => {
      socket.off("gameUpdate");
      socket.off("updateDisplay");
      socket.off("endGame");
    };
  }, []);

  const processUpdate = (gameUpdateData: GameUpdateData) => {
    console.log(gameUpdateData);
    updateDisplayState(gameUpdateData);
    drawCanvas(gameUpdateData);
  };

  const updateDisplayState = (gameUpdateData: GameUpdateData) => {
    const player = gameUpdateData.players[props.userId];
    // if (player.clickState !== clickState || player.sizeClicked !== sizeClicked) {
    //   setDisplayText("");
    // }
    setClickState(player.clickState);
    setSizeClicked(player.sizeClicked);
    // console.log(player.clickState);
    setGold(player.gold);
  };

  const navGameConfig = () => {
    navigate("/gameconfig");
  };

  return (
    <>
      <div className="Game-body">
        <div>
          <BackButton text="Forfeit" destPath="/" />
          {/* <NavigationButton onClickFunction={doNothing} text="Forfeit" destPath="/" /> */}
          <GameMap width={1600} height={750} gameCode={props.gameCode} />
          <p className="u-displayText">{`${sizeClicked} ${clickState} : ${displayText}`}</p>
        </div>
        <GamePanel
          width={1600}
          height={200}
          userId={props.userId}
          gameCode={props.gameCode}
          //   towerConstants={towerConstants}
          //   minionConstants={minionConstants}
          gold={gold}
        />
      </div>
      {isInPlay ? (
        <div>Is In Play!</div>
      ) : (
        <>
          <div>{"The winner is " + winnerName}</div>
          <button onClick={navGameConfig}>Return to lobby</button>
        </>
      )}
    </>
  );
};

export default Game;
