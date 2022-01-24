import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./FindGame.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";
import { get, post } from "../../utilities";
import { isPropertySignature } from "typescript";

import { PrivateGameInput } from "../modules/NewPostInput";

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
    props.forceNavigate();
  }, []);

  return (
    <>
      <div className="FindGame-container u-gameContainer">
        <h3 className="FindGame-header u-gameHeader">Minion Battle</h3>
        <div className="dropdown">
          <div className="deadButton">Create</div>
          <div className="dropdown-content">
            <button onClick={createPublicGame}>Public</button>
            <button onClick={createPrivateGame}>Private</button>
          </div>
        </div>
        <div className="dropdown">
          <div className="deadButton">Join</div>
          <div className="dropdown-content">
            <button onClick={navToLobby}>Public</button>
          </div>
        </div>
        <PrivateGameInput passedUserId={props.passedUserId} joinRoom={props.joinRoom} />
      </div>
      <BackButton text="Back" destPath="/" />
    </>
  );
};

export { Game, FindGame };
