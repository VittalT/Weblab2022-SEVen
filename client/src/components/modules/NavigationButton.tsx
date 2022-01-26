import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./NavigationButton.css";
import Button from "@mui/material/Button";

type Props = {
  destPath: string;
  text: string;
  onClickFunction: React.MouseEventHandler<HTMLAnchorElement>;
};

const NavigationButton = (props: Props) => {
  return (
    <Button
      size="large"
      sx={{
        marginBottom: 3,
        fontSize: 30,
        borderRadius: 4,
        width: 250,
        fontFamily: "Odibee Sans",
        backgroundColor: "#98C1D9",
        "&:hover": {
          backgroundColor: "#6CB1D9",
        },
      }}
      variant="contained"
      component={Link}
      onClick={props.onClickFunction}
      to={props.destPath}
    >
      {props.text}
    </Button>
  );
  // return (
  //   <Link onClick={props.onClickFunction} to={props.destPath} className="NavigationButton-button">
  //     <p className="NavigationButton-text u-gameText">{props.text}</p>
  //   </Link>
  // );
};

export default NavigationButton;
