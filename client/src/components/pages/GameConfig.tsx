import React, { useState, useEffect } from "react";
import "../../utilities.css";
import { get, post } from "../../utilities";
import "./GameConfig.css";
import User from "../../../../shared/User";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";
import { Switch } from "antd";

import BackButton from "../modules/BackButton";
import { socket } from "../../client-socket";
import GameMapModel, { GameMap } from "../../../../server/models/Map";
import MapPanel from "../modules/MapPanel";

interface URLProps extends RouteComponentProps {
  passedGameCode: string;
  joinRoom: (userId: string, gameCode: string) => void;
  leaveRoom: (userId: string, gameCode: string) => void;
}

type Props = URLProps & {
  passedUserId: string;
};

const GameConfig = (props: Props) => {
  const [gameType, setGameType] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("a");
  const [gameMapId, setGameMapId] = useState<string>("");
  const [gameMapName, setGameMapName] = useState<string>("");
  const [isRated, setIsRated] = useState<boolean>(true);
  const [maps, setMaps] = useState<GameMap[]>([]);

  const [hostName, setHostName] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<Array<string>>([""]);
  const [hostId, setHostId] = useState<string>("");

  const [startGameFailedStatus, setStartGameFailedStatus] = useState<boolean>(false);

  const updateLobbyData = (data: {
    gameType: string;
    gameCode: string;
    hostName: string;
    hostId: string;
    playerNames: Array<string>;
  }) => {
    setGameType(data.gameType);
    setGameCode(data.gameCode);
    setHostName(data.hostName);
    setHostId(data.hostId);
    setPlayerNames(data.playerNames);
    console.log("function updatelobby data ran");
  };

  const leaveCurrentGame = async () => {
    const data = await post("/api/leaveGame", { userId: props.passedUserId, gameCode: gameCode });
    const receivedGameCode = data.gameCode;
    await props.leaveRoom(props.passedUserId, receivedGameCode);
    navigate("/findgame");
  };

  const startGame = () => {
    socket.emit("startGameTrigger", { gameCode: gameCode });
    console.log("gameccode sent in parameter to emit is " + gameCode);
  };

  const navToGame = () => {
    navigate("/game");
  };

  const gameConfigForceNavigate = async () => {
    const data = await get("/api/getCurrRoomStatus");
    const currGameCode = data.gameCode;
    setGameCode(data.gameCode);
    if (currGameCode.length === 6) {
      if (data.isInPlay === true) {
        navigate("/game");
      }
    }
  };

  const displayStartGameFailed = () => {
    setStartGameFailedStatus(true);
  };

  const onClickGameMap = (id: string, name: string) => {
    socket.emit("updateGameMap", { gameCode: gameCode, gameMapId: id, gameMapName: name });
  };

  const updateGameMap = (data: { gameCode: string; gameMapId: string; gameMapName: string }) => {
    setGameMapId(data.gameMapId);
    setGameMapName(data.gameMapName);
  };

  const toggleIsRated = () => {
    socket.emit("updateGameIsRated", { gameCode: gameCode, isRated: !isRated });
  };

  const updateGameIsRated = (data: { gameCode: string; isRated: boolean }) => {
    setIsRated(data.isRated);
  };

  useEffect(() => {
    gameConfigForceNavigate();

    socket.on("updateLobbies", updateLobbyData);
    socket.on("startGame", navToGame);
    socket.on("gameStartFailed", displayStartGameFailed);
    socket.on("updateGameMap", updateGameMap);
    socket.on("updateGameIsRated", updateGameIsRated);

    const doThings = async () => {
      // using gamecode associated with app, populate page with lobby info
      const data = await get("/api/getCurrRoomStatus");
      const currGameCode = data.gameCode;
      setGameCode(data.gameCode);
      if (currGameCode.length === 6) {
        const roomJoined = props.joinRoom(props.passedUserId, currGameCode);
        const data = await post("/api/getLobbyInfo", { gameCode: currGameCode });
        console.log(data);
        const lobbyData = await updateLobbyData(data);
      } else {
        navigate("/findgame");
      }
    };

    doThings();

    return () => {
      socket.off("updateLobbies");
      socket.off("startGame");
      socket.off("gameStartFailed");
    };
  }, []);

  useEffect(() => {
    get("/api/getMaps").then((data) => {
      console.log("getting maps");
      setMaps(data);
    });
    socket.on("updateMaps", () => {
      get("/api/getMaps").then((data) => {
        console.log("updating maps");
        setMaps(data);
      });
    });
    return () => {
      socket.off("updateMaps");
    };
  }, []);

  useEffect(() => {
    get("/api/getGameMapId", { gameCode: gameCode }).then((data) => {
      console.log("getting game map id");
      setGameMapId(data);
    });
  }, []);

  useEffect(() => {
    get("/api/getGameIsRated", { gameCode: gameCode }).then((data) => {
      console.log("getting game isRated");
      setIsRated(data);
    });
  }, []);

  // *either you are the host or waiting to start
  return (
    <>
      <div className="GameConfig-container">
        <h3 className="GameConfig-header">MINION BATTLE</h3>
        <button onClick={leaveCurrentGame}>LEAVE THIS GAME</button>
        <div> GAME CONFIG </div>
        <div> game type: {gameType} </div>
        <div> game code: {gameCode} </div>
        <div> curent players: {playerNames.toString()} </div>
        {props.passedUserId === hostId ? (
          <div>
            <MapPanel gameMapId={gameMapId} maps={maps} onClickGameMap={onClickGameMap} />
            <Switch defaultChecked onClick={toggleIsRated} />
          </div>
        ) : (
          <></>
        )}
        <div> Rating Type: {isRated ? "Rated" : "Unrated"} </div>
        <div> Current Map: {gameMapName} </div>
        <div>---</div>
        {props.passedUserId === hostId ? (
          <>
            <div>You are the host</div>
            <button onClick={startGame}>START</button>
          </>
        ) : (
          <>
            <div>{hostName + " is the host"} </div>
            <div>{"Waiting for " + hostName + " to start the game... "}</div>
          </>
        )}
        {startGameFailedStatus ? (
          <div>Failed to start game, there must be 2, 3, or 4 players in the lobby</div>
        ) : (
          <div> </div>
        )}
      </div>
    </>
  );
};

export default GameConfig;
