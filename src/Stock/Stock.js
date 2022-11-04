import {
  Avatar,
  Button,
  Input,
  Select,
  Tab,
  Table,
  TabList,
  Tag,
  Typography,
} from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TradingViewWidget, { Themes, BarStyles } from "react-tradingview-widget";
import "./Stock.css";
import Modal from "../Components/Modal";
import { Web3Context } from "../Web3Context";
import { tradingPlatformABI } from "../ContractsABI";
import { tradingPlatformAddress } from "../ContractsAddresses";
import { getMaticPrice } from "../firebase";
import handshake from "./handshake.jpg";
import { parse } from "url";

function Stock() {
  const { ticker } = useParams();
  const [stockInfo, setStockInfo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderUnit, setOrderUnit] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const web3Context = useContext(Web3Context);
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
              let details = await tradingContract.methods
                .orderDetails(orders[index])
                .call();

              console.log(details);

              if (details.settled === false && details.ticker === ticker) {
                let parsed = {};
                parsed.amount = details.quantity;
                parsed.price = details.price;
                parsed.type = details.longOrShort;
                parsed.investment = details.investment;
                parsed.id = orders[index];

                console.log(parsed);

                let profitAmount =
                  web3Context.web3.utils.fromWei(parsed.amount) *
                    stockPriceInMatic -
                  web3Context.web3.utils.fromWei(parsed.investment);

                profitAmount = profitAmount * maticPrice;

                console.log(web3Context.web3.utils.fromWei(parsed.price));

                let profitType = profitAmount >= 0 ? "PROFIT" : "LOSS";
                let profitPercentage =
                  (parseFloat(profitAmount) * 100) /
                  web3Context.web3.utils.fromWei(parsed.investment);

                console.log("$" + profitAmount);
                console.log(web3Context.web3.utils.fromWei(parsed.investment));

                if (
                  parsed.type === "SHORT" &&
                  web3Context.web3.utils.fromWei(parsed.price) <
                    maticPrice * stockPriceInMatic
                ) {
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
  }, [web3Context]);

  async function handleOrder() {
    console.log(web3Context.web3);
    let tradingContract = new web3Context.web3.eth.Contract(
      tradingPlatformABI,
      tradingPlatformAddress
    );

    let _stockData = await getStockData();
    let maticPrice = await getMaticPrice();

    let orderAmountInMatic = 0;
    console.log(orderUnit);
    console.log(ticker);
    if (orderUnit === "USD") {
      //USD --> MATIC
      orderAmountInMatic = orderAmount / maticPrice;
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
  }, []);

  useEffect(() => {
    console.log(orderUnit);
  }, [orderUnit]);

  return (
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
                {stockInfo && stockInfo.yrloprice} -{" "}
                {stockInfo && stockInfo.yrhiprice}
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
          <TradingViewWidget
            symbol={"NASDAQ:" + ticker}
            theme={Themes.LIGHT}
            BarStyles="3"
            width="100%"
          />
        </div>

        <TabList
          defaultActiveKey={1}
          onChange={function noRefCheck() {}}
          tabStyle="bar"
        >
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
      <div style={{ width: "100%" }} id="md-view">
        <div className="basic-grid" style={{ width: "100%" }}>
          <div className="card price">
            {stockInfo && stockInfo.name} | {ticker}
            <div className="details">
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
                  {stockInfo && stockInfo.yrloprice} -{" "}
                  {stockInfo && stockInfo.yrhiprice}
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
          <div className="card graph">
            <div style={{ width: "100%", height: "100%" }}>
              <TradingViewWidget
                symbol={"NASDAQ:" + ticker}
                theme={Themes.LIGHT}
                BarStyles="3"
                width="100%"
              />
            </div>
          </div>
          <div className="card order">
            Order {stockInfo && stockInfo.name} Stocks
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1em",
                marginTop: "1em",
              }}
            >
              <div style={{ marginRight: "0.2em", width: "200px" }}>
                <Input
                  label="Amount"
                  onChange={(val) => setOrderAmount(val.target.value)}
                />
              </div>
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
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                text="LONG 📈"
                theme="primary"
                onClick={() => {
                  setModalIsOpen(true);
                  setOrderType("LONG");
                }}
              />
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
          <div className="card trades">
            Your Active Trades
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
                    {web3Context &&
                      Math.round(
                        web3Context.web3.utils.fromWei(openTrade.amount) * 100
                      ) /
                        100 +
                        " " +
                        ticker}
                    <Tag
                      color={openTrade.type === "LONG" ? "green" : "red"}
                      onCancelClick={function noRefCheck() {}}
                      text={openTrade.type}
                      tone="dark"
                      fontSize="10px"
                    />
                    <span
                      style={{
                        color:
                          openTrade.profitAndLoss.type === "PROFIT"
                            ? "green"
                            : "red",
                      }}
                    >
                      {openTrade.profitAndLoss.type === "PROFIT" ? "+$" : "-$"}
                      {Math.round(openTrade.profitAndLoss.amount * 100) / 100}(
                      {openTrade.profitAndLoss.type === "PROFIT" ? "+" : ""}
                      {Math.round(openTrade.profitAndLoss.percentage * 100) /
                        100}
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
              {openTrades.length === 0 && (
                <h4>You currently don't have any open {ticker} orders.</h4>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: "100%", height: "100%" }} id="xl-view">
        <div className="basic-grid" style={{ width: "100%" }}>
          <div className="card price">
            {stockInfo && stockInfo.name} | {ticker}
            <div className="details">
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
                  {stockInfo && stockInfo.yrloprice} -{" "}
                  {stockInfo && stockInfo.yrhiprice}
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
          <div className="card graph">
            <div style={{ width: "100%", height: "100%" }}>
              <TradingViewWidget
                symbol={"NASDAQ:" + ticker}
                theme={Themes.LIGHT}
                BarStyles="3"
                width="100%"
              />
            </div>
          </div>

          <div className="card open-trades">
            <div style={{ marginBottom: "1em" }}>Your Open Trades</div>

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
                marginBottom: "0.3em",
              }}
            >
              2 {ticker}{" "}
              <Tag
                color="green"
                onCancelClick={function noRefCheck() {}}
                text="LONG"
                tone="dark"
                fontSize="10px"
              />
              <span style={{ color: "green" }}>+$250.50 (2.37%) </span>
              <Button text="close" theme="secondary" />
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
              }}
            >
              <div style={{ mariginRight: "0.5em" }}>2 {ticker} </div>
              <div>
                <Tag
                  color="red"
                  onCancelClick={function noRefCheck() {}}
                  text="SHORT"
                  tone="dark"
                  fontSize="10px"
                />
              </div>
              <div>
                <span style={{ color: "red" }}>-$250.50 (2.37%) </span>
              </div>
              <div>
                <Button text="close" theme="secondary" />
              </div>
            </div>
            {/* <TabList
              defaultActiveKey={1}
              onChange={function noRefCheck() {}}
              tabStyle="bar"
            >
              <Tab
                tabKey={1}
                tabName={
                  <div style={{ display: "flex" }}>
                    <span style={{ paddingLeft: "4px" }}>Open Positions </span>
                  </div>
                }
              >
                
                <div
                  style={{
                    display: "flex",
                    paddingTop: "1em",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>2 {ticker} </span>
                  <Tag
                    color="red"
                    onCancelClick={function noRefCheck() {}}
                    text="SHORT"
                    tone="dark"
                  />
                  <span style={{ color: "red" }}>-$250.50 (2.37%) </span>
                  <Button text="close" theme="secondary" />
                </div>
              </Tab>
              <Tab
                tabKey={2}
                tabName={
                  <div style={{ display: "flex" }}>
                    <span style={{ paddingLeft: "4px" }}>Order </span>
                  </div>
                }
              >
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyItems: "center",
                  }}
                >
                  <div style={{ width: "100px" }}>
                    <Input />
                  </div>
                  <Select
                    width="150px"
                    options={[
                      {
                        label: "$",
                        id: "USD",
                      },
                      {
                        label: ticker,
                        id: ticker,
                      },
                    ]}
                  />
                </div>
              </Tab>
            </TabList> */}
          </div>
          <div className="card order">
            Order {ticker}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1em",
                marginTop: "1em",
              }}
            >
              <div style={{ marginRight: "0.2em", width: "200px" }}>
                <Input label="Amount" />
              </div>
              <Select
                traditionalHTML5
                width="100px"
                options={[
                  {
                    id: ticker,
                    label: ticker,
                  },
                  {
                    id: "USD",
                    label: "USD",
                  },
                ]}
              />
            </div>
            <div style={{ display: "flex" }}>
              <Button text="LONG 📈" theme="primary" />
              <Button
                text="SHORT 📉"
                theme="custom"
                customize={{
                  backgroundColor: "#e84118",
                  onHover: "lighten",
                  textColor: "#FFFFFF",
                }}
              />
            </div>
          </div>
          <div className="card recent-trades">
            <div style={{ marginBottom: "1em" }}>
              Recent {stockInfo && stockInfo.name} Trades
            </div>
            <div style={{ height: "400px", width: "350px" }}>
              <Table
                columnsConfig="1fr 1fr 1fr"
                data={[
                  [
                    <Avatar isRounded size={36} theme="image" />,
                    <Tag color="blue" text="Nft Collection" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Lazy Nft" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="yellow" text="Pack" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Nft Marketplace" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="purple" text="Bundle" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="green" text="Token" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="blue" text="Nft Collection" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Bundle" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="green" text="Token" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="blue" text="Nft Collection" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Lazy Nft" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="yellow" text="Pack" />,
                    "0x18...130e",
                  ],
                ]}
                header={["", <span>Type</span>, <span>Amount</span>]}
                isColumnSortable={[false, true, true]}
                maxPages={3}
                onPageNumberChanged={function noRefCheck() {}}
                onRowClick={function noRefCheck() {}}
                pageSize={5}
                alignCellItems="center"
                justifyCellItems="center"
                isScrollableOnOverflow={true}
              />
            </div>
          </div>
          <div className="card trade-history">
            Your Trade History
            <div style={{ height: "250px", width: "100%", marginTop: "1em" }}>
              <Table
                columnsConfig="1fr 1fr 1fr"
                data={[
                  [
                    <Avatar isRounded size={36} theme="image" />,
                    <Tag color="green" text="Long" />,
                    "15 AAPL ($12,500)",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Short" />,
                    "15 AAPL ($12,500)",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="yellow" text="Close" />,
                    "15 AAPL ($12,500)",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Nft Marketplace" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="purple" text="Bundle" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="green" text="Token" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="blue" text="Nft Collection" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Bundle" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="green" text="Token" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="blue" text="Nft Collection" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="red" text="Lazy Nft" />,
                    "0x18...130e",
                  ],
                  [
                    <Avatar fontSize={36} isRounded theme="image" />,
                    <Tag color="yellow" text="Pack" />,
                    "0x18...130e",
                  ],
                ]}
                header={["", <span>Type</span>, <span>Amount</span>]}
                isColumnSortable={[false, true, true]}
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
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
          setOrderState("ordering");
        }}
      >
        {orderState === "ordering" && (
          <div>
            <h4>
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
              <div style={{ display: "flex" }}>
                <span>Type:</span>
                <span style={{ marginLeft: "auto", color: "blue" }}>
                  {orderType === "LONG" ? "LONG 📈" : "SHORT 📉"}
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <span>{ticker} Price:</span>
                <span style={{ marginLeft: "auto", color: "blue" }}>
                  ${stockInfo && stockInfo.ExtendedMktQuote.last}
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <span>Amount:</span>
                {stockInfo && (
                  <span style={{ marginLeft: "auto", color: "blue" }}>
                    {orderUnit === ticker
                      ? orderAmount
                      : Math.round(
                          (orderAmount * 1000) / stockInfo.ExtendedMktQuote.last
                        ) / 1000}{" "}
                    shares
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  borderTop: "0.5px solid gray",
                  marginTop: "1em",
                  paddingTop: "0.5em",
                }}
              >
                <span>Total Price:</span>
                {stockInfo && (
                  <span style={{ marginLeft: "auto", color: "blue" }}>
                    <b>
                      $
                      {orderUnit === ticker
                        ? (
                            orderAmount * stockInfo.ExtendedMktQuote.last
                          ).toLocaleString("en-US")
                        : orderAmount}
                    </b>
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
              Amount: {web3Context.web3.utils.fromWei(closingTrade.amount)}{" "}
              {stockInfo && stockInfo.name}
            </h4>
            <h4>
              Profit And Loss: ${closingTrade.profitAndLoss.amount} (
              {closingTrade.profitAndLoss.type === "PROFIT" ? "+" : "-"}
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
            <h4>Please Sign the tx.</h4>
          </>
        )}
        {orderState === "pending" && (
          <>
            <h4>Txn Pending...</h4>
          </>
        )}
        {orderState === "confirmed" && (
          <>
            <img src={handshake}></img>
            <h4>Txn Confirmed...</h4>
          </>
        )}
        {orderState === "failed" && <h4>Txn failed. Please try again</h4>}
      </Modal>
    </>
  );
}

export default Stock;
