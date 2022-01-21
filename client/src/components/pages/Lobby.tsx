import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";
import { get } from "../../utilities";

import LobbyGameDisplay from "../modules/LobbyGameDisplay";

import { Game } from "./FindGame";

type Props = RouteComponentProps & {};

const loadCurrentPublicGames = async (): Promise<Array<Game>> => {
  const publicGames: Array<Game> = await get("/api/getPublicGames");
  return publicGames;
};

const Lobby = (props: Props) => {
  const [publicGames, setPublicGames] = useState<Array<{ hostName: string; gameCode: string }>>([]);

  const joinPublicGame = (gameCode: string) => {
    // code for joining a public game
  };

  useEffect(() => {
    get("/api/getPublicGames").then((data) => {
      setPublicGames(data);
    });
  }, []);

  return (
    <>
      <div className="Lobby-container">
        <h3 className="Lobby-header">MINION BATTLE</h3>
        <div>LOBBY</div>
        <div>
          {publicGames.map((game: { hostName: string; gameCode: string }) => (
            <div onClick={() => joinPublicGame(game.gameCode)}>
              {game.hostName + " " + game.gameCode}
            </div>
          ))}{" "}
        </div>
      </div>
      <BackButton text="BACK" destPath="/findgame" />
    </>
  );
};

export default Lobby;
