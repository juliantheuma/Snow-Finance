import React from "react";
import "./ListItem.css";

function ListItem(props) {
  return <div className="item">{props.text}</div>;
}

export default ListItem;
