import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./BackButton.css";

const BackButton = (props) => {
  return (
    <Link to={props.destPath} className="BackButton-button">
      <p className="BackButton-text">&lt;-- BACK</p>
    </Link>
  );
};

export default BackButton;
