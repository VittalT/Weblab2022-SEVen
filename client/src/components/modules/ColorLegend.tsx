import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "../../input";
import "./ColorLegend.css";
import { teamColors } from "../../../../shared/constants";
import { get } from "../../utilities";

type ColorLegendProps = {
  gameCode: string;
};

const ColorLegend = (props: ColorLegendProps) => {
  const [teamIdToName, setTeamIdToName] = useState<Record<number, string>>({});
  useEffect(() => {
    get("/api/getTeamIdToName", { gameCode: props.gameCode }).then((data) => {
      console.log(`teamIdToName ${JSON.stringify(data)}`);
      if (data.successful) {
        setTeamIdToName(data.teamIdToName);
      }
    });
  }, [props.gameCode]);
  return (
    <div className="GamePanel-body GamePanel-button u-flexColumn">
      {Object.entries(teamIdToName).map(([teamId, name], i) => (
        <div key={i} className="ColorLegend-text">
          <p>{name}</p>
          <span
            style={{ backgroundColor: teamColors[parseInt(teamId)] }}
            className="ColorLegend-colorDot"
          ></span>
        </div>
      ))}
    </div>
  );
};

export default ColorLegend;
