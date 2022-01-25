import React, { useState, useEffect } from "react";
import { Router, RouteComponentProps } from "@reach/router";

import "../../utilities.css";
import "./NumPlayers.css";
import BackButton from "../modules/BackButton";
import NavigationButton from "../modules/NavigationButton";

type NumPlayerProps = RouteComponentProps & {
  userId: string;
  userName: string;
};

const NumPlayers = (props: NumPlayerProps) => {
  return (
    <>
      <div className="configurables">
        <h1 className="Creation-configHeader">Number of Players</h1>
        <div>
          <NavigationButton text="2 Players" destPath="/findgame" onClickFunction={() => {}} />
          <NavigationButton text="4 Players" destPath="/findgame" onClickFunction={() => {}} />
        </div>
      </div>
      ;
      <BackButton text="BACK" destPath="/" />
    </>
  );
};

export default NumPlayers;
