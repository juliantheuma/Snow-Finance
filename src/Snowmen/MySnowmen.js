import React from "react";
import { Web3Context } from "../Web3Context";
import { useContext, useEffect, useState } from "react";
import { getSnowmenNfts } from "../firebase";
import LoadingAnimation from "../Animations/LoadingAnimation";

function MySnowmen() {
  const [wallet, setWallet] = useState(null);
  const [mySnowmen, setMySnowmen] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false)

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
        setDataLoaded(true)
      }
      //get Images
    }
  }, [web3Context]);
  return (
    // <div style={{ borderRadius: "8px", border: "1px solid lightgray", width: "80%", height: "900px"}}>
    //   Your Snowmen
      
    //   {dataLoaded && <div style={{display: "flex", overflow: "auto"}}>
    //     {mySnowmen.length > 0 &&
    //       mySnowmen.map((snowman) => (
    //         <div style={{ textAlign: "center", marginRight: "0.5em" }}>
    //           <img
    //             src={snowman.metadata.image}
    //             style={{ width: "600px" }}
    //           ></img>
    //           {snowman.metadata.name}
    //         </div>
    //       ))}
    //       {mySnowmen.length === 0 && (
    //         <h4>You don't own any Snowmen.</h4>
    //       )}
    //     {/* <img src={snowman} style={{ width: "150px" }}></img>
    //       <img src={snowman} style={{ width: "150px" }}></img>
    //       <img src={snowman} style={{ width: "150px" }}></img>
    //       <img src={snowman} style={{ width: "150px" }}></img>
    //       <img src={snowman} style={{ width: "150px" }}></img> */}
    //   </div>}
        <div>
          <h4 style={{fontWeight: "bold", marginBottom: "0.5em"}}>Your Snowmen</h4>
          <div style={{display: "flex", overflow: "auto"}}>
            {
              mySnowmen.map((snowman) => (
                <>
                <img src={snowman.metadata.image} style={{width: "150px", marginLeft: "0.5em", marginRight: "0.5em", borderRadius: "20px"}}></img>
                </>
              ))
            }
          </div>
      {
        !dataLoaded && <LoadingAnimation />
      }
    </div>
  );
}

export default MySnowmen;
