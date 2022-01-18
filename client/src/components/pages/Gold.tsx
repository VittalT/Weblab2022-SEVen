import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Gold.css";
import { socket } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
import {
  Size,
  MinionConstants,
  TowerConstants,
  GameState,
} from "../../../../server/models/GameState";
import assert from "assert";

type GoldProps = {
  amount: number;
};

const Gold = (props: GoldProps) => {
  useEffect(() => {
    // get tower and minion info
  }, []);

  return (
    <>
      <div className="GamePanel-button">
        <p className="GamePanel-text">Gold: {props.amount}</p>
      </div>
    </>
  );
};

export default Gold;
