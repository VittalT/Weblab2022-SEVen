import React, { useState, useEffect } from "react";
import { Router, RouteComponentProps } from "@reach/router";

import "../../utilities.css";

const HowToPlay = (props: RouteComponentProps) => {
  return (
    <div>
      <p>
        Welcome to Minion Battle. In this game you will face another player and try to destroy their
        towers. To do so, collect and use gold to buy and deploy minions from one of your towers.
        Once all of your towers lose all health, the game is over.
      </p>
    </div>
  );
};

export default HowToPlay;
