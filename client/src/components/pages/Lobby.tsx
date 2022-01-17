import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";
import { get } from "../../utilities";

import Game from "../../../../server/models/Game";

import LobbyGameDisplay from "../modules/LobbyGameDisplay";

type Props = RouteComponentProps & {};

const loadCurrentPublicGames = async (): Promise<Array<typeof Document>> => {
  const publicGames: Array<typeof Document> = await get("/api/getPublicGames");

  return publicGames;
};

const Lobby = (props: Props) => {
  // USE A REFRESH BUTTON!!

  const [publicGamesIds, setPublicGames] = useState<Array<typeof Document>>([]); // holds the IDs of the lobby owners

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
        <div>
          {publicGamesIds.map((ownerName: typeof Document) => (
            <LobbyGameDisplay gameOwner={""} /> //ownerName.creator_name} />
          ))}{" "}
        </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default Lobby;
