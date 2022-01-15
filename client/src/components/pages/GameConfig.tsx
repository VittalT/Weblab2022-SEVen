import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./GameConfig.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

const GameConfig = (props: RouteComponentProps) => {
  return (
    <>
      <div className="HomeScreen-container">
        <h3 className="HomeScreen-header">MINION BATTLE</h3>
        <div> game type: blah </div>
        <div> game code: blah </div>
        <div> curent players: blah </div>
        <div> current map; blah (with map preview) </div>
        <div> start game button </div>
      </div>
    </>
  );
};

export default GameConfig;
