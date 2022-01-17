import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./FindGame.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";
import { post } from "../../utilities";
import { isPropertySignature } from "typescript";

type Props = RouteComponentProps & {};

const FindGame = (props: Props) => {
  const generateCode = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const createPublicGame = (event: React.MouseEvent<HTMLElement>) => {
    console.log("BWAHHH");
    post("/api/createGame", { isPrivate: "public", gameCode: "N/A", mapId: "default for now" });
  };

  const createPrivateGame = (event: React.MouseEvent<HTMLElement>) => {
    const gameCode = generateCode(5);
    post("/api/createGame", { isPrivate: "private", gameCode: gameCode, mapId: "default for now" });
  };

  return (
    <>
      <div className="HomeScreen-container">
        <h3 className="HomeScreen-header">MINION BATTLE</h3>
        <div className="dropdown">
          <button className="dropbtn">CREATE</button>
          <div className="dropdown-content">
            <NavigationButton
              onClickFunction={createPublicGame}
              text="PUBLIC"
              destPath="/gameconfig"
            />
            <NavigationButton
              onClickFunction={createPrivateGame}
              text="PRIVATE"
              destPath="/gameconfig"
            />
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">JOIN</button>
          <div className="dropdown-content">
            <NavigationButton onClickFunction={createPublicGame} text="PUBLIC" destPath="/lobby" />
            <NavigationButton onClickFunction={createPublicGame} text="PRIVATE" destPath="/TODO" />
          </div>
        </div>
      </div>
      <BackButton destPath="/" />
    </>
  );
};

export default FindGame;
