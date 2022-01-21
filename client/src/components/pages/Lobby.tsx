import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";

import BackButton from "../modules/BackButton";
import { get, post } from "../../utilities";

import LobbyGameDisplay from "../modules/LobbyGameDisplay";

import { Game } from "./FindGame";

type Props = RouteComponentProps & {
  passedUserId: string;
  joinRoom: (userId: string, gameCode: string) => void;
};

const Lobby = (props: Props) => {
  const [publicGames, setPublicGames] = useState<Array<{ hostName: string; gameCode: string }>>([]);

  const joinPublicGame = async (gameCode: string) => {
    const data = await post("/api/joinGame", { gameCode: gameCode });
    await props.joinRoom(props.passedUserId, gameCode);
    navigate("/gameconfig");
  };

  useEffect(() => {
    // TODO:: EVENTUALLY, IF THERE IS NOONE IN THE GAME, THEN JUST DONT SHOW THE FUCKING GAME!!
    // ALSO, MAKE A FUCKING REFRESH BUTTON! LMAO XD! AND ENCODE LOGIC FOR WHAT HAPPENS IF THE GAME IS GONE! HAHA!
    get("/api/getPublicGames").then((data) => {
      setPublicGames(data);
    });
  }, []);

  return (
    <>
      <div className="Lobby-container">
        <h3 className="Lobby-header">MINION BATTLE</h3>
        <div>LOBBY</div>
        <div>{publicGames.length + " Games"}</div>
        <div>
          {publicGames.map((game: { hostName: string; gameCode: string }) => (
            <button onClick={() => joinPublicGame(game.gameCode)}>
              {game.hostName + " " + game.gameCode}
            </button>
          ))}{" "}
        </div>
      </div>
      <BackButton text="BACK" destPath="/findgame" />
    </>
  );
};

export default Lobby;
