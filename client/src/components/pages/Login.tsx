import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Login.css";

import { Router, RouteComponentProps } from "@reach/router";

import NavigationButton from "../modules/NavigationButton";

const Login = (props: RouteComponentProps) => {
  return (
    <>
      <div className="Login-container">
        <h3 className="Login-header">Minion Battle</h3>
        <NavigationButton className="Login-button" destPath="/homescreen" text="LOGIN" />
      </div>
    </>
  );
};

export default Login;
