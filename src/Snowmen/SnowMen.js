import { Button } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import Modal from "../Components/Modal";
import { snowmanABI } from "../ContractsABI";
import { snowmanAddress } from "../ContractsAddresses";
import { getSnowmenNfts, getToken, tokenSignIn } from "../firebase";
import snowman from "./pfp.png";
import { Web3AuthContext, Web3Context } from "../Web3Context";
import MySnowmen from "./MySnowmen";
import Success from "../Animations/Success";
import LoadingAnimation from "../Animations/LoadingAnimation";
import SnowBoard from "../Animations/SnowBoard";
import Web3 from "web3";
import CancelAnimation from "../Animations/CancelAnimation";

function SnowMen() {
  const [wallet, setWallet] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderState, setOrderState] = useState(null);
  const [mySnowmen, setMySnowmen] = useState([]);
  const [snowmenMinted, setSnowmenMinted] = useState(100);
  const [mintedToken, setMintedToken] = useState(null);

  const web3Context = useContext(Web3Context);
  const web3AuthContext = useContext(Web3AuthContext);

  useEffect(() => {
    let snowmenMetadata = [];

    load();
  }, [web3Context]);

  async function load() {
    console.log("LOADING DATA");

    //get Supply
    let snowmenContract = new web3Context.web3.eth.Contract(snowmanABI, snowmanAddress);
    console.log(snowmenContract.methods);
    let _snowmenMinted = await snowmenContract.methods.getSupply().call();
    console.log(_snowmenMinted);
    setSnowmenMinted(_snowmenMinted);

    let snowmenMetadata = [];

    let accounts = await web3Context.web3.eth.getAccounts();
    setWallet(accounts[0]);
    console.log(accounts[0]);
    let snowmen = await getSnowmenNfts(accounts[0]);
    console.log(snowmen);

    let index = 0;
    await getSnowmanImage();
    console.log(snowmenMetadata);
    setMySnowmen(snowmenMetadata);

    async function getSnowmanImage() {
      if (index < snowmen.json.result.length) {
        //get metadata
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        console.log(snowmen.json.result[index]);

        await fetch(snowmen.json.result[index].token_uri, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            console.log(result);
            let metadata = JSON.parse(result);
            console.log(metadata);

            snowmenMetadata.push({
              metadata,
            });
          })
          .catch((error) => console.log("error", error));
        return getSnowmanImage(index++);
      }
    }
  }

  async function handleMint() {
    console.log("Minting...");
    let snowmenContract = new web3Context.web3.eth.Contract(snowmanABI, snowmanAddress);
    console.log(snowmenContract.methods);
    snowmenContract.methods
      .mintSnowman()
      .send({ from: wallet })
      .on("transactionHash", (hash) => {
        console.log("Hash");
        console.log(hash);
        setOrderState("pending");
      })
      .on("receipt", (receipt) => {
        console.log("receipt");
        console.log(receipt);
        let mintedToken = {
          id: receipt.events.Transfer.returnValues.tokenId,
          image: `https://firebasestorage.googleapis.com/v0/b/fundamentals-8cb60.appspot.com/o/snowmen%2F${receipt.events.Transfer.returnValues.tokenId}.png?alt=media`,
        };
        setMintedToken(mintedToken);
        setOrderState("confirmed");
        load();
      })
      .on("confirmation", (receipt) => {
        console.log("Confirmation");
        console.log(receipt);
        setSnowmenMinted(snowmenMinted - 1);
      })
      .on("error", (error) => {
        console.log("error");
        console.log(error);
        setOrderState("failed");
      });
    setModalIsOpen(true);
  }

  async function handleSignIn() {
    console.log("Signing In...");
    const provider = await web3AuthContext.web3Auth.connect();
    console.log(web3AuthContext.web3Auth);
    console.log(provider);
    let b = new Web3(web3AuthContext.web3Auth.provider);
    let accounts = await b.eth.getAccounts();
    web3Context.setWeb3(b);

    let myAddress = accounts[0];

    let token = await getToken(myAddress);
    await tokenSignIn(token);
  }

  return (
    <div style={{ height: "100vh" }}>
      <div className="flex" style={{ flexDirection: "column", justifyItems: "center", alignItems: "center", width: "100%", height: "100%" }}>
        <img src={snowman} style={{ width: "150px", borderRadius: "10%" }}></img>
        {wallet ? (
          <>
            <h4>
              Claim Your Free Snowman To Benefit From <b>Commission Free Trading</b>.
            </h4>
            <h4>{snowmenMinted && 100 - snowmenMinted} / 100 Left</h4>
            <Button text={snowmenMinted < 100 ? "CLAIM NOW" : "SOLD OUT"} theme="primary" onClick={() => handleMint()} disabled={snowmenMinted === 100} />
          </>
        ) : (
          <>
            <h4 style={{ marginTop: "1em" }}>
              Please <b>Sign In</b> To Claim Your Snowman...
            </h4>
            <h4 style={{ marginBottom: "0.5em" }}>
              Having a snowman NFT grants you <b>commission free trading</b> on Snow Finance
            </h4>
            <Button text="Sign In" theme="primary" onClick={() => handleSignIn()} />
          </>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
          setOrderState(null);
        }}
      >
        {!orderState && web3AuthContext && web3AuthContext.web3Auth && web3AuthContext.web3Auth.connectedAdapterName !== "openlogin" && (
          <>Please Sign The Transaction To Claim Your Snowman.</>
        )}
        {((!orderState && web3AuthContext && web3AuthContext.web3Auth && web3AuthContext.web3Auth.connectedAdapterName === "openlogin") ||
          orderState === "pending") && (
          <>
            <SnowBoard />
            <h4 style={{ textAlign: "center" }}>Off to find a Snowman...</h4>
          </>
        )}

        {orderState === "pending" && web3AuthContext.web3Auth && web3AuthContext.web3Auth.connectedAdapterName !== "openlogin" && (
          <>
            <SnowBoard />
            Off to find a Snowman...
          </>
        )}
        {orderState === "confirmed" && (
          <>
            {" "}
            <Success />{" "}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h4 style={{ fontFamily: "" }}>You have claimed a Snowman!</h4>{" "}
              <button
                style={{
                  width: "85%",
                  paddingTop: "0.5em",
                  paddingBottom: "0.5em",
                  paddingLeft: "0.5em",
                  paddingRight: "0.5em",
                  marginTop: "0.75em",
                  backgroundColor: "#3d94e1",
                  color: "white",
                  borderRadius: "30px",
                }}
                onClick={() => setOrderState("reveal")}
              >
                Meet Your Snowman
              </button>
            </div>
          </>
        )}
        {orderState === "failed" && (
          <>
            <CancelAnimation />
            Something went wrong. Your Snowman couldn't find you
          </>
        )}
        {orderState === "reveal" && mintedToken && (
          <>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <button
                onClick={() => {
                  setOrderState(null);
                  setMintedToken(null);
                  setModalIsOpen(false);
                }}
              >
                x
              </button>
            </div>
            <img style={{ width: "200px", height: "200px", borderRadius: "20px" }} src={mintedToken.image}></img>
            <div style={{ display: "flex", justifyContent: "center" }}>Snowman #{mintedToken.id}</div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default SnowMen;
