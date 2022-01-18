import React, { useState, useEffect } from "react";
import { Link, navigate } from "@reach/router";
import "../../utilities.css";
import "./LobbyGameDisplay.css";

type Props = {
  gameCode: string;
};

const LobbyGameDisplay = (props: Props) => {
  <div>
    <button
      onSubmit={() => {
        navigate("/gamewaiting", { state: { gameCode: props.gameCode } });
      }}
    >
      {props.gameCode}
    </button>
  </div>;
  return <div> {props.gameCode} </div>;
};

export default LobbyGameDisplay;
