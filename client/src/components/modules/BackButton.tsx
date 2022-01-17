import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./BackButton.css";

type Props = {
  destPath: string;
};

const BackButton = (props: Props) => {
  return (
    <Link to={props.destPath} className="BackButton-button">
      <p className="BackButton-text">&lt;-- BACK</p>
    </Link>
  );
};

export default BackButton;
