import React from "react";
import "./BuyForm.css";

function BuyForm() {
  return (
    <div className="container">
      <div className="top-buttons">
        <button className="top-button">Buy</button>
        <button className="top-button">Sell</button>
      </div>
      <div className="flex">
        <div>
          <h5>YOU PAY</h5>
          <input></input>
        </div>
        <div>
          <select>
            <option>EUR</option>
            <option>USD</option>
            <option>MATIC</option>
            <option>ETH</option>
          </select>
        </div>
      </div>
      <div className="flex">
        <div>
          <h5>YOU GET</h5>
          <input></input>
        </div>
        <div>
          <select>
            <option>AAPL</option>
            <option>MSFT</option>
            <option>TSLA</option>
            <option>GME</option>
          </select>
        </div>
      </div>
      <button>BUY</button>
    </div>
  );
}

export default BuyForm;
