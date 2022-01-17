import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";
import { get } from "../../utilities";

type Props = RouteComponentProps & {};

const loadCurrentPublicGames = () => {
  get("/api/getPublicGames");
};

const Lobby = (props: Props) => {
  // USE A REFRESH BUTTON!!

  const [publicGames, setPublicGames] = useState<Array<string>>([]);

  useEffect(() => {
    // borrow stuff from chatbook messageslist, basically get the list of shit
    async function performThings() {}

    performThings();
  }, []);

  return (
    <>
      <div className="Lobby-container">
        <h3 className="Lobby-header">MINION BATTLE</h3>
        <div> list of games </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default Lobby;
