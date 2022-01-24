import React, { useState } from "react";

import "../../utilities.css";
import "./NewPostInput.css";
import { get, post } from "../../utilities";
import { Router, RouteComponentProps, navigate } from "@reach/router";

type NewPostInputProps = {
  defaultText: string;
  onSubmit: (value: string) => void;
};

const NewPostInput = (props: NewPostInputProps) => {
  const [value, setValue] = useState("");

  // called whenever the user types in the new post input box
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // called when the user hits "Submit" for a new post
  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    props.onSubmit && props.onSubmit(value);
    setValue("");
  };

  return (
    <div className="u-flex">
      <input
        type="text"
        placeholder={props.defaultText}
        value={value}
        onChange={handleChange}
        className="NewPostInput-input"
      />
      <button
        type="submit"
        className="NewPostInput-button u-pointer"
        value="Submit"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

type Props = RouteComponentProps & {
  passedUserId: string;
  joinRoom: (userId: string, gameCode: string) => void;
};

const PrivateGameInput = (props: Props) => {
  const join = async (gameCode: string) => {
    console.log("private button pressed, gamecode is " + gameCode);
    if (gameCode.length === 6) {
      const data = await post("/api/getGameActiveStatus", { gameCode: gameCode });
      if (data.isActive === true) {
        const data = await post("/api/joinGame", { gameCode: gameCode });
        await props.joinRoom(props.passedUserId, gameCode);
        navigate("/gameconfig");
      }
    }
  };

  return <NewPostInput defaultText="New Message" onSubmit={join} />;
};

export { NewPostInput, PrivateGameInput };
