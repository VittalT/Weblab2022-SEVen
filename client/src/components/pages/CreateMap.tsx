import React, { useState, useEffect } from "react";

import "../../utilities.css";
import "./CreateMap.css";

import NavigationButton from "../modules/NavigationButton";
import BackButton from "../modules/BackButton";

import { Router, RouteComponentProps } from "@reach/router";

type CreateMapProps = RouteComponentProps & {
  userId: string;
};

const CreateMap = (props: CreateMapProps) => {
  const [addGoldToggled, setAddGoldToggled] = useState(false);

  const toggleAddGold = () => {
    setAddGoldToggled(true);
  };

  return (
    <>
      <BackButton destPath="/homescreen" />
      <div className="Creation-titleContainer">
        <h1 className="Creation-gameTitle u-textCenter">Minion Battle</h1>
      </div>
      <div className="u-flex">
        <div className="Creation-subContainer">
          <canvas id="create-canvas" width="800" height="800" />
          <button className="Creation-button">Add gold</button>
        </div>
        <div className="Creation-subContainer"></div>
      </div>
    </>
  );
};

export default CreateMap;
