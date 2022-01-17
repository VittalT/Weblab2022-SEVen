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
  const doNothing = () => {};

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
              destPath="/gameconfigpublic"
            />
            <NavigationButton
              onClickFunction={doNothing}
              text="PRIVATE"
              destPath="/gameconfigprivate"
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
      <BackButton destPath="/" />
    </>
  );
};

export default FindGame;
