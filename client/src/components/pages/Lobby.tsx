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
  const [publicGames, setPublicGames] = useState<Array<Game>>([]);

  const doNothing = () => {};

  useEffect(() => {
    // borrow stuff from chatbook messageslist, basically get the list of shit
    async function performThings() {
      const publicGamesFromDB = await loadCurrentPublicGames();
      setPublicGames(publicGamesFromDB);
    }

    performThings();
  }, []);

  return (
    <>
      <div className="Lobby-container">
        <h3 className="Lobby-header">MINION BATTLE</h3>
        <div>LOBBY</div>
        <div>
          {publicGames.map((game: Game) => (
            <NavigationButton
              onClickFunction={doNothing}
              destPath={"/gamewaiting/public/" + game.game_code}
              text={game.game_code}
            />
            //<LobbyGameDisplay gameCode={game.game_code} /> //ownerName.creator_name} />
          ))}{" "}
        </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default Lobby;
