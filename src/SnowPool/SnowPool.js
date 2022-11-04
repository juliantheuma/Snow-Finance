import { Avatar, Button, Input, Select, Table, Tag } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import { snowCoinABI, snowPoolABI } from "../ContractsABI";
import { snowCoinAddress, snowPoolAddress } from "../ContractsAddresses";
import { Web3Context } from "../Web3Context";
import { ReactComponent as Vault } from "./vault.svg";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./SnowPool.css";
import { db, getMaticPrice } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
} from "firebase/firestore";
import Modal from "../Components/Modal";
ChartJS.register(ArcElement, Tooltip, Legend);

function SnowPool() {
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

  async function loadData() {
    let accounts = await web3Context.web3.eth.getAccounts();
    setWallet(accounts[0]);
    console.log(web3Context);

    let snowCoincontract = new web3Context.web3.eth.Contract(
      snowCoinABI,
      snowCoinAddress
    );

    let snowBal = await snowCoincontract.methods.balanceOf(accounts[0]).call();
    snowBal = snowBal / 10 ** 18;
    setSnowBalance(snowBal);

    let snowSupply = await snowCoincontract.methods.totalSupply().call();
    snowSupply = web3Context.web3.utils.fromWei(snowSupply, "ether");
    setSnowSupply(snowSupply);
    console.log(snowCoincontract.methods);
    console.log(web3Context);

    let snowPoolContract = new web3Context.web3.eth.Contract(
      snowPoolABI,
      snowPoolAddress
    );
    console.log("SNOW POOL METHODS:");
    console.log(snowPoolContract.methods);
    let snowPerMatic = await snowPoolContract.methods.getSnowPerMatic().call();
    console.log(snowPerMatic);
    setSnowPerMatic(snowPerMatic);
    let fundsInContract = await snowPoolContract.methods
      .getFundsInContract()
      .call();
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
        } else if (
          tempTxn.to === "0x0000000000000000000000000000000000000000"
        ) {
          type = <Tag color="green" text="WITHDRAW" />;
        } else {
          type = <Tag color="gray" text="TRANSFER" />;
        }
        tempTxn.to = tempTxn.to.slice(0, 5) + "..." + tempTxn.to.slice(-4);
        tempTxn.from =
          tempTxn.from.slice(0, 5) + "..." + tempTxn.from.slice(-4);

        let parsedTxn = [
          type,
          tempTxn.from,
          tempTxn.to,
          tempTxn.value / 10 ** 18,
        ];
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

    let snowPoolContract = new web3Context.web3.eth.Contract(
      snowPoolABI,
      snowPoolAddress
    );

    console.log("SNOW POOL METHODS:");
    console.log(snowPoolContract.methods);

    let maticInWei = web3Context.web3.utils.toWei(
      maticAmount.toString(),
      "ether"
    );
    if (type === "Deposit") {
      await snowPoolContract.methods
        .depositAndMint(wallet)
        .send({ from: wallet, value: maticInWei })
        .then((response) => console.log(response));
      setPending(false);
      setConfirmed(true);
    }

    if (type === "Withdraw") {
      //Check for approval
      let snowCoinContract = new web3Context.web3.eth.Contract(
        snowCoinABI,
        snowCoinAddress
      );

      await snowCoinContract.methods
        .allowance(wallet, snowPoolAddress)
        .call()
        .then((response) => {
          console.log(response);
          if (response > maticAmount) {
            //Is approved
            snowPoolContract.methods
              .burnAndClaim(
                wallet,
                web3Context.web3.utils.toWei(amount.toString(), "ether")
              )
              .send({ from: wallet })
              .then((response) => {
                console.log(response);
              });
          } else {
            //If is not approved

            //Approve
            snowCoinContract.methods
              .approve(
                snowPoolAddress,
                web3Context.web3.utils.toWei("9999999999999999999", "ether")
              )
              .send({ from: wallet })
              .then((response) => {
                console.log(response);

                //Withdraw
                snowPoolContract.methods
                  .burnAndClaim(
                    wallet,
                    web3Context.web3.utils.toWei(amount.toString(), "ether")
                  )
                  .send({ from: wallet })
                  .then((response) => {
                    console.log(response);
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
  return (
    <div>
      <div style={{ display: "flex" }}>
        <div
          className="left-container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            marginLeft: "5em",
          }}
        >
          <div className="balances-container">
            <h1>Your Balance</h1>
            <h4>{snowBalance} SNOW</h4>
            <h5>≈{snowBalanceMatic} MATIC</h5>
            <h5>≈${snowBalanceUSD}</h5>
            <div className="buttons mt-2">
              <Button
                text="Withdraw"
                theme="secondary"
                onClick={() => {
                  setIsOpen(true);
                  setType("Withdraw");
                }}
              />
              <Button
                text="Deposit"
                theme="secondary"
                onClick={() => {
                  setIsOpen(true);
                  setType("Deposit");
                }}
              />
            </div>
          </div>
          <div className="pie-chart-container">
            <h4>Today's Profits: $750,000</h4>
            <h4>Your Profits: $2,000</h4>
            <h4>Funds In Contract: {fundsInContract} MATIC</h4>
            <h4>SNOW/MATIC: {snowPerMatic}</h4>
            <h4>MATIC/SNOW: {maticPerSnow}</h4>
            <h4>SNOW Supply: {snowSupply}</h4>
          </div>
        </div>
        <div className="right-container">
          <div className="vault-container">
            <Vault />
          </div>
        </div>
      </div>
      <h1>
        Recent <b>SNOW Coin</b> Transactions
      </h1>
      <Table
        columnsConfig="1fr 1fr 1fr 1fr"
        data={snowTxs}
        header={[
          <span>Type</span>,
          <span>From</span>,
          <span>To</span>,
          <span>Amount</span>,
        ]}
        isColumnSortable={[true, true, true, true]}
        maxPages={3}
        onPageNumberChanged={function noRefCheck() {}}
        onRowClick={function noRefCheck() {}}
        pageSize={5}
        alignCellItems="center"
        justifyCellItems="center"
        isScrollableOnOverflow={false}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => handleCloseDialog()}
        type={type}
        amount={amount}
        unit={unit}
        onConfirm={() => handleConfirm()}
      >
        {!confirmed && !pending && (
          <>
            <h4 style={{ marginBottom: "1em" }}>Select Amount To {type}</h4>
            <div
              style={{ display: "flex", width: "100%", justifyItems: "center" }}
            >
              <div style={{ marginRight: "0.3em" }}>
                <Input
                  type="number"
                  width="10%"
                  onChange={(val) => setAmount(val.target.value)}
                />
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
          </>
        )}
        {!confirmed && pending && (
          <>
            <h4>Your Transaction Is On It's Way</h4>
          </>
        )}
        {confirmed && !pending && (
          <>
            <h4>Transaction Confirmed! Your {type} is on its way</h4>
          </>
        )}
      </Modal>
    </div>
  );
}

export default SnowPool;
