import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./LobbyGameDisplay.css";

type Props = {
  gameOwner: string;
};

const LobbyGameDisplay = (props: Props) => {
  return <div> {props.gameOwner} </div>;
};

export default LobbyGameDisplay;
