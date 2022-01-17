import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./GameWaiting.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import BackButton from "../modules/BackButton";

type Props = RouteComponentProps & {};

const GameWaiting = (props: Props) => {
  return (
    <>
      <div className="GameWaiting-container">
        <h3 className="GameWaiting-header">MINION BATTLE</h3>
        <div> game type: blah </div>
        <div> game code: blah </div>
        <div> curent players: blah </div>
      </div>
      <BackButton destPath="/findgame" />
    </>
  );
};

export default GameWaiting;
