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
  const doNothing = () => {};

  return (
    <>
      <div className="HomeScreen-container u-gameContainer">
        <h3 className="HomeScreen-header u-gameHeader">Minion Battle</h3>
        {props.userId ? (
          <>
            <NavigationButton onClickFunction={doNothing} text="Find Game" destPath="/findgame" />
            <NavigationButton onClickFunction={doNothing} text="Create Map" destPath="/createmap" />
            {/* <NavigationButton onClickFunction={doNothing} text="CUSTOMIZATIONS" destPath="/TODO" /> */}
            <NavigationButton
              onClickFunction={doNothing}
              text="How to Play"
              destPath="/howtoplay"
            />
            {/* <NavigationButton onClickFunction={doNothing} text="ACHIEVEMENTS" destPath="/TODO" /> */}
            <NavigationButton
              onClickFunction={doNothing}
              text="Leaderboard"
              destPath="/leaderboard"
            />
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={props.handleLogout}
              onFailure={() => console.log("Failed to log in")}
              className="NavBar-link NavBar-login"
            />
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
