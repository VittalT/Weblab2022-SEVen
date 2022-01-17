import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";

type Props = RouteComponentProps & {};

const Lobby = (props: Props) => {
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
