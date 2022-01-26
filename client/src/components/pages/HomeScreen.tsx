import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./HomeScreen.css";
import { Link } from "@reach/router";
import Button from "@mui/material/Button";

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
  forceNavigate: () => Promise<void>;
};

const HomeScreen = (props: Props) => {
  useEffect(() => {
    props.forceNavigate();
  }, []);

  const doNothing = () => {};

  return (
    <>
      <div className="HomeScreen-container u-gameContainer">
        <h1 className="HomeScreen-header u-gameHeader">Minion Mania</h1>
        {props.userId ? (
          <>
            <NavigationButton text="Find Game" destPath="/findgame" onClickFunction={doNothing} />
            <NavigationButton text="Create Map" destPath="/createmap" onClickFunction={doNothing} />
            {/* <NavigationButton onClickFunction={doNothing} text="CUSTOMIZATIONS" destPath="/TODO" /> */}
            <NavigationButton
              text="How to Play"
              destPath="/howtoplay"
              onClickFunction={doNothing}
            />
            {/* <NavigationButton onClickFunction={doNothing} text="ACHIEVEMENTS" destPath="/TODO" /> */}
            <NavigationButton
              text="Leaderboard"
              destPath="/leaderboard"
              onClickFunction={doNothing}
            />
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={props.handleLogout}
              onFailure={() => console.log("Failed to log out")}
              className="HomeScreen-logout"
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
