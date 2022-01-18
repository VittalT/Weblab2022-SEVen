import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Game.css";
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
      <div className="Game-body">{props.amount}</div>
    </>
  );
};

export default Gold;
