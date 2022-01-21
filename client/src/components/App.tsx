import React, { useState, useEffect } from "react";
import { get, post } from "../utilities";
import NotFound from "./pages/NotFound";
import Skeleton from "./pages/Skeleton";
import { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { socket } from "../client-socket";
import User from "../../../shared/User";
import "../utilities.css";
import Game from "./pages/Game";
import assert from "assert";

import { Router, RouteComponentProps } from "@reach/router";

import NavigationButton from "./modules/NavigationButton";
import HomeScreen from "./pages/HomeScreen";
import { FindGame } from "./pages/FindGame";
import CreateMap from "./pages/CreateMap";
import GameConfig from "./pages/GameConfig";
import GameWaiting from "./pages/GameWaiting";
import Lobby from "./pages/Lobby";
import HowToPlay from "./pages/HowToPlay";

const App = () => {
  const [userId, setUserId] = useState("");
  const [gameCode, setGameCode] = useState("");

  // connects the socket and joins the room (socket oriented), returns whether or not room was joined
  const joinRoom = async (userId: string, gameCode: string) => {
    const user: User = await get("/api/whoami");
    socket.emit("joinRoom", { user: user, userId: userId, gameCode: gameCode });
    setGameCode(gameCode);
    return true;
  };

  useEffect(() => {
    console.log("app was entered or refreshed!");
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
      }
    });
    // });
    // .then(() =>
    //   socket.on("connect", () => {
    //     console.log("initailized socket from who am i");
    //     // post("/api/initsocket", { socketid: socket.id });
    //   })
    // );
  }, []);

  const handleLogin = (res: GoogleLoginResponse) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user: User) => {
      setUserId(user._id);
      // console.log(`User Id: ${user._id}`);
      // console.log(`User Id: ${userId}`);
    });
  };

  const handleLogout = () => {
    setUserId("");
    post("/api/logout");
  };

  // NOTE:
  // All the pages need to have the props extended via RouteComponentProps for @reach/router to work properly. Please use the Skeleton as an example.
  return (
    <Router>
      <HomeScreen
        path="/"
        handleLogin={handleLogin as (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void}
        handleLogout={handleLogout}
        userId={userId}
      />
      <FindGame path="/findgame" passedUserId={userId} joinRoom={joinRoom} />
      <CreateMap path="/createmap" userId={userId} />
      <GameConfig
        path="/gameconfig"
        passedUserId={userId}
        joinRoom={joinRoom}
        gameCode={gameCode}
      />
      <GameWaiting path="/gamewaiting" passedUserId={userId} gameCode={gameCode} />
      <Lobby path="/lobby" />
      <Game path="/game" userId={userId} gameId={0} />
      <NotFound default={true} />
      <HowToPlay path="/howtoplay" />
    </Router>
  );
};

export default App;
