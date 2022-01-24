import React, { useState, useEffect } from "react";
import { Router, RouteComponentProps } from "@reach/router";

import "../../utilities.css";
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
      <div>
        <p>
          Welcome to Minion Battle! The objective of the game is to deploy minions and destroy your
          enemies' towers.
        </p>
        <p>
          As you can see in the map layout above, players start with ____-sized towers on different
          sides/corners of the map depending on how many are in the game. The map will also have
          pockets of gold that you can collect to deploy more towers or minions. The amount of
          health that a tower starts with and the cost to deploy it depends on which of the three
          sizes it is (Small, Medium, Large). Minions can be deployed from any existing tower and
          targetted to enemy towers. The game will end when there remains only one player with any
          active towers.
        </p>
        <p>
          To deploy a tower, you simply need to click the type of tower and select where you want to
          place it on the mpa. Note that you can only place a tower within a certain distance of any
          your existing towers. See the gif above to learn how to place a tower.
        </p>
        <p>
          To deploy a minion, you can select the minion buttom from the game panel and click any of
          your active towers to deploy from. Once you do that, you should also select an enemy tower
          to attack, and your minion will start moving towards that target. See the gif above to
          learn how to deploy a minion.
        </p>
      </div>
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export default HowToPlay;
