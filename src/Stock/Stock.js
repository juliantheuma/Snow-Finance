import { Avatar, Button, Input, Select, Tab, Table, TabList, Tag, Typography } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TradingViewWidget, { Themes, BarStyles } from "react-tradingview-widget";
import "./Stock.css";
import Modal from "../Components/Modal";
import { Web3AuthContext, Web3Context } from "../Web3Context";
import { tradingPlatformABI } from "../ContractsABI";
import { tradingPlatformAddress } from "../ContractsAddresses";
import { getMaticPrice, getToken, tokenSignIn } from "../firebase";
import handshake from "./handshake.jpg";
import { parse } from "url";
import Lottie from "react-lottie";
import ContractSign from "../Animations/ContractSign";
import Signature from "../Animations/Signature";
import Success from "../Animations/Success";
import LoadingAnimation from "../Animations/LoadingAnimation";
import Web3 from "web3";

function Stock() {
  const { ticker } = useParams();
  const [stockInfo, setStockInfo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderUnit, setOrderUnit] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const web3Context = useContext(Web3Context);
  const web3AuthContext = useContext(Web3AuthContext);

  const [wallet, setWallet] = useState(null);
  const [orderState, setOrderState] = useState("ordering");
  const [openTrades, setOpenTrades] = useState([]);
  const [dataLoaded, setDataLoaded] = useState([]);
  const [closingTrade, setClosingTrade] = useState(null);

  async function calculateProfitAndLoss(amount, investment) {
    let stockData = await getStockData();
    console.log(stockData);
    console.log(amount, investment);

    return <h4>Hello</h4>;
  }
  async function loadData() {
    let accounts = await web3Context.web3.eth.getAccounts();
    console.log(accounts);
    setWallet(accounts[0]);

    let tradingContract = new web3Context.web3.eth.Contract(tradingPlatformABI, tradingPlatformAddress);

    tradingContract.methods
      .getTraderOrders(accounts[0])
      .call()
      .then(async (orders) => {
        console.log(orders);

        let ordersDetails = [];
        let index = 0;

        let stockPriceInMatic = await getStockData("MATIC");
        let maticPrice = await getMaticPrice();

        await getDetails();
        console.log(ordersDetails);
        setOpenTrades(ordersDetails);

        async function getDetails() {
          if (index !== orders.length) {
            console.log(orders.length);
            console.log(index);
            let details = await tradingContract.methods.orderDetails(orders[index]).call();

            console.log(details);

            if (details.settled === false && details.ticker === ticker) {
              let parsed = {};
              parsed.amount = details.quantity;
              parsed.price = details.price;
              parsed.type = details.longOrShort;
              parsed.investment = details.investment;
              parsed.id = orders[index];

              console.log(parsed);

              let profitAmount = web3Context.web3.utils.fromWei(parsed.amount) * stockPriceInMatic - web3Context.web3.utils.fromWei(parsed.investment);

              profitAmount = profitAmount * maticPrice;

              console.log(web3Context.web3.utils.fromWei(parsed.price));

              let profitType = profitAmount >= 0 ? "PROFIT" : "LOSS";
              let profitPercentage = (parseFloat(profitAmount) * 100) / web3Context.web3.utils.fromWei(parsed.investment);

              console.log("$" + profitAmount);
              console.log(web3Context.web3.utils.fromWei(parsed.investment));

              if (parsed.type === "SHORT" && web3Context.web3.utils.fromWei(parsed.price) < maticPrice * stockPriceInMatic) {
                profitAmount *= -1;
                profitPercentage *= -1;
                profitType = "LOSS";
              }

              parsed.profitAndLoss = {
                type: profitType,
                amount: profitAmount,
                percentage: profitPercentage,
              };

              ordersDetails.push(parsed);
            }
            index++;
            return getDetails();
          }
        }
      });

    setDataLoaded(true);
  }
  useEffect(() => {
    loadData();
  }, [web3Context]);

  async function handleOrder() {
    console.log(web3Context.web3);
    let tradingContract = new web3Context.web3.eth.Contract(tradingPlatformABI, tradingPlatformAddress);

    let _stockData = await getStockData();
    let maticPrice = await getMaticPrice();

    let orderAmountInMatic = 0;
    console.log(orderUnit);
    console.log(ticker);
    if (orderUnit === "USD") {
      //USD --> MATIC
      orderAmountInMatic = orderAmount / maticPrice;
      console.log(orderAmountInMatic);
    } else if (orderUnit === ticker) {
      //AAPL --> USD --> MATIC
      console.log(orderAmount + " shares");
      console.log("@" + _stockData.last + "each");
      console.log("MATIC/USD: " + maticPrice);

      orderAmountInMatic = (orderAmount * _stockData.last) / maticPrice;
    }

    // console.log(orderAmountInMatic * 10 ** 18);
    let a = Math.trunc(orderAmountInMatic).toString();
    let b = orderAmountInMatic.toFixed(18 - a.length);
    let orderAmountInMaticWei = web3Context.web3.utils.toWei(b);

    console.log(orderAmountInMaticWei);
    console.log(wallet);
    tradingContract.methods
      .order(ticker, orderType)
      .send({ from: wallet, value: orderAmountInMaticWei })
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

    // .then((response) => {
    //   console.log(response);
    // });
  }

  async function handleClosePosition(idToClose) {
    let tradingContract = new web3Context.web3.eth.Contract(tradingPlatformABI, tradingPlatformAddress);

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
        loadData();
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

  async function getStockData(unit = "USD") {
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
          setStockInfo(stockData);
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
  useEffect(() => {
    getStockData();
  }, [ticker]);

  useEffect(() => {
    console.log(orderUnit);
  }, [orderUnit]);

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
        <>
          <div style={{ width: "100%" }} id="mobile-view">
            <div className="price">
              {stockInfo && stockInfo.name} | {ticker}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  width: "100%",
                }}
              >
                <div className="card">
                  <h4 style={{ color: "blue" }}>Today's Change</h4>
                  <h6>
                    {stockInfo && stockInfo.ExtendedMktQuote.change}
                    {"  ("}
                    {stockInfo && stockInfo.ExtendedMktQuote.change_pct})
                  </h6>
                </div>

                <div className="card">
                  <h4 style={{ color: "blue" }}>52 Week Range</h4>
                  <h6>
                    {stockInfo && stockInfo.yrloprice} - {stockInfo && stockInfo.yrhiprice}
                  </h6>
                </div>

                <div className="card">
                  <h4 style={{ color: "blue" }}>Market Cap</h4>
                  <h6>{stockInfo && stockInfo.mktcapView}</h6>
                </div>

                <div className="card">
                  <h6 style={{ color: "blue" }}>Exchange</h6>
                  <h5>{stockInfo && stockInfo.exchange}</h5>
                </div>
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <TradingViewWidget symbol={"NASDAQ:" + ticker} theme={Themes.LIGHT} BarStyles="3" width="100%" />
            </div>

            <TabList defaultActiveKey={1} onChange={function noRefCheck() {}} tabStyle="bar">
              <Tab
                tabKey={1}
                tabName={
                  <div style={{ display: "flex" }}>
                    <span style={{ paddingLeft: "4px" }}>Orders </span>
                  </div>
                }
              >
                <p>Buy Stonks</p>
              </Tab>
              <Tab
                tabKey={2}
                tabName={
                  <div style={{ display: "flex" }}>
                    <span style={{ paddingLeft: "4px" }}>Trade History </span>
                  </div>
                }
              >
                Trade History
              </Tab>
            </TabList>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", marginTop: "1em" }} id="md-view">
            <div className="basic-grid" style={{ width: "90%" }}>
              <div className="card price">
                <b>
                  {stockInfo && stockInfo.name} | {ticker}
                </b>
                <div className="details" style={{ marginTop: "1em" }}>
                  <div className="card" style={{ backgroundColor: "#a9c9e6", textAlign: "center", marginRight: "0.5em" }}>
                    <h4 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>Today's Change</h4>
                    <h6 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>
                      {stockInfo && stockInfo.ExtendedMktQuote.change}
                      {"  ("}
                      {stockInfo && stockInfo.ExtendedMktQuote.change_pct})
                    </h6>
                  </div>

                  <div className="card" style={{ backgroundColor: "#a9c9e6", textAlign: "center", marginRight: "0.5em" }}>
                    <h4 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>52 Week Range</h4>
                    <h6 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>
                      ${stockInfo && stockInfo.yrloprice} - ${stockInfo && stockInfo.yrhiprice}
                    </h6>
                  </div>
                  <div className="card" style={{ backgroundColor: "#a9c9e6", textAlign: "center", marginRight: "0.5em" }}>
                    <h4 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>Market Cap</h4>
                    <h6 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>{stockInfo && stockInfo.mktcapView}</h6>
                  </div>
                  <div className="card" style={{ backgroundColor: "#a9c9e6", textAlign: "center" }}>
                    <h6 style={{ color: "#15538a", fontWeight: "bold", textAlign: "center" }}>Exchange</h6>
                    <h5 style={{ color: "white", fontWeight: "500", textAlign: "center" }}>{stockInfo && stockInfo.exchange}</h5>
                  </div>
                </div>
              </div>
              <div className="card graph">
                <div style={{ width: "100%", height: "100%" }}>
                  <TradingViewWidget symbol={"NASDAQ:" + ticker} theme={Themes.LIGHT} BarStyles="3" width="100%" />
                </div>
              </div>
              <div className="card order">
                <b>Order {stockInfo && stockInfo.name} Stocks</b>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1em",
                    marginTop: "1em",
                  }}
                >
                  <div style={{ marginRight: "0.2em", width: "100px" }}>
                    <Input label="Amount" onChange={(val) => setOrderAmount(val.target.value)} />
                  </div>
                  <div style={{ width: "180px" }}>
                    <Select
                      traditionalHTML5
                      width="100px"
                      options={[
                        {
                          id: ticker,
                          label: stockInfo && stockInfo.name + " Shares",
                          value: ticker,
                        },
                        {
                          id: "USD",
                          label: "USD",
                          value: "USD",
                        },
                      ]}
                      onChangeTraditional={(val) => {
                        setOrderUnit(val.target.options[val.target.selectedIndex].id);
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div title="Profit from the stock going up in price">
                    <Button
                      text="LONG 📈"
                      theme="primary"
                      onClick={() => {
                        setModalIsOpen(true);
                        setOrderType("LONG");
                      }}
                    />
                  </div>
                  <div title="Profit from the stock going down in price">
                    <Button
                      text="SHORT 📉"
                      theme="custom"
                      customize={{
                        backgroundColor: "#e84118",
                        onHover: "lighten",
                        textColor: "#FFFFFF",
                      }}
                      onClick={() => {
                        setModalIsOpen(true);
                        setOrderType("SHORT");
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="card trades">
                <b>Your Active {stockInfo && stockInfo.name} Trades</b>
                <div>
                  {openTrades.length > 0 &&
                    openTrades.map((openTrade) => (
                      <div
                        key={openTrade.id}
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-around",
                          marginBottom: "0.3em",
                        }}
                      >
                        {web3Context && Math.round(web3Context.web3.utils.fromWei(openTrade.amount) * 100) / 100 + " " + ticker}
                        <Tag
                          color={openTrade.type === "LONG" ? "green" : "red"}
                          onCancelClick={function noRefCheck() {}}
                          text={openTrade.type}
                          tone="dark"
                          fontSize="10px"
                        />
                        <span
                          style={{
                            color: openTrade.profitAndLoss.type === "PROFIT" ? "green" : "red",
                          }}
                        >
                          {openTrade.profitAndLoss.type === "PROFIT" ? "+$" : "-$"}
                          {Math.round(openTrade.profitAndLoss.amount * 100) / 100}({openTrade.profitAndLoss.type === "PROFIT" ? "+" : ""}
                          {Math.round(openTrade.profitAndLoss.percentage * 100) / 100}
                          %)
                        </span>
                        <Button
                          text="close"
                          theme="secondary"
                          onClick={() => {
                            setClosingTrade(openTrade);
                            setOrderState("closing");
                            setModalIsOpen(true);
                            //handleClosePosition(openTrade.id)}
                          }}
                        />
                      </div>
                    ))}
                  {openTrades.length === 0 && <h4>You currently don't have any open {ticker} orders.</h4>}
                </div>
              </div>
            </div>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onClose={() => {
              setModalIsOpen(false);
              setOrderState("ordering");
              loadData();
            }}
          >
            {orderState === "ordering" && (
              <div>
                <h4 style={{ color: "#195289", fontSize: "1.5em", marginBottom: "0.75em" }}>
                  <b>Are You Sure You Want To Place This Order?</b>
                </h4>
                <div
                  style={{
                    width: "70%",
                    margin: "0 auto",
                    marginTop: "1em",
                    marginBottom: "1em",
                  }}
                >
                  <div style={{ display: "flex", color: "#5c86ac" }}>
                    <span>Type:</span>
                    <span style={{ marginLeft: "auto", color: "#5c86ac" }}>{orderType === "LONG" ? "LONG" : "SHORT"}</span>
                  </div>
                  <div style={{ display: "flex", color: "#5c86ac" }}>
                    <span>{ticker} Price:</span>
                    <span style={{ marginLeft: "auto", color: "#5c86ac" }}>${stockInfo && stockInfo.ExtendedMktQuote.last}</span>
                  </div>
                  <div style={{ display: "flex", color: "#5c86ac" }}>
                    <span>Amount:</span>
                    {stockInfo && (
                      <span style={{ marginLeft: "auto", color: "#5c86ac" }}>
                        {orderUnit === ticker ? orderAmount : Math.round((orderAmount * 1000) / stockInfo.ExtendedMktQuote.last) / 1000} shares
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      borderTop: "0.5px solid gray",
                      marginTop: "1em",
                      paddingTop: "0.5em",
                      color: "#5c86ac",
                    }}
                  >
                    <span>
                      <b>Total Price:</b>
                    </span>
                    {stockInfo && (
                      <span style={{ marginLeft: "auto", color: "#5c86ac" }}>
                        <b>${orderUnit === ticker ? (orderAmount * stockInfo.ExtendedMktQuote.last).toLocaleString("en-US") : orderAmount}</b>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "0.5em",
                  }}
                >
                  <Button
                    text="Confirm"
                    theme="primary"
                    onClick={() => {
                      handleOrder();
                      setOrderState("sign");
                    }}
                  ></Button>
                  <Button text="Cancel" theme="secondary" onClick={() => {}} />
                </div>
              </div>
            )}
            {orderState === "closing" && (
              <>
                <h4 style={{ marginBottom: "1em" }}>
                  <b>Are you sure you want to close this trade?</b>
                </h4>
                <h4>Transaction ID: {closingTrade.id}</h4>
                <h4>
                  Amount: {web3Context.web3.utils.fromWei(closingTrade.amount)} {stockInfo && stockInfo.name}
                </h4>
                <h4>
                  Profit And Loss: ${closingTrade.profitAndLoss.amount} ({closingTrade.profitAndLoss.type === "PROFIT" ? "+" : "-"}
                  {Math.round(closingTrade.profitAndLoss.percentage * 100) / 100}%)
                </h4>
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
                <h4>Your Order Is On Its Way!</h4>
              </>
            )}
            {orderState === "confirmed" && (
              <>
                <Success />
                <h4>Transaction Complete</h4>
                <h4>{orderAmount + " " + stockInfo.name} shares have been added to your account</h4>
              </>
            )}
            {orderState === "failed" && (
              <>
                <h4>Txn failed. Please try again</h4>
              </>
            )}
          </Modal>
        </>
      )}
      {!wallet && (
        <>
          <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <h4 style={{ marginBottom: "0.5em" }}>
              Please <b>Sign In</b> to access the Stock Trading Platform.
            </h4>
            <Button theme="primary" text="Sign In" onClick={() => handleSignIn()} />
          </div>
        </>
      )}
    </>
  );
}

export default Stock;
