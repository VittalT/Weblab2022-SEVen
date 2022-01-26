import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
import "../../utilities.css";
import "./BackButton.css";
import Button from "@mui/material/Button";
import alpha from "@mui/system";
import { Brightness1, Brightness1Outlined } from "@material-ui/icons";

type Props = {
  destPath: string;
  text: string;
};

const BackButton = (props: Props) => {
  return (
    <Button
      size="medium"
      sx={{
        fontSize: 30,
        fontFamily: "Odibee Sans",
        width: 150,
        height: 50,
        borderRadius: 3,
        position: "fixed",
        top: 30,
        left: 30,
        backgroundColor: "#ff8ba0",
        "&:hover": {
          backgroundColor: "#e76682",
        },
      }}
      variant="contained"
      component={Link}
      to={props.destPath}
    >
      {props.text}
    </Button>
  );
};

export default BackButton;
