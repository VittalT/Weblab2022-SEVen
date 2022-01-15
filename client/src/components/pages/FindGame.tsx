import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./FindGame.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";

const FindGame = (props: RouteComponentProps) => {
  return (
    <>
      <div className="HomeScreen-container">
        <h3 className="HomeScreen-header">MINION BATTLE</h3>
        <div className="dropdown">
          <button className="dropbtn">CREATE</button>
          <div className="dropdown-content">
            <NavigationButton className="HomeScreen-button" text="PUBLIC" destPath="/gameconfig" />
            <NavigationButton className="HomeScreen-button" text="PRIVATE" destPath="/gameconfig" />
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">JOIN</button>
          <div className="dropdown-content">
            <NavigationButton className="HomeScreen-button" text="PUBLIC" destPath="/homescreen" />
            <NavigationButton className="HomeScreen-button" text="PRIVATE" destPath="/homescreen" />
          </div>
        </div>
      </div>
      <BackButton text="PRIVATE" destPath="/homescreen" />
    </>
  );
};

export default FindGame;
