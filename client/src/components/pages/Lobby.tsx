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

import User from "../../../../shared/User";

type Props = RouteComponentProps & {
  passedUserId: string;
  joinRoom: (userId: string, gameCode: string) => void;
  forceNavigate: () => void;
};

const Lobby = (props: Props) => {
  const [publicGames, setPublicGames] = useState<Array<{ hostName: string; gameCode: string }>>([]);
  const [title, setTitle] = useState<string>("");

  const joinPublicGame = async (gameCode: string) => {
    const data = await post("/api/joinGame", { gameCode: gameCode });
    await props.joinRoom(props.passedUserId, gameCode);
    navigate("/gameconfig");
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
  }, []);

  useEffect(() => {
    socket.on("updatePublicLobby", () => {
      get("/api/getPublicGames").then((data) => {
        setPublicGames(data);
        if (data.length === 0) {
          setTitle("CURRENTLY NO PUBLIC GAMES");
        } else {
          setTitle("PUBLIC GAMES");
        }
      });
    });
    props.forceNavigate();
    get("/api/getPublicGames").then((data) => {
      setPublicGames(data);
      if (data.length === 0) {
        setTitle("CURRENTLY NO PUBLIC GAMES");
      } else {
        setTitle("PUBLIC GAMES");
      }
    });
    return () => {
      socket.off("updatePublicLobby");
    };
  }, []);

  return (
    <>
      <div className="u-gameContainer">
        <h1 className="u-gameHeader">LOBBY</h1>
        <div className="Lobby-column">
          <div className="Lobby-lobbyTitle">{title}</div>
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
                    backgroundColor: "#ff8ba0",
                    "&:hover": {
                      backgroundColor: "#e76682",
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
