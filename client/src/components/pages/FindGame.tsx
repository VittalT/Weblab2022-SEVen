import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./FindGame.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";
import { post } from "../../utilities";
import { isPropertySignature } from "typescript";

type Game = {
  is_private: string;
  game_code: string;
  map_id: string;
  created: Date;
  creator_id: string;
  players_ids: Array<string>;
  _id: string;
};

type Props = RouteComponentProps & {};

const FindGame = (props: Props) => {
  const [gameCode, setGameCode] = useState<string>("");

  const doNothing = () => {};

  const generateCode = (length: number) => {
    let result = "";
    const characters = "0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  useEffect(() => {
    setGameCode(generateCode(5));
  }, []);

  return (
    <>
      <div className="HomeScreen-container">
        <h3 className="HomeScreen-header">MINION BATTLE</h3>
        <div className="dropdown">
          <button className="dropbtn">CREATE</button>
          <div className="dropdown-content">
            <NavigationButton
              onClickFunction={doNothing}
              text="PUBLIC"
              destPath={"/gameconfig/public/" + gameCode}
            />
            <NavigationButton
              onClickFunction={doNothing}
              text="PRIVATE"
              destPath={"/gameconfig/private/" + gameCode}
            />
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">JOIN</button>
          <div className="dropdown-content">
            <NavigationButton onClickFunction={doNothing} text="PUBLIC" destPath="/lobby" />
            <NavigationButton onClickFunction={doNothing} text="PRIVATE" destPath="/TODO" />
          </div>
        </div>
      </div>
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export { Game, FindGame };
