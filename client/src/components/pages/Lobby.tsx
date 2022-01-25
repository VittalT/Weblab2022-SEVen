import React, { useState, useEffect } from "react";
import "../../utilities.css";
import "./Lobby.css";

import NavigationButton from "../modules/NavigationButton";

import { Router, RouteComponentProps, navigate } from "@reach/router";

import BackButton from "../modules/BackButton";
import { get, post } from "../../utilities";

import LobbyGameDisplay from "../modules/LobbyGameDisplay";

import { Game } from "./FindGame";
import { socket } from "../../client-socket";

import Button from "@mui/material/Button";

type Props = RouteComponentProps & {
  passedUserId: string;
  joinRoom: (userId: string, gameCode: string) => void;
  forceNavigate: () => void;
};

const Lobby = (props: Props) => {
  const [publicGames, setPublicGames] = useState<Array<{ hostName: string; gameCode: string }>>([]);

  const joinPublicGame = async (gameCode: string) => {
    const data = await post("/api/joinGame", { gameCode: gameCode });
    await props.joinRoom(props.passedUserId, gameCode);
    navigate("/gameconfig");
  };

  useEffect(() => {
    socket.on("updatePublicLobby", () => {
      get("/api/getPublicGames").then((data) => {
        setPublicGames(data);
      });
    });
    props.forceNavigate();
    get("/api/getPublicGames").then((data) => {
      setPublicGames(data);
    });
    return () => {
      socket.off("updatePublicLobby");
    };
  }, []);

  return (
    <>
      <div className="Lobby-container">
        <h3 className="Lobby-header">MINION BATTLE</h3>
        <div className="Lobby-lobbyContainer">
          <div className="Lobby-lobbyTitle">PUBLIC GAMES</div>
          <div>
            {publicGames.map((game: { hostName: string; gameCode: string }) => (
              <div className="Lobby-center">
                <Button
                  size="medium"
                  sx={{
                    marginTop: 1,
                    marginBottom: 1,
                    fontSize: 15,
                    borderRadius: 3,
                    backgroundColor: "#98c1d9",
                    "&:hover": {
                      backgroundColor: "#6CB1D9",
                    },
                  }}
                  variant="contained"
                  onClick={() => joinPublicGame(game.gameCode)}
                >
                  {game.hostName + "'s Game"}
                </Button>
              </div>
            ))}{" "}
          </div>
        </div>
      </div>
      <BackButton text="BACK" destPath="/findgame" />
    </>
  );
};

export default Lobby;
