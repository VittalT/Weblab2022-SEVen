import React, { useState, useEffect, MouseEventHandler } from "react";
import "../../utilities.css";
import "./FindGame.css";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiMenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";
import { get, post } from "../../utilities";
import { isPropertySignature } from "typescript";

import { PrivateGameInput } from "../modules/NewPostInput";
import { CenterFocusStrong } from "@material-ui/icons";
import User from "../../../../shared/User";

type Game = {
  is_private: string;
  game_code: string;
  map_id: string;
  created: Date;
  creator_id: string;
  players_ids: Array<string>;
  _id: string;
};

type Props = RouteComponentProps & {
  passedUserId: string;
  joinRoom: (userId: string, gameCode: string) => void;
  forceNavigate: () => void;
};

const FindGame = (props: Props) => {
  const doNothing = () => {};

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const createPublicGame = async () => {
    const data = await post("/api/createGame", { gameType: "public" }); // creates backend game
    const gameCode = data.gameCode;
    await props.joinRoom(props.passedUserId, gameCode); // triggers emit("joinRoom"), which adds the socket
    navigate("/gameconfig");
  };

  const createPrivateGame = async () => {
    const data = await post("/api/createGame", { gameType: "private" }); // creates backend game
    const gameCode = data.gameCode;
    await props.joinRoom(props.passedUserId, gameCode); // triggers emit("joinRoom"), which adds the socket
    navigate("/gameconfig");
  };

  const navToLobby = () => {
    navigate("/lobby");
  };

  const joinGame = async () => {
    // TO DO
  };

  useEffect(() => {
    // import User from "../../../../shared/User";
    // import { get, post } from "../../utilities";
    // import { Router, RouteComponentProps, navigate } from "@reach/router";
    get("/api/whoami").then((user: User) => {
      if (user._id === undefined) {
        navigate("/");
      }
    });
    props.forceNavigate();
  }, []);

  return (
    <>
      <div className="u-gameContainer">
        <h1 className="u-gameHeader">Minion Battle</h1>
        <div>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  size="large"
                  id="but"
                  sx={{
                    marginTop: 10,
                    marginBottom: 12,
                    fontSize: 25,
                    borderRadius: 3,
                    backgroundColor: "#98c1d9",
                    "&:hover": {
                      backgroundColor: "#6CB1D9",
                    },
                  }}
                  variant="contained"
                  {...bindTrigger(popupState)}
                >
                  Create Game
                </Button>
                <Menu
                  PaperProps={{
                    style: {
                      width: 250,
                      borderRadius: 4,
                    },
                  }}
                  {...bindMenu(popupState)}
                >
                  <MenuItem onClick={createPublicGame}>Public</MenuItem>
                  <MenuItem onClick={createPrivateGame}>Private</MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </div>
        <div className="dropdown">
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  size="large"
                  sx={{
                    fontSize: 25,
                    borderRadius: 3,
                    backgroundColor: "#98c1d9",
                    "&:hover": {
                      backgroundColor: "#6CB1D9",
                    },
                  }}
                  variant="contained"
                  {...bindTrigger(popupState)}
                >
                  Join Game
                </Button>
                <Menu
                  PaperProps={{
                    style: {
                      width: 250,
                      borderRadius: 4,
                    },
                  }}
                  {...bindMenu(popupState)}
                >
                  <MenuItem onClick={navToLobby}>Public</MenuItem>
                  <PrivateGameInput passedUserId={props.passedUserId} joinRoom={props.joinRoom} />
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </div>
      </div>
      <BackButton text="Back" destPath="/" />
    </>
  );
};

export { Game, FindGame };
