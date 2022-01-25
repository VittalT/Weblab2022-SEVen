import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./ColorLegend.css";
import { get } from "../../utilities";

type ForfeitProps = {};

const Forfeit = (props: ForfeitProps) => {
  const [teamIdToName, setTeamIdToName] = useState<Record<number, string>>({});
  useEffect(() => {}, []);
  return <div className="GamePanel-button GamePanel-buttonSmall u-flexColumn">Hi!</div>;
};

export default Forfeit;
