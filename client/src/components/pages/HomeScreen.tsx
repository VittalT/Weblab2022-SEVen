import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Login.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

const HomeScreen = (props: RouteComponentProps) => {
  return (
    <>
      <div className="Login-container">
        <h3 className="Login-header">BOP</h3>
      </div>
    </>
  );
};

export default HomeScreen;
