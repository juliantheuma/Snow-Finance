import { Avatar, Button, Input, Select, Table, Tag } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import { snowCoinABI, snowPoolABI } from "../ContractsABI";
import { snowCoinAddress, snowPoolAddress } from "../ContractsAddresses";
import { Web3AuthContext, Web3Context } from "../Web3Context";
import { ReactComponent as Vault } from "./vault.svg";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./SnowPool.css";
import { db, getMaticPrice, getToken, tokenSignIn } from "../firebase";
import { collection, doc, getDocs, getFirestore, onSnapshot, query } from "firebase/firestore";
import Modal from "../Components/Modal";
import { useNavigate } from "react-router-dom";
import VaultAnimation from "../Animations/VaultAnimation";
import Success from "../Animations/Success";
import vaultImg from "./vault.png";
import Web3 from "web3";
ChartJS.register(ArcElement, Tooltip, Legend);

function SnowPool() {
  const web3AuthContext = useContext(Web3AuthContext);
  const web3Context = useContext(Web3Context);
  const [wallet, setWallet] = useState(null);
  const [snowBalance, setSnowBalance] = useState(0);
  const [fundsInContract, setFundsInContract] = useState(0);
  const [snowPerMatic, setSnowPerMatic] = useState(0);
  const [snowSupply, setSnowSupply] = useState(0);
  const [maticPerSnow, setMaticPerSnow] = useState(0);
  const [snowBalanceMatic, setSnowBalanceMatic] = useState(0);
  const [snowBalanceUSD, setSnowBalanceUSD] = useState(0);
  const [snowTxs, setSnowTxs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(null);
  const [amount, setAmount] = useState(0);
  const [unit, setUnit] = useState(null);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  let navigate = useNavigate();

  async function loadData() {
    let accounts = await web3Context.web3.eth.getAccounts();
    setWallet(accounts[0]);
    console.log(web3Context);

    let snowCoincontract = new web3Context.web3.eth.Contract(snowCoinABI, snowCoinAddress);

    let snowBal = await snowCoincontract.methods.balanceOf(accounts[0]).call();
    snowBal = snowBal / 10 ** 18;
    setSnowBalance(snowBal);

    let snowSupply = await snowCoincontract.methods.totalSupply().call();
    snowSupply = web3Context.web3.utils.fromWei(snowSupply, "ether");
    setSnowSupply(snowSupply);
    console.log(snowCoincontract.methods);
    console.log(web3Context);

    let snowPoolContract = new web3Context.web3.eth.Contract(snowPoolABI, snowPoolAddress);
    console.log("SNOW POOL METHODS:");
    console.log(snowPoolContract.methods);
    let snowPerMatic = await snowPoolContract.methods.getSnowPerMatic().call();
    console.log(snowPerMatic);
    setSnowPerMatic(snowPerMatic);
    let fundsInContract = await snowPoolContract.methods.getFundsInContract().call();
    console.log(fundsInContract);
    fundsInContract = web3Context.web3.utils.fromWei(fundsInContract, "ether");
    console.log("funds In Contract ", fundsInContract);
    setFundsInContract(fundsInContract);
    let _maticPerSnow = 1 / snowPerMatic;
    setMaticPerSnow(_maticPerSnow);
    console.log(snowBal);
    setSnowBalanceMatic(snowBal * _maticPerSnow);
    let maticPrice = await getMaticPrice();
    setSnowBalanceUSD(maticPrice * snowBal * _maticPerSnow);

    console.log(snowTxs);
  }

  function handleCloseDialog() {
    setPending(false);
    setConfirmed(false);
    setIsOpen(false);
  }
  useEffect(() => {
    loadData();
  }, wallet);

  useEffect(() => {
    const q = query(collection(db, "moralis/events/Snowcoin"));
    onSnapshot(q, (querySnapshot) => {
      const tempTxs = [];
      querySnapshot.forEach((doc) => {
        let tempTxn = doc.data();
        console.log(tempTxn);
        let type = null;

        if (tempTxn.from === "0x0000000000000000000000000000000000000000") {
          type = <Tag color="red" text="DEPOSIT" />;
        } else if (tempTxn.to === "0x0000000000000000000000000000000000000000") {
          type = <Tag color="green" text="WITHDRAW" />;
        } else {
          type = <Tag color="gray" text="TRANSFER" />;
        }
        tempTxn.to = tempTxn.to.slice(0, 5) + "..." + tempTxn.to.slice(-4);
        tempTxn.from = tempTxn.from.slice(0, 5) + "..." + tempTxn.from.slice(-4);

        let parsedTxn = [type, tempTxn.from, tempTxn.to, tempTxn.value / 10 ** 18];
        console.log(parsedTxn);
        tempTxs.push(parsedTxn);
      });
      console.log(querySnapshot);
      setSnowTxs(tempTxs);
    });
  }, []);

  async function handleConfirm() {
    //Set Amount To MATIC
    setPending(true);
    let maticAmount = amount;
    if (unit === "USD") {
      let maticPrice = await getMaticPrice();
      maticAmount = amount / maticPrice;
    }

    let snowPoolContract = new web3Context.web3.eth.Contract(snowPoolABI, snowPoolAddress);

    console.log("SNOW POOL METHODS:");
    console.log(snowPoolContract.methods);

    let maticInWei = web3Context.web3.utils.toWei(maticAmount.toString(), "ether");
    if (type === "Deposit") {
      await snowPoolContract.methods
        .depositAndMint(wallet)
        .send({ from: wallet, value: maticInWei })
        .then((response) => console.log(response));
      setPending(false);
      setConfirmed(true);
      loadData();
    }

    if (type === "Withdraw") {
      //Check for approval
      let snowCoinContract = new web3Context.web3.eth.Contract(snowCoinABI, snowCoinAddress);

      await snowCoinContract.methods
        .allowance(wallet, snowPoolAddress)
        .call()
        .then((response) => {
          console.log(response);
          if (response > maticAmount) {
            //Is approved
            snowPoolContract.methods
              .burnAndClaim(wallet, web3Context.web3.utils.toWei(amount.toString(), "ether"))
              .send({ from: wallet })
              .on("transactionHash", (hash) => {
                console.log("Hash");
                console.log(hash);
                setPending(true);
                setConfirmed(false);
              })
              .on("receipt", (receipt) => {
                console.log("receipt");
                console.log(receipt);
                setPending(false);
                setConfirmed(true);
              })
              .on("error", (error) => {
                console.log("error");
                console.log(error);
              })
              .then((response) => {
                console.log(response);
                loadData();
              });
          } else {
            //If is not approved

            //Approve
            snowCoinContract.methods
              .approve(snowPoolAddress, web3Context.web3.utils.toWei("9999999999999999999", "ether"))
              .send({ from: wallet })
              .then((response) => {
                console.log(response);

                //Withdraw
                snowPoolContract.methods
                  .burnAndClaim(wallet, web3Context.web3.utils.toWei(amount.toString(), "ether"))
                  .send({ from: wallet })
                  .on("transactionHash", (hash) => {
                    console.log("Hash");
                    console.log(hash);
                    setPending(true);
                    setConfirmed(false);
                  })
                  .on("receipt", (receipt) => {
                    console.log("receipt");
                    console.log(receipt);
                    setPending(false);
                    setConfirmed(true);
                  })
                  .on("error", (error) => {
                    console.log("error");
                    console.log(error);
                  })
                  .then((response) => {
                    console.log(response);
                    loadData();
                  });
              });
          }
        });
      console.log(snowCoinContract.methods);
      //

      //Call Approval if not
      //Call Withdraw
    }

    // if (type === "Withdraw") {
    //   snowPoolContract.methods.burnAndClaim(wallet, amount);
    // } else if (type === "Deposit") {
    //   snowPoolContract.methods.depositAndMint(wallet);
    // }
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
    <>
      {wallet && (
        <div style={{ height: "100%" }}>
          <div style={{ marginTop: "2em", height: "100%" }}>
            {/* <div
          className="left-container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            marginLeft: "5em",
          }}
        >
          <div style={{display: "flex", width: "100%"}}>
          <div style={{backgroundColor: "#d9d9d940", paddingLeft: "1em", paddingRight: "1em", borderRadius: "21px", width: "100%"}}>
            <h1 style={{color: "white",textEmphasis: "bold", marginTop: "1em", backgroundColor: "#15538a", borderRadius: "12px", textAlign: "center", fontSize: "16px", paddingTop: "0.5em", paddingBottom: "0.5em", paddingRight: "2em", paddingLeft: "2em"}}><b>Your Balance {(Math.floor(snowBalance * 100) / 100).toLocaleString("en-US")} SNOW</b></h1>
            <div style={{display: "flex", justifyContent: "center", paddingTop: "0.5em", paddingBottom: "0.5em"}}>
            <h5 style={{color: "#5c86ac", marginRight: "1.5em"}}><b>≈ ${Math.floor(snowBalanceUSD * 100) / 100}</b></h5>
            <h5 style={{color: "#5c86ac"}}><b>≈ { Math.floor(snowBalanceMatic * 10000) / 10000} MATIC</b></h5>
            </div>
            
          </div>
          <div style={{ display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "space-between"}}>
            <div style={{marginBottom: "0.25em"}}>
              <Button
                text="Withdraw"
                theme="secondary"
                onClick={() => {
                  setIsOpen(true);
                  setType("Withdraw");
                }}
                size="large"
                />
                </div>
                <div style={{width: "100%"}}>
              <Button
                text="Deposit"
                theme="secondary"
                onClick={() => {
                  setIsOpen(true);
                  setType("Deposit");
                }}
                size="large"
                />
                </div>
            </div>
            </div>
          <div className="pie-chart-container">


<div style={{display: "flex", marginTop: "3em", width: "100%"}}>

              <div className="card" style={{backgroundColor: "#a9c9e6", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em", marginLeft: "1em", width: "50%", aspectRatio: "1 / 1", marginRight: "1em"}}>
                <h6 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center"  }}>Your Profit</h6>
                <h5 style={{color: "white", fontWeight: "500", textAlign: "center"}}>$2,000</h5>
              </div>
              <div className="card" style={{backgroundColor: "#195289", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em", width: "50%", aspectRatio: "1 / 1"}}>
                <h6 style={{ color: "white", fontWeight: "bold", textAlign: "center"  }}>Funds In Vault</h6>
                <h5 style={{color: "#a9c9e6", fontWeight: "500", textAlign: "center"}}>{Math.floor(fundsInContract * 100) / 100} MATIC</h5>
              </div>
              </div>
              <div style={{display: "flex"}}>

              <div className="card" style={{backgroundColor: "#195289", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em",  marginLeft: "1em", width: "50%",aspectRatio: "1 / 1", marginRight: "1em"}}>
                <h6 style={{ color: "white", fontWeight: "bold", textAlign: "center"  }}>SNOW/MATIC</h6>
                <h5 style={{color: "#a9c9e6", fontWeight: "500", textAlign: "center"}}>{parseInt(snowPerMatic).toLocaleString("en-US")}</h5>
              </div>
              <div className="card" style={{backgroundColor: "#a9c9e6", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em", width: "50%", aspectRatio: "1 / 1"}}>
                <h6 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center"  }}>SNOW Supply</h6>
                <h5 style={{color: "white", fontWeight: "500", textAlign: "center"}}>{Math.floor(snowSupply).toLocaleString("en-US")}</h5>
              </div>
              </div>

          </div>
        </div> */}
            <div style={{ width: "38.5%", marginLeft: "7.5%", marginBottom: "2em", display: "flex", alignItems: "center" }}>
              <div style={{ backgroundColor: "#d9d9d940", paddingLeft: "1em", paddingRight: "1em", borderRadius: "21px", width: "100%" }}>
                <h1
                  style={{
                    color: "white",
                    textEmphasis: "bold",
                    marginTop: "1em",
                    backgroundColor: "#15538a",
                    borderRadius: "12px",
                    textAlign: "center",
                    fontSize: "16px",
                    paddingTop: "0.5em",
                    paddingBottom: "0.5em",
                    paddingRight: "2em",
                    paddingLeft: "2em",
                  }}
                >
                  <b>Your Balance {(Math.floor(snowBalance * 100) / 100).toLocaleString("en-US")} SNOW</b>
                </h1>
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5em", paddingBottom: "0.5em" }}>
                  <h5 style={{ color: "#5c86ac", marginRight: "1.5em" }}>
                    <b>≈ ${Math.floor(snowBalanceUSD * 100) / 100}</b>
                  </h5>
                  <h5 style={{ color: "#5c86ac" }}>
                    <b>≈ {Math.floor(snowBalanceMatic * 10000) / 10000} MATIC</b>
                  </h5>
                </div>
              </div>
              <div style={{ marginLeft: "0.5em" }}>
                <Button
                  theme="secondary"
                  text="Deposit"
                  onClick={() => {
                    setIsOpen(true);
                    setType("Deposit");
                  }}
                />
                <Button
                  theme="secondary"
                  text="Withdraw"
                  onClick={() => {
                    setIsOpen(true);
                    setType("Withdraw");
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", width: "100%", justifyContent: "center", marginTop: "50px" }}>
              <div style={{ display: "flex", width: "87%" }}>
                <div style={{ width: "50%" }}>
                  <div style={{ display: "flex" }}>
                    <div
                      className="card"
                      style={{
                        backgroundColor: "#a9c9e6",
                        textAlign: "center",
                        marginTop: "0.5em",
                        marginBottom: "0.5em",
                        marginLeft: "1em",
                        width: "50%",
                        aspectRatio: "1 / 1",
                        marginRight: "1em",
                      }}
                    >
                      <h6 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>Your Share</h6>
                      <h5 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>{(snowBalance / snowSupply) * 100}%</h5>
                    </div>
                    <div
                      className="card"
                      style={{ backgroundColor: "#195289", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em", width: "50%", aspectRatio: "1 / 1" }}
                    >
                      <h6 style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Funds In Vault</h6>
                      <h5 style={{ color: "#a9c9e6", fontWeight: "500", textAlign: "center" }}>{Math.floor(fundsInContract * 100) / 100} MATIC</h5>
                    </div>
                  </div>

                  <div style={{ display: "flex" }}>
                    <div
                      className="card"
                      style={{
                        backgroundColor: "#195289",
                        textAlign: "center",
                        marginTop: "0.5em",
                        marginBottom: "0.5em",
                        marginLeft: "1em",
                        width: "50%",
                        aspectRatio: "1 / 1",
                        marginRight: "1em",
                      }}
                    >
                      <h6 style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>SNOW/MATIC</h6>
                      <h5 style={{ color: "#a9c9e6", fontWeight: "500", textAlign: "center" }}>{parseInt(snowPerMatic).toLocaleString("en-US")}</h5>
                    </div>
                    <div
                      className="card"
                      style={{ backgroundColor: "#a9c9e6", textAlign: "center", marginTop: "0.5em", marginBottom: "0.5em", width: "50%", aspectRatio: "1 / 1" }}
                    >
                      <h6 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>SNOW Supply</h6>
                      <h5 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>{Math.floor(snowSupply).toLocaleString("en-US")}</h5>
                    </div>
                  </div>
                </div>
                <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img src={vaultImg} style={{ width: "25vw" }}></img>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "1.5em", justifyContent: "center", alignItems: "center", width: "100%" }}>
            <h1>
              Recent <b>SNOW Coin</b> Transactions
            </h1>
            <div style={{ width: "85%", marginTop: "0.5em" }}>
              <Table
                columnsConfig="2fr 2fr 2fr 2fr"
                data={snowTxs}
                header={[<span>Type</span>, <span>From</span>, <span>To</span>, <span>Amount</span>]}
                isColumnSortable={[true, true, true, true]}
                maxPages={3}
                onPageNumberChanged={function noRefCheck() {}}
                onRowClick={function noRefCheck() {}}
                pageSize={5}
                alignCellItems="center"
                justifyCellItems="center"
                isScrollableOnOverflow={false}
              />
            </div>
          </div>
          <Modal isOpen={isOpen} onClose={() => handleCloseDialog()} type={type} amount={amount} unit={unit} onConfirm={() => handleConfirm()}>
            {!confirmed && !pending && (
              <>
                <h4 style={{ marginBottom: "1em" }}>Select Amount To {type}</h4>
                <div style={{ display: "flex", width: "100%", justifyItems: "center" }}>
                  <div style={{ marginRight: "0.3em" }}>
                    <Input type="number" width="10%" onChange={(val) => setAmount(val.target.value)} />
                  </div>
                  <Select
                    traditionalHTML5
                    value={0}
                    options={
                      type === "Deposit"
                        ? [
                            { label: "USD", id: "USD" },
                            { label: "MATIC", id: "MATIC" },
                          ]
                        : [{ label: "SNOW", id: "SNOW" }]
                    }
                    onChangeTraditional={(val) => setUnit(val.target.value)}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "0.5em" }}>
                  <Button theme="primary" text="Submit" onClick={() => handleConfirm()} />
                  <Button theme="secondary" text="Cancel" onClick={() => handleCloseDialog()} />
                </div>
              </>
            )}
            {!confirmed && pending && (
              <>
                <VaultAnimation />
                <h4>Your Transaction Is Being Processed...</h4>
              </>
            )}
            {confirmed && !pending && (
              <>
                <Success />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <h4 style={{ marginBottom: "0.5em" }}>
                    <b>Transaction Confirmed!</b>
                  </h4>
                  {type === "Withdraw" ? (
                    <>
                      <h4>Funds have been deposited to your account</h4>
                      <h4>You have burnt {amount} SNOW Coins</h4>
                    </>
                  ) : (
                    <h4>
                      {amount} {unit} were depositted to the vault
                    </h4>
                  )}
                </div>
              </>
            )}
          </Modal>
        </div>
      )}
      {!wallet && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h4>
            Please <b>sign in</b> to access the vault...
          </h4>
          <h4 style={{ marginBottom: "0.5em" }}>All Snow Finance's profits enter the vault and are distributed to SNOW Coin holders.</h4>
          <Button text="Sign In" theme="primary" onClick={() => handleSignIn()} />
        </div>
      )}
    </>
  );
}

export default SnowPool;
