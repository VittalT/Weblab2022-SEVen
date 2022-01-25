import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./Gold.css";
import { socket } from "../../client-socket";
import { drawCanvas } from "../../canvasManager";
import { Router, RouteComponentProps } from "@reach/router";
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
      <div className="Gold-wrapper">
        <p className="Gold-text">{props.amount} 🟡</p>
      </div>
    </>
  );
};

export default Gold;
