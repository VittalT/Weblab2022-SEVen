import React, { useState, useEffect } from "react";
import { Router, RouteComponentProps } from "@reach/router";

import "../../utilities.css";
import "./HowToPlay.css";
import BackButton from "../modules/BackButton";

type Props = RouteComponentProps & {
  forceNavigate: () => Promise<void>;
};

const HowToPlay = (props: Props) => {
  useEffect(() => {
    props.forceNavigate();
  }, []);

  return (
    <>
      <div className="u-gameContainer">
        <h1 className="u-gameHeader">How To Play</h1>
        <p className="HTP-rule">
          Welcome to Minion Battle! The objective of the game is to deploy minions and destroy all
          of your enemies' towers.
        </p>
        <p className="HTP-rule">
          At the beginning of the game, each player starts with a single small tower. The map may
          also have yellow pockets of gold that can be collected by placing a tower on them or
          deploying a minion through them. Each tower also passively generates gold, which can be
          used to purchase more towers, more minions, or trigger an explosion. The game ends when
          only one player has any towers remaining.
        </p>
        <p className="HTP-rule">
          To place a tower, select the size of the tower and click on the map where you want it to
          be spawned. Towers must be spawned a certain distance away from each other and can only be
          placed within a certain radius of one of your existing towers.
        </p>
        <p className="HTP-rule">
          To deploy a minion, select the size of the minion you wish to deploy and click one of your
          own towers (the point from which it will be deployed) and an enemy tower (the tower that
          it will attack). Each tower has a certain amount of health and each minion does a certain
          amount of damage per seconds - when a tower's health reaches zero, it and all the minions
          attacking it are destroyed. Each minion also takes a certain amount of time to reach its
          destination and begin attacking the tower.
        </p>
        <p className="HTP-rule">
          To trigger an explosion, simply click the explosion button, then press the tower you wish
          to explode. This will cause all minions that are currently attacking your tower to be
          destroyed, and your tower will begin to passively regenerate health.
        </p>
      </div>
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export default HowToPlay;
