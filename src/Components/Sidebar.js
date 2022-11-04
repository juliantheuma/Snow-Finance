import React from "react";
import ListItem from "./ListItem";

function Sidebar() {
  return (
    <div>
      <div>
        {/* Avatar */}
        {/* Title */}
        {/* Balance */}
      </div>
      <ListItem text="Dashboard" />
      <ListItem text="My Stocks" />
      <ListItem text="Add Balance" />
      <ListItem text="Snowmen" />
      <ListItem text="Watchlist" />
      <ListItem text="Snow Pool" />
    </div>
  );
}

export default Sidebar;
