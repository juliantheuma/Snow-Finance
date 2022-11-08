import React, { useState, useEffect, useContext } from "react";
import "./Navbar.css";
import { Button, Avatar } from "@web3uikit/core";
import Logo from "./logo.png";
import pfp from "./pfpPlaceholder.jpg";

import { Web3Auth } from "@web3auth/web3auth";
import { getToken, tokenSignIn } from "../firebase";
import Web3 from "web3";
import { Link } from "react-router-dom";

import { Web3Context } from "../Web3Context";
import { Web3AuthContext } from "../Web3Context";
import { LogOut } from "@web3uikit/icons";

function Navbar() {
  const web3Context = useContext(Web3Context);
  const web3AuthContext = useContext(Web3AuthContext);

  const [loggedIn, setLoggedIn] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  // const [web3Auth, setWeb3Auth] = useState(null);
  // const [web3, setWeb3] = useState(null);
  const clientId =
    "BKorS2uUfX8ydSIz6PWXKCWnQ814rsQAKnmjeqfZceYzKqsUUQhfQcTBAD14pq7KsVKQtrkgXkNjO_eXjZpZ4fY";

  useEffect(() => {
    setUp();

    async function setUp() {

      let a = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: "eip155",
          chainId: "0x13881", // hex of 80001, polygon testnet
          rpcTarget:
            "https://polygon-mumbai.infura.io/v3/0e23b2c508c54983a71b485af5a2b0f2",
          // Avoid using public rpcTarget in production.
          // Use services like Infura, Quicknode etc
          displayName: "Polygon Mainnet",
          blockExplorer: "https://mumbai.polygonscan.com/",
          ticker: "MATIC",
          tickerName: "Matic",
        },
      });
      a.initModal();
      await web3AuthContext.setWeb3Auth(a);


    }
  }, []);

  async function handleSignIn() {
    console.log("Signing In...");
    const provider = await web3AuthContext.web3Auth.connect();
    console.log(web3AuthContext.web3Auth);
    console.log(provider);
    let b = new Web3(web3AuthContext.web3Auth.provider);
    let accounts = await b.eth.getAccounts();
    web3Context.setWeb3(b);

    let myAddress = accounts[0];
    // let balance = await b.eth.getBalance(myAddress);
    // console.log(balance);

    let token = await getToken(myAddress);
    await tokenSignIn(token);
    setLoggedIn(true);
  }

  function handleLogout() {
    setAvatarClicked(false);
    web3AuthContext.web3Auth.logout();
    setLoggedIn(false);
    console.log("logged out");
  }

  function handlePortfolioClicked() {
    setAvatarClicked(false);
  }

  return (
    <div className="navbar">
      <img src={Logo} className="logo"></img>
{/* 
      <div className="signIn-container">
        {!loggedIn && (
          <Button
            theme="outline"
            text="Sign In"
            onClick={() => handleSignIn()}
          />
        )}
        {/* {loggedIn && (
          <div>
            <div className="flex">
              <Avatar
                isRounded
                theme="image"
                image={pfp}
                onClick={() => setAvatarClicked(true)}
              />
            </div>
            <div className="avatar-container">
              {avatarClicked && (
                <div className="dropdown-container">
                  <div style={{display: "flex", alignItems: "center", justifyContent: "space-around", width: "100%"}}>
                  <LogOut fontSize="24px"  />
                  <h5 onClick={() => handleLogout()}>Logout</h5>
                    </div>
                </div>
              )}
            </div>
          </div>        )}
      </div> */}
    </div>
  );
}

export default Navbar;
