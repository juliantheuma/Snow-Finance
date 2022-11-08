import { Avatar, Button, Tab, Table, TabList, Tag } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import BankTransfer from "../Animations/BankTransferAnimation";
import LoadingAnimation from "../Animations/LoadingAnimation";
import Signature from "../Animations/Signature";
import Success from "../Animations/Success";
import "../App.css";
import Modal from "../Components/Modal";
import { snowCoinABI, snowPoolABI, tradingPlatformABI } from "../ContractsABI";
import { snowCoinAddress, snowPoolAddress, tradingPlatformAddress } from "../ContractsAddresses";
import { deposit, getMaticPrice, getToken, tokenSignIn } from "../firebase";
import snowman from "../Navbar/pfpPlaceholder.jpg";
import MySnowmen from "../Snowmen/MySnowmen";
import { Web3AuthContext, Web3Context } from "../Web3Context";
import coinImage from "./coin.png"

function Portfolio() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [depositState, setDepositState] = useState("selecting");
  const [wallet, setWallet] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const web3AuthContext = useContext(Web3AuthContext)
  const web3Context = useContext(Web3Context);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null)
  const [orderState, setOrderState] = useState(null)
  const [totalBalance, setTotalBalance] = useState(0)


  useEffect(() => {
    loadData();
    async function loadData() {
      let accounts = await web3Context.web3.eth.getAccounts();
      console.log(accounts);
      setWallet(accounts[0]);

      let tradingContract = new web3Context.web3.eth.Contract(
        tradingPlatformABI,
        tradingPlatformAddress
      );

      tradingContract.methods
        .getTraderOrders(accounts[0])
        .call()
        .then(async (orders) => {
          console.log(orders);

          let ordersDetails = [];

          let openTradeDetails = [];
          let tradeHistoryDetails = [];
          let index = 0;

          let maticPrice = await getMaticPrice();

          await getDetails();
          console.log(ordersDetails);
          setOpenTrades(ordersDetails);

          console.log("Open Trade Details");
          console.log(openTradeDetails);
          console.log("Trade History Details");
          setOpenTrades(openTradeDetails);
          setTradeHistory(tradeHistoryDetails);
          setDataLoaded(true)

          console.log(tradeHistoryDetails);

          async function getDetails() {
            if (index !== orders.length) {
              console.log(orders.length);
              console.log(index);
              let details = await tradingContract.methods
                .orderDetails(orders[index])
                .call();

              console.log(details);
              let stockPriceInMatic = await getStockData(
                "MATIC",
                details.ticker
              );

              let parsed = {};
              parsed.amount = details.quantity;
              parsed.price = details.price;
              parsed.type = details.longOrShort;
              parsed.investment = details.investment;
              parsed.id = orders[index];
              parsed.settled = orders.settled;
              parsed.ticker = details.ticker;

              console.log(parsed);

              if(parsed.settled !== true){

                let tickerData = await getStockData("MATIC", parsed.ticker);
                let lastPrice = tickerData;
                let purchasePrice = web3Context.web3.utils.fromWei(parsed.price);

                let priceDifferenceInMatic = Math.abs(purchasePrice - lastPrice);
                let priceDifferencePercentage = Math.abs(priceDifferenceInMatic * 100 / purchasePrice);
                
                let maticPrice = await getMaticPrice();
                let priceDifferenceInUsd = priceDifferenceInMatic * maticPrice
                
                let profitOrLoss = Math.abs(priceDifferenceInUsd * web3Context.web3.utils.fromWei(parsed.amount))
                
                if((parsed.type === "LONG" && lastPrice > purchasePrice) ||
                    (parsed.type === "SHORT" && lastPrice < purchasePrice)){
                  parsed.isProfitable = true;
                }
                else{
                  parsed.isProfitable = false;
                }
                  parsed.priceDifferenceInMatic = priceDifferenceInMatic;
                  parsed.priceDifferenceInUsd = priceDifferenceInUsd
                  parsed.priceDifferencePercentage = priceDifferencePercentage;
                  parsed.profitOrLoss = profitOrLoss;

                openTradeDetails.push(parsed)
              }

              // let profitAmount =
              //   web3Context.web3.utils.fromWei(parsed.amount) *
              //     stockPriceInMatic -
              //   web3Context.web3.utils.fromWei(parsed.investment);

              // profitAmount = profitAmount * maticPrice;

              // console.log("bought at: ",web3Context.web3.utils.fromWei(parsed.price) + "MATIC");

              // console.log("price now: ",stockPriceInMatic + "MATIC")

              // let profitPercentage = 100 * (web3Context.web3.utils.fromWei(parsed.price) - stockPriceInMatic) / web3Context.web3.utils.fromWei(parsed.price)

              // let profitType = profitAmount >= 0 ? "PROFIT" : "LOSS";
              // let profitPercentage1 =
              //   (parseFloat(profitAmount) * 100) /
              //   web3Context.web3.utils.fromWei(parsed.investment);

              // console.log("$" + profitAmount);
              // console.log(profitPercentage + "%")
              // console.log(web3Context.web3.utils.fromWei(parsed.investment));

              // if (
              //   parsed.type === "SHORT" &&
              //   web3Context.web3.utils.fromWei(parsed.price) <
              //     maticPrice * stockPriceInMatic
              // ) {
              //   profitAmount *= -1;
              //   profitPercentage *= -1;
              //   profitType = "LOSS";
              // }

              // parsed.profitAndLoss = {
              //   type: profitType,
              //   amount: profitAmount,
              //   percentage: profitPercentage,
              // };
              // if (details.settled == false) {
              //   openTradeDetails.push(parsed);
              // } else if (details.settled === true) {
              //   parsed.profitAndLoss = null;
              // }
              // console.log(parsed)
              // if(parsed.profitAndLoss && parsed.profitAndLoss.type === "LOSS"){parsed.profitAndLoss.percentage *= -1}
              tradeHistoryDetails.push(parsed);
              index++;
              return getDetails();
            }
            
          }
        });
        await getTotalBalance()
    }
    
    
  }, [web3Context]);
  async function getStockData(unit = "USD", ticker) {
    let res = null;
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    let url = null;
    if (unit === "USD") {
      url = `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${ticker}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;
    } else if (unit === "MATIC") {
      url = `https://ice-finance-matic-api.herokuapp.com/stocks/${ticker}`;
    }

    await fetch(url, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let data = JSON.parse(result);
        if (unit === "USD") {
          let stockData = data.FormattedQuoteResult.FormattedQuote[0];
          console.log(stockData);
          res = stockData;
        } else if (unit === "MATIC") {
          let stockData = data.stockPriceInMatic;
          res = stockData;
          console.log(stockData);
        }
      })
      .catch((error) => console.log("error", error));
    return res;
  }
  async function handleClosePosition(idToClose) {
    let tradingContract = new web3Context.web3.eth.Contract(
      tradingPlatformABI,
      tradingPlatformAddress
    );

    tradingContract.methods
      .closeTrade(idToClose)
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
      })
      .on("error", (error) => {
        console.log("error");
        console.log(error);
        setOrderState("failed");
      });
  }
  async function getTotalBalance() {
    let totalBalance = 0;

    //get MATIC Balance
    let maticBalance = await web3Context.web3.eth.getBalance(wallet);
    console.log(maticBalance)
    let maticPrice = await getMaticPrice();
    totalBalance += (web3Context.web3.utils.fromWei(maticBalance) * maticPrice)
    //  Convert to USD
    //  add to portfolio[] {value: "999.99", name: "MATIC"}
    openTrades.forEach(async openTrade => {
      console.log(openTrade.ticker)
      let stockDetails = await getStockData("USD", openTrade.ticker)
      totalBalance += stockDetails.ExtendedMktQuote.last * web3Context.web3.utils.fromWei(openTrade.amount)
    })

    let snowCoincontract = new web3Context.web3.eth.Contract(
      snowCoinABI,
      snowCoinAddress
    );

    let snowPoolContract = new web3Context.web3.eth.Contract(
      snowPoolABI,
      snowPoolAddress
    );

    let snowBal = await snowCoincontract.methods.balanceOf(wallet).call();
    snowBal = snowBal / 10 ** 18;

    let snowPerMatic = await snowPoolContract.methods.getSnowPerMatic().call();
    let _maticPerSnow = 1 / snowPerMatic;

    let snowBalInMatic = _maticPerSnow * snowBal

    totalBalance += maticPrice * snowBalInMatic

    console.log(totalBalance)
    setTotalBalance(totalBalance)
    //get Active Trades
    //  foreach active trade
    //    get amount * currentPrice
    //    add to portfolio[] {value: "999.99", name: "AAPL"}

    //get SNOW Balance
    //  SNOW * MATIC / SNOW
    //    Convert to USD
    //    add to portfolio[] {value: "999.99", name: "SNOW"}
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
    {wallet && <div style={{height: "100vh", paddingTop: "2em"}}>
      <div className="p-15" style={{width: "80%", margin: "0 auto"}}>
        <h4 style={{fontWeight: "bold"}}>Total Funds</h4>
        <h1 style={{fontSize: "32px", marginBottom: "0.1em"}}>${totalBalance.toLocaleString("en-US")}</h1>
        <Button
          text="+ Deposit"
          theme="secondary"
          onClick={() => {
            setModalIsOpen(true);
            // deposit100();
          }}
        />
      </div>
      <div style={{marginTop: "2em"}}>
        <div style={{margin: "0 auto", width: "80%"}}>
        <MySnowmen />
        </div>
        <div style={{width: "80%", margin: "0 auto", paddingTop: "2em"}}>
          <h4 style={{fontWeight: "bold", marginBottom: "0.5em"}}>Your Active Trades</h4>
          <div style={{ backgroundColor: "#F7F7F7", borderRadius: "0.5em", minHeight: "300px"}}>
          <div style={{display: "flex", marginBottom: "1em", backgroundColor: "#195289", borderRadius: "10px", paddingTop: "0.25em", paddingBottom: "0.25em", color: "white"}}>
            <h4 style={{width: "25%", display: "flex", justifyContent: "center", fontWeight: "bold"}}>Amount</h4>
            <h4 style={{width: "25%", display: "flex", justifyContent: "center", fontWeight: "bold"}}>Type</h4>
            <h4 style={{width: "25%", display: "flex", justifyContent: "center", fontWeight: "bold"}}>Profit or Loss</h4>
            <h4 style={{width: "25%", display: "flex", justifyContent: "center", fontWeight: "bold"}}></h4>
          </div>
        {dataLoaded && openTrades.length > 0 &&
              openTrades.map((openTrade) => (
                <div
                  key={openTrade.id}
                  style={{
                    display: "flex",
                    width: "100%",
                    marginBottom: "0.3em",
                  }}
                >
                  <div style={{width: "25%", display: "flex", justifyContent: "center"}}>
                  {web3Context &&
                    Math.round(
                      web3Context.web3.utils.fromWei(openTrade.amount) * 100
                      ) /
                      100 +
                      " " +
                      openTrade.ticker}
                      </div>
                  <div style={{width: "25%", display: "flex", justifyContent: "center"}}>

                  <Tag
                    color="black"
                    onCancelClick={function noRefCheck() {}}
                    text={openTrade.type}
                    tone="dark"
                    fontSize="12px"
                  />
                  </div>
                  <div style={{width: "25%", display: "flex", justifyContent: "center"}}>

                  <span
                    style={{
                      color:
                        openTrade.isProfitable
                          ? "green"
                          : "red",
                    }}
                  >
                    {openTrade.isProfitable ? "+$" : "-$"}
                    {Math.round(openTrade.profitOrLoss * 100) / 100}(
                    {openTrade.isProfitable ? "+" : ""}
                    {Math.round(openTrade.priceDifferencePercentage * 100) / 100}
                    %)
                  </span>
                  </div>
                  <div style={{width: "25%", display: "flex", justifyContent: "center"}}>
                  <Button
                    text="x"
                      color="red"
                    theme="colored"
                    onClick={() => {
                      setClosingTrade(openTrade);
                      setOrderState("closing");
                      setModalIsOpen(true);
                      // handleClosePosition(openTrade.id)
                    }}
                    size="regular"
                  />
                  </div>
                </div>
              ))}
            {dataLoaded && openTrades.length === 0 && (
              <h4 style={{textAlign: "center", margin: "0 auto"}}>You currently don't have any open orders.</h4>
            )}
            {!dataLoaded && <LoadingAnimation /> }
            </div>
            </div>
        
      </div>
      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        {depositState === "selecting" && !orderState && (
          <>
            <h4 style={{textAlign: "center", color:"#001e3d"}}>
              <b>Select Amount To Deposit</b>
              
            </h4>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: "1em",
              }}
            >
              <div
                style={{
                  width: "20%",
                  backgroundColor: "#A9C9E6",
                  borderRadius: "5%",
                  textAlign: "center",
                  paddingTop: "50px",
                  paddingBottom: "50px",
                  marginRight: "3em",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setDepositState("loading");
                  deposit(50);
                }}
              >
                <h4 style={{textAlign: "center", fontSize: "1.5em"}}><b>$0.50</b></h4>
              </div>
              <div
                style={{
                  width: "20%",
                  backgroundColor: "#195289",
                  borderRadius: "5%",
                  textAlign: "center",
                  paddingTop: "50px",
                  paddingBottom: "50px",
                  color: "white",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setDepositState("loading");
                  deposit(100);
                }}
              >
                <b style={{fontSize: "1.5em"}}>
                $1.00
                </b>
              </div>
            </div>
            <h4 style={{textAlign: "center", marginTop: "2em", color: "#737373"}}>Note! Deposits are currently limited to $1.00 due to our low number of
              funds of Mumbai MATIC. Please select how much you would like to
              deposit.</h4>
          </>
        )}
        {depositState === "loading" && (
          <>
          <BankTransfer />
            <h4>Connecting to Financial Service Provider...</h4>
          </>
        )}
        {orderState === "closing" && (
          <>
            <h4 style={{ marginBottom: "1em" }}>
              <b>Are you sure you want to close this trade?</b>
            </h4>
            {/* <h4>Transaction ID: {closingTrade.id}</h4>
            <h4>
              Amount: {web3Context.web3.utils.fromWei(closingTrade.amount)}{" "}
              {stockInfo && stockInfo.name}
            </h4>
            <h4>
              Profit And Loss: ${closingTrade.profitAndLoss.amount} (
              {closingTrade.profitAndLoss.type === "PROFIT" ? "+" : "-"}
              {Math.round(closingTrade.profitAndLoss.percentage * 100) / 100}%)
            </h4> */}
            <div style={{ display: "flex" }}>
              <Button
                theme="primary"
                text="Confirm"
                onClick={() => {
                  handleClosePosition(closingTrade.id);
                  setOrderState("sign");
                }}
              />
              <Button theme="secondary" text="Cancel" />
            </div>
          </>
        )}
        {orderState === "sign" && (
          <>
          <Signature />
            <h4>Please Sign the tx.</h4>
          </>
        )}
        {orderState === "pending" && (
          <>
            <LoadingAnimation />
            <h4>Your Order Is Being Closed!</h4>
          </>
        )}
        {orderState === "confirmed" && (
          <>
          <Success />
            <h4>Transaction Complete</h4>
            {/* <h4>{orderAmount + " " + stockInfo.name} shares have been added to your account</h4> */}
          </>
        )}
        {orderState === "failed" && <h4>Txn failed. Please try again</h4>}
      </Modal>
    </div>}
    {!wallet && <>
      <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
      <h4>Please <b>Sign In</b> to view your <b>portfolio</b>...</h4>
      <h4 style={{marginBottom: "0.5em"}}>Your portfolio is a summary of all your assets: Stocks, Snowmen, Snow Coins </h4>
      <Button theme="primary" onClick={() => handleSignIn()} text="Sign In"  />
      </div>
    </>}
    </>
  );
}

export default Portfolio;
