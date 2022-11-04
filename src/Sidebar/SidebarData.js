import React from "react";
import HomeIcon from "@material-ui/icons/Home";
import WorkOutlineIcon from "@material-ui/icons/WorkOutline";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import WavesIcon from "@material-ui/icons/Waves";
import PaidIcon from "@material-ui/icons/Payment";
export const SidebarData = [
  { title: "Home", icon: <HomeIcon />, link: "/" },
  { title: "Add Funds", icon: <PaidIcon />, link: "/deposit" },
  { title: "Portfolio", icon: <WorkOutlineIcon />, link: "/portfolio" },
  { title: "Snowmen", icon: <AccountCircleIcon />, link: "/snowmen" },
  { title: "Snow Pool", icon: <WavesIcon />, link: "/snowpool" },
];
