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
import Forfeit from "../modules/Forfeit";
import BackButton from "../modules/BackButton";
import { ClickState, Size } from "../../../../shared/enums";
import { GameUpdateData } from "../../../../shared/types";
import User from "../../../../shared/User";
import { canvasDimensions } from "../../../../shared/constants";
import ColorLegend from "../modules/ColorLegend";

type GameProps = RouteComponentProps & {
  passedUserId: string;
  gameCode: string;
  joinRoom: (userId: string, gameCode: string) => void;
};

const Game = (props: GameProps) => {
  const [gold, setGold] = useState(0);
  const [clickState, setClickState] = useState(ClickState.Tower);
  const [sizeClicked, setSizeClicked] = useState(Size.Small);
  const [displayText, setDisplayText] = useState("Place or select tower");
  const [isInPlay, setIsInplay] = useState(true);
  const [winnerName, setWinnerName] = useState("");

  useEffect(() => {
    // import User from "../../../../shared/User";
    // import { get, post } from "../../utilities";
    // import { Router, RouteComponentProps, navigate } from "@reach/router";
    get("/api/whoami").then((user: User) => {
      if (user._id === undefined) {
        navigate("/");
      }
    });
  }, []);

  useEffect(() => {
    const doThings = async () => {
      setClickState(ClickState.Tower);
      setSizeClicked(Size.Small);
      // using gamecode associated with app, populate page with lobby info
      // const user: User = await get("/api/whoami");
      // const userId = user._id;
      // setUserId(userId);
      const data = await get("/api/getCurrRoomStatus");
      const currGameCode = data.gameCode;
      if (currGameCode.length === 6) {
        console.log("going to join room soon");
        if (props.passedUserId === undefined || props.passedUserId.length === 0) {
          navigate("/"); // PICK UP PROPS
        }
        const roomJoined = props.joinRoom(props.passedUserId, currGameCode);
      }
    };

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

    doThings();

    return () => {
      socket.off("gameUpdate");
      socket.off("updateDisplay");
      socket.off("endGame");
      socket.off("startGame");
    };
  }, []);

  const processUpdate = (gameUpdateData: GameUpdateData) => {
    // console.log(gameUpdateData);
    updateDisplayState(gameUpdateData);
    drawCanvas({ userId: props.passedUserId, gameUpdateData: gameUpdateData });
  };

  const updateDisplayState = (gameUpdateData: GameUpdateData) => {
    const player = gameUpdateData.players[props.passedUserId];
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
          {/* <NavigationButton onClickFunction={doNothing} text="Forfeit" destPath="/" /> */}
          <GameMap
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            gameCode={props.gameCode}
            userId={props.passedUserId}
          />
        </div>
        <GamePanel
          width={1800}
          height={200}
          userId={props.passedUserId}
          gameCode={props.gameCode}
          //   towerConstants={towerConstants}
          //   minionConstants={minionConstants}
          gold={gold}
        />
      </div>
      {isInPlay ? (
        <></>
      ) : (
        <div className="Game-endScreen">
          <div className="Game-center">{"" + winnerName + " won!"}</div>
          <button className="Game-center" onClick={navGameConfig}>
            Return to lobby
          </button>
        </div>
      )}
      <p className="Game-displayText">{`${sizeClicked} ${clickState} - ${displayText}`}</p>
    </>
  );
};

export default Game;
