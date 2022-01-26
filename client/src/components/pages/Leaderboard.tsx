import React, { useState, useEffect, ReactElement } from "react";

import "../../utilities.css";
import "./Leaderboard.css";

import BackButton from "../modules/BackButton";

import { get, post } from "../../utilities";
import { User } from "../../../../server/models/User";
import { LeaderboardRecord } from "../modules/LeaderboardRecord";

import { RouteComponentProps, navigate } from "@reach/router";

type Props = RouteComponentProps & {
  forceNavigate: () => Promise<void>;
};

const Leaderboard = (props: Props) => {
  let peopleToInclude = 3;
  get("/api/users").then((users: User[]) => {
    peopleToInclude = users.length;
  });
  const [bestRatings, setBestRatings] = useState<Array<User>>([]);
  const [bestAlltimeRatings, setBestAlltimeRatings] = useState<Array<User>>([]);
  const [highestGamesPlayed, setHighestGamesPlayed] = useState<Array<User>>([]);
  const [highestGamesWon, setHighestGamesWon] = useState<Array<User>>([]);

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
    props.forceNavigate();

    get("/api/users").then((users: User[]) => {
      setBestRatings(
        users.sort((a: User, b: User) => b.rating - a.rating).slice(0, peopleToInclude)
      );
      setBestAlltimeRatings(
        users
          .sort((a: User, b: User) => b.all_time_rating - a.all_time_rating)
          .slice(0, peopleToInclude)
      );
      setHighestGamesPlayed(
        users.sort((a: User, b: User) => b.games_played - a.games_played).slice(0, peopleToInclude)
      );
      setHighestGamesWon(
        users.sort((a: User, b: User) => b.games_won - a.games_won).slice(0, peopleToInclude)
      );
    });
  }, []);

  return (
    <>
      <div className="u-gameContainer">
        <h1 className="u-gameHeader">Leaderboard</h1>
        <hr className="Leaderboard-line" />
        <div className="Leaderboard-statsContainer">
          <div className="Leaderboard-column">
            <h2 className="Leaderboard-header u-flex-justifyCenter">Current Rating</h2>
            <hr className="Leaderboard-line" />
            <div className="Leaderboard-panel">
              {bestRatings.map((user: User) => (
                <LeaderboardRecord
                  recordholder_id={user._id}
                  recordholder_name={user.name}
                  record_value={user.rating}
                />
              ))}
            </div>
          </div>
          <div className="Leaderboard-column">
            <h2 className="Leaderboard-header">All-time Rating</h2>
            <hr className="Leaderboard-line" />
            <div className="Leaderboard-panel">
              {bestAlltimeRatings.map((user: User) => (
                <LeaderboardRecord
                  recordholder_id={user._id}
                  recordholder_name={user.name}
                  record_value={user.all_time_rating}
                />
              ))}
            </div>
          </div>
          <div className="Leaderboard-column">
            <h2 className="Leaderboard-header">Games Played</h2>
            <hr className="Leaderboard-line" />
            <div className="Leaderboard-panel">
              {highestGamesPlayed.map((user: User) => (
                <LeaderboardRecord
                  recordholder_id={user._id}
                  recordholder_name={user.name}
                  record_value={user.games_played}
                />
              ))}
            </div>
          </div>
          <div className="Leaderboard-column">
            <h2 className="Leaderboard-header">Games Won</h2>
            <hr className="Leaderboard-line" />
            <div className="Leaderboard-panel">
              {highestGamesWon.map((user: User) => (
                <LeaderboardRecord
                  recordholder_id={user._id}
                  recordholder_name={user.name}
                  record_value={user.games_won}
                />
              ))}
            </div>
          </div>
        </div>
        <BackButton text="BACK" destPath="/" />
      </div>
    </>
  );
};

export default Leaderboard;
