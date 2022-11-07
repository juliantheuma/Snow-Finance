import { Button, Input } from "@web3uikit/core";
import React, { useState } from "react";
import "./Sidebar.css";
import { SidebarData } from "./SidebarData";
import { Link } from "react-router-dom";
import { Search } from "@web3uikit/icons";


function Sidebar() {
  const [sidebarTicker, setSidebarTicker] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <>
    
      
      (<div className="Sidebar">
      <div style={{display: "flex", marginBottom: "1em", marginTop: "1em", marginLeft: "0.5em"}}>
        <div style={{border: "1px solid gray"}}>
      <input placeholder="Stock Name or Ticker" type="text" list="stockList" style={{borderColor: "blue"}} onSelect={selection => setSidebarTicker(selection.target.value)} ></input>
        </div>
      <div style={{width: "100px", marginLeft: "0.5em"}}>
        <Link to={`/stocks/${sidebarTicker}`} state={{ticker: sidebarTicker}} >
          <button type="submit">
      <Search fontSize="24px" />
          </button>
        </Link>
      </div>
      </div>
      <datalist id="stockList" style={{ width: "150px" }}>
        <option value="MSFT">Microsoft</option>
        <option value="AAPL">Apple</option>
        <option value="TSLA">Tesla</option>
        <option value="GOOG">Google</option>
        <option value="AMZN">Amazon</option>
        <option value="NVDA">NVIDIA Corporation</option>
        <option value="META">Meta Platforms, Inc.</option>
      </datalist>
      <ul className="SidebarList">
        {SidebarData.map((val, key) => {
          return (
            <>
            <Link to={val.link}>
              <li
                className="row"
                id={window.location.pathname == val.link ? "active" : ""}
                key={key}
              >
                <div id="icon">{val.icon}</div>{" "}
                <div id="title">{val.title}</div>
              </li>
              </Link>
            </>
          );
        })}
      </ul></div>)
    
    </>
  );
}

export default Sidebar;
