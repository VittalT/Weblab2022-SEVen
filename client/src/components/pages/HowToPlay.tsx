import React, { useState, useEffect } from "react";
import { Router, RouteComponentProps } from "@reach/router";

import "../../utilities.css";
import "./HowToPlay.css";
import BackButton from "../modules/BackButton";
import User from "../../../../shared/User";
import { get, post } from "../../utilities";
import { navigate } from "@reach/router";
import { towerConstants } from "../../../../shared/constants";
import t from "./tower.gif";
import m from "./minion.gif";
import e from "./explosion.gif";

type Props = RouteComponentProps & {
  forceNavigate: () => Promise<void>;
};

const HowToPlay = (props: Props) => {
  useEffect(() => {
    // import User from "../../../../shared/User";
    // import { get, post } from "../../utilities";
    // import { Router, RouteComponentProps, navigate } from "@reach/router";
    get("/api/whoami").then((user: User) => {
      if (user._id === undefined) {
        navigate("/");
      }
    });
  }, []);

  useEffect(() => {
    props.forceNavigate();
  }, []);

  return (
    <>
      <div className="u-gameContainer">
        <h1 className="u-gameHeader">How To Play</h1>
        <div className="HTP-ruleContainer">
          <p className="HTP-rule">
            Welcome to Minion Battle! The objective of the game is to deploy minions and destroy all
            of your enemies' towers.
          </p>
          <p className="HTP-rule">
            Each player starts with a single small tower. Towers passively generates gold and
            regenerate health, and minions attack towers and reduce their health. Gold can be used
            to purchase more towers, minions, or trigger an explosion. The game ends when only one
            player has any towers remaining.
          </p>
          <p className="HTP-rule">
            To place a tower, select the size of the tower and click on the map where you want it to
            be spawned. Towers must be spawned far enough from nearby towers but also close to some
            ally tower, as shown on the blueprint following the cursor.
          </p>
          <div className="img-container">
            <img className="GIF" src={t} alt="Deploy Tower" />
          </div>

          <p className="HTP-rule">
            To deploy a minion, select the size of the minion you wish to deploy, click an ally
            tower and an enemy tower. The minion then travels from the selected ally tower to the
            enemy tower, and then starts dealing damage to the enemy tower.
          </p>
          <div className="img-container">
            <img className="GIF" src={m} alt="Deploy Minion"></img>
          </div>

          <p className="HTP-rule">
            To trigger an explosion, click the explosion button, and then press the tower you wish
            to explode. This will destroy all nearby minions and reduce health of all nearby towers,
            both enemy and ally!
          </p>
          <div className="img-container">
            <img className="GIF" src={e} alt="Create Explosion"></img>
          </div>

          <p className="HTP-rule">
            When one of your towers dies, you may not rebuild another tower in that area for 5
            seconds (this area will also be indicated).
          </p>
          <p className="HTP-rule">
            The map may also have yellow pockets of gold that can be collected by placing a tower on
            them or deploying a minion through them.
          </p>

          <p className="HTP-rule">
            These are all the rules for gameplay! If there isn't a winner at the end of 10 minutes,
            the player with the most health will be declared the winner. You can now start playing
            games with your friends in groups of 2-6! If you're up for the challenge, you can also
            toggle a game setting to compete in rated games with others in your lobby. Enjoy!
          </p>
        </div>
      </div>
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export default HowToPlay;
