import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./HomeScreen.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps } from "@reach/router";

import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  GoogleLogout,
} from "react-google-login";
import "./Skeleton.css";
const GOOGLE_CLIENT_ID = "231096273873-qsgaohckiltuehaohhm6up2fk68cg53n.apps.googleusercontent.com";

type Props = RouteComponentProps & {
  userId: String;
  handleLogin: (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
  handleLogout: () => void;
};

const HomeScreen = (props: Props) => {
  return (
    <>
      <div className="HomeScreen-container">
        <h3 className="HomeScreen-header">MINION BATTLE</h3>
        {props.userId ? (
          <>
            <NavigationButton className="HomeScreen-button" text="FIND GAME" destPath="/findgame" />
            <NavigationButton className="HomeScreen-button" text="CREATE MAP" destPath="/TODO" />
            <NavigationButton
              className="HomeScreen-button"
              text="CUSTOMIZATIONS"
              destPath="/TODO"
            />
            <NavigationButton className="HomeScreen-button" text="HOW TO PLAY" destPath="/TODO" />
            <NavigationButton className="HomeScreen-button" text="ACHIEVEMENTS" destPath="/TODO" />
          </>
        ) : (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={props.handleLogin}
            onFailure={(err) => console.log(err)}
          />
        )}
      </div>
    </>
  );
};

export default HomeScreen;
