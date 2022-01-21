import React, { useState, useEffect, ReactElement } from "react";

import "../../utilities.css";
import "./Leaderboard.css";

import BackButton from "../modules/BackButton";

import { get, post } from "../../utilities";
import { User } from "../../../../server/models/User";
import { LeaderboardRecord } from "../modules/LeaderboardRecord";

import { RouteComponentProps } from "@reach/router";

const Leaderboard = (props: RouteComponentProps) => {
  const peopleToInclude = 5;
  const [bestRatings, setBestRatings] = useState<ReactElement[]>([]);
  const [bestAlltimeRatings, setBestAlltimeRatings] = useState<ReactElement[]>([]);
  const [highestGamesPlayed, setHighestGamesPlayed] = useState<ReactElement[]>([]);
  const [highestGamesWon, setHighestGamesWon] = useState<ReactElement[]>([]);

  useEffect(() => {
    get("/api/users").then((users: User[]) => {
      for (let i = 0; i < users.length; i++) console.log(users[i].rating);
      setBestRatings(
        users
          .sort((a: User, b: User) => b.rating - a.rating)
          .slice(0, peopleToInclude)
          .map((user: User) => (
            <LeaderboardRecord
              recordholder_id={user.googleid}
              recordholder_name={user.name}
              record_value={user.rating}
            />
          ))
      );
      setBestAlltimeRatings(
        users
          .sort((a: User, b: User) => b.all_time_rating - a.all_time_rating)
          .slice(0, peopleToInclude)
          .map((user: User) => (
            <LeaderboardRecord
              recordholder_id={user.googleid}
              recordholder_name={user.name}
              record_value={user.all_time_rating}
            />
          ))
      );
      setHighestGamesPlayed(
        users
          .sort((a: User, b: User) => b.games_played - a.games_played)
          .slice(0, peopleToInclude)
          .map((user: User) => (
            <LeaderboardRecord
              recordholder_id={user.googleid}
              recordholder_name={user.name}
              record_value={user.games_played}
            />
          ))
      );
      setHighestGamesWon(
        users
          .sort((a: User, b: User) => b.games_won - a.games_won)
          .slice(0, peopleToInclude)
          .map((user: User) => (
            <LeaderboardRecord
              recordholder_id={user.googleid}
              recordholder_name={user.name}
              record_value={user.games_won}
            />
          ))
      );
    });
  }, []);

  return (
    <>
      <div className="overallDiv">
        <div>
          <h1 className="Leaderboard-header">Leaderboard</h1>
        </div>
        <hr className="Leaderboard-line" />
        <div>
          <div className="Leaderboard-column">
            <h2>Current Rating</h2>
            <hr className="Leaderboard-line" />
            {bestRatings}
          </div>
          <div className="Leaderboard-column">
            <h2>All-time Rating</h2>
            <hr className="Leaderboard-line" />
            {bestAlltimeRatings}
          </div>
          <div className="Leaderboard-column">
            <h2>Games Played</h2>
            <hr className="Leaderboard-line" />
            {highestGamesPlayed}
          </div>
          <div className="Leaderboard-column">
            <h2>Games Won</h2>
            <hr className="Leaderboard-line" />
            {highestGamesWon}
          </div>
        </div>
        <BackButton text="BACK" destPath="/" />
      </div>
    </>
  );
};

export default Leaderboard;
