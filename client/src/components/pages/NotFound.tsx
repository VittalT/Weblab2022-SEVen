import React, { useState, useEffect } from "react";
import User from "../../../../shared/User";
import { get, post } from "../../utilities";
import { Router, RouteComponentProps, navigate } from "@reach/router";

type NotFoundProps = RouteComponentProps;

const NotFound = (props: NotFoundProps) => {
  useEffect(() => {
    get("/api/whoami").then((user: User) => {
      if (user._id === undefined) {
        navigate("/");
      }
    });

    const doThings = async () => {
      const data = await get("/api/getCurrRoomStatus");
      const currGameCode = data.gameCode;
      if (currGameCode.length === 6) {
        if (data.isInPlay === false) {
          navigate("/gameconfig");
        } else {
          navigate("/game");
        }
      }
    };

    doThings();
  });

  return <div></div>;
};

export default NotFound;
