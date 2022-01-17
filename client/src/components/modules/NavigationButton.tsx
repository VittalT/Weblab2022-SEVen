import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./NavigationButton.css";

type Props = {
  destPath: string;
  text: string;
  onClickFunction: React.MouseEventHandler<HTMLAnchorElement>;
};

const NavigationButton = (props: Props) => {
  return (
    <Link onClick={props.onClickFunction} to={props.destPath} className="NavigationButton-button">
      <p className="NavigationButton-text">{props.text}</p>
    </Link>
  );
};

export default NavigationButton;
