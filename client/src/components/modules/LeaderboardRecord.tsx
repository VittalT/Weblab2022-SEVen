import React from "react";
import { Link } from "@reach/router";
import "./LeaderboardRecord.css";

type LeaderboardRecordProps = {
  recordholder_id: string;
  recordholder_name: string;
  record_value: number;
};

const LeaderboardRecord = (props: LeaderboardRecordProps) => {
  return (
    <div className="Leaderboard-record">
      <p className="Leaderboard-record-user">{props.recordholder_name}</p>
      <p className="Leaderboard-record-value">{props.record_value}</p>
    </div>
  );
};

export { LeaderboardRecord };
