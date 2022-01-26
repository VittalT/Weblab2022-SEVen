import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import { get, post } from "../../utilities";
import "./GameConfig.css";
import User from "../../../../shared/User";

import NavigationButton from "../modules/NavigationButton";
import Button from "@mui/material/Button";

import { Router, RouteComponentProps, navigate } from "@reach/router";
import Switch from "@material-ui/core/Switch";

import { ThemeProvider, createTheme } from "@mui/system";

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
  const [gameCode, setGameCode] = useState<string>(props.passedGameCode);
  const [gameMapId, setGameMapId] = useState<string>(""); // TODO put 61ef3fcacd275e74b9034d3e
  const [gameMapName, setGameMapName] = useState<string>(""); // TODO put No Gold Mines
  const [isRated, setIsRated] = useState<boolean>(true);
  const [maps, setMaps] = useState<GameMap[]>([]);

  const [hostId, setHostId] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [playerIds, setPlayerIds] = useState<Array<string>>([]);
  const [playerNames, setPlayerNames] = useState<Array<string>>([]);
  const [playerRatings, setPlayerRatings] = useState<Array<number>>([]);
  const [idToName, setIdToName] = useState<Record<string, string>>({});
  const [idToRating, setIdToRating] = useState<Record<string, number>>({});

  const [startGameFailedStatus, setStartGameFailedStatus] = useState<boolean>(false);

  const updateLobbyData = (data: {
    gameType: string;
    gameCode: string;
    hostName: string;
    hostId: string;
    playerIds: Array<string>;
  }) => {
    console.log(`data ${data} ${data.playerIds}`);
    setGameType(data.gameType);
    setGameCode(data.gameCode);
    setHostName(data.hostName);
    setHostId(data.hostId);
    setPlayerIds(data.playerIds);
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

  useEffect(() => {
    get("/api/users").then((users: User[]) => {
      console.log(JSON.stringify(users));
      const _idToName: Record<string, string> = {};
      const _idToRating: Record<string, number> = {};
      for (const user of users) {
        _idToName[user._id] = user.name;
        _idToRating[user._id] = user.rating;
      }
      setIdToName(_idToName);
      setIdToRating(_idToRating);
      console.log(playerIds);
      const playerNames = playerIds.map((userId: string) => idToName[userId]);
      const playerRatings = playerIds.map((userId: string) => idToRating[userId]);
      setPlayerNames(playerNames);
      setPlayerRatings(playerRatings);
    });
  }, [playerIds]);

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
    socket.emit("updateGameMap", { gameCode: gameCode, gameMapId: id });
  };

  const updateGameMap = (data: { gameCode: string; gameMapId: string }) => {
    setGameMapId(data.gameMapId);
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
      await setGameCode(currGameCode);
      if (currGameCode.length === 6) {
        const roomJoined = props.joinRoom(props.passedUserId, currGameCode);
        const data = await post("/api/getLobbyInfo", { gameCode: currGameCode });
        // console.log(data);
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
  }, [gameCode]);

  useEffect(() => {
    get("/api/getMaps").then((data: GameMap[]) => {
      console.log("getting maps");
      setMaps(data);
    });
    socket.on("updateMaps", () => {
      get("/api/getMaps").then((data: GameMap[]) => {
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
      console.log(`game map id ${data.gameMapId}`);
      if (data.successful) {
        setGameMapId(data.gameMapId);
      }
    });
  }, [gameCode]);

  useEffect(() => {
    const possMap = maps.find((mapObj: GameMap) => mapObj._id === gameMapId);
    console.log(`N ${gameMapId} ${possMap !== undefined ? possMap.name : "und"}`);
    if (possMap !== undefined) {
      console.log(`game name ${possMap.name}`);
      setGameMapName(possMap.name);
    }
  }, [gameMapId, maps]); //

  useEffect(() => {
    get("/api/getGameIsRated", { gameCode: gameCode }).then((data) => {
      console.log(`game isRated ${data.isRated}`);
      if (data.successful) {
        setIsRated(data.isRated);
      }
    });
  }, [gameCode]); //
  const displayPlayersAndRatings = (isRated: boolean) => {
    return playerIds
      .map((playerId: string) =>
        isRated ? `${idToName[playerId]} (${idToRating[playerId]})` : `${idToName[playerId]}`
      )
      .join(", ");
  };
  // useEffect(() => {
  // }, [playerIds, idToName, idToRating]); //

  // *either you are the host or waiting to start
  return (
    <>
      <div className="GameConfig-gameContainer">
        <h3 className="u-gameHeader">Minion Battle</h3>
        <Button
          size="medium"
          onClick={leaveCurrentGame}
          sx={{
            marginBottom: 10,
            width: 300,
            height: 50,
            "&:hover": {
              bgcolor: "#6CB1D9",
            },
            "& .MuiButton-root": {
              borderRadius: "4px",
              bgcolor: "#FFFFFF",
              fontSize: 25,
            },
          }}
          variant="contained"
        >
          Leave this Game
        </Button>
        <div className="u-flexColumn">
          {props.passedUserId === hostId ? (
            <div className="u-flexColumn">
              <div>You are the host</div>
            </div>
          ) : (
            <div className="u-flexColumn">
              <div>{hostName + " is the host"} </div>
              <div>{"Waiting for " + hostName + " to start the game... "}</div>
            </div>
          )}
          {startGameFailedStatus ? (
            <div>Failed to start game, there must be 2, 3, or 4 players in the lobby</div>
          ) : (
            <div> </div>
          )}
          <br />
          <div> GAME CONFIG </div>
          <div> Game Type: {gameType} </div>
          <div> Game Code: {gameCode} </div>
          <div> Curent Players: {displayPlayersAndRatings(isRated)} </div>
          <div className="u-flexColumn">
            <div>Rating Type: {isRated ? "Rated" : "Unrated"}</div>
            <div>
              {props.passedUserId === hostId ? (
                <Switch defaultChecked onClick={toggleIsRated} />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="u-flexColumn">
            <div>Current Map: {gameMapName}</div>
            <MapPanel
              gameMapId={gameMapId}
              maps={maps}
              onClickGameMap={onClickGameMap}
              isHost={props.passedUserId === hostId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GameConfig;
