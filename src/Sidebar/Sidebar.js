import { Input } from "@web3uikit/core";
import React from "react";
import "./Sidebar.css";
import { SidebarData } from "./SidebarData";
function Sidebar() {
  return (
    <div className="Sidebar">
      <input type="text" list="stockList"></input>
      <datalist id="stockList" style={{ width: "150px" }}>
        <option>Microsoft</option>
        <option value="AAPL">Apple</option>
        <option>Tesla</option>
        <option>Google</option>
        <option>S&P500</option>
        <option>FORD</option>
        <option>Gamestop</option>
        <option>AMC</option>
      </datalist>
      <ul className="SidebarList">
        {SidebarData.map((val, key) => {
          return (
            <>
              <li
                className="row"
                id={window.location.pathname == val.link ? "active" : ""}
                key={key}
                onClick={() => {
                  window.location.pathname = val.link;
                }}
              >
                <div id="icon">{val.icon}</div>{" "}
                <div id="title">{val.title}</div>
              </li>
            </>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;
