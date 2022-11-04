import { Button } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import Modal from "../Components/Modal";
import { snowmanABI } from "../ContractsABI";
import { snowmanAddress } from "../ContractsAddresses";
import { getSnowmenNfts } from "../firebase";
import snowman from "../Navbar/pfpPlaceholder.jpg";
import { Web3Context } from "../Web3Context";
import MySnowmen from "./MySnowmen";

function SnowMen() {
  const [wallet, setWallet] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderState, setOrderState] = useState(null);
  const [mySnowmen, setMySnowmen] = useState([]);
  const [snowmenMinted, setSnowmenMinted] = useState(100);

  const web3Context = useContext(Web3Context);

  useEffect(() => {
    let snowmenMetadata = [];

    load();
    async function load() {
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
      //get Supply
      let snowmenContract = new web3Context.web3.eth.Contract(
        snowmanABI,
        snowmanAddress
      );
      console.log(snowmenContract.methods);
      let _snowmenMinted = await snowmenContract.methods.getSupply().call();
      console.log(_snowmenMinted);
      setSnowmenMinted(_snowmenMinted);
    }
  }, [web3Context]);

  async function handleMint() {
    console.log("Minting...");
    let snowmenContract = new web3Context.web3.eth.Contract(
      snowmanABI,
      snowmanAddress
    );
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
        setOrderState("confirmed");
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
  return (
    <div>
      <MySnowmen />
      <div className="flex" style={{ justifyContent: "center" }}>
        <div>
          <img src={snowman} style={{ width: "150px" }}></img>
          Snowmen Holders benefit from commission free trading.
          <h4>{snowmenMinted && 100 - snowmenMinted} / 100 Left</h4>
          <div style={{ justifyContent: "center", width: "100%" }}>
            <Button
              text={snowmenMinted < 100 ? "BUY NOW" : "SOLD OUT"}
              theme="primary"
              onClick={() => handleMint()}
              disabled={snowmenMinted === 100}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
          setOrderState(null);
        }}
      >
        {!orderState && <>Are you sure you want to buy a Snowman?</>}
        {orderState === "pending" && <>Your Snowman is on his way!</>}
        {orderState === "confirmed" && <>Meet your snowman!</>}
        {orderState === "failed" && (
          <>Something went wrong. Your Snowman couldn't find you</>
        )}
      </Modal>
    </div>
  );
}

export default SnowMen;
