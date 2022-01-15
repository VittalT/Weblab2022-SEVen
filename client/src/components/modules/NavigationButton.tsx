import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./NavigationButton.css";

const NavigationButton = (props) => {
  return (
    <Link to={props.destPath} className="NavigationButton-button">
      <p className="NavigationButton-text">{props.text}</p>
    </Link>
  );
};

export default NavigationButton;
