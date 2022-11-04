import { Avatar, Button, Tab, Table, TabList, Tag } from "@web3uikit/core";
import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import Modal from "../Components/Modal";
import { tradingPlatformABI } from "../ContractsABI";
import { tradingPlatformAddress } from "../ContractsAddresses";
import { deposit, getMaticPrice } from "../firebase";
import snowman from "../Navbar/pfpPlaceholder.jpg";
import MySnowmen from "../Snowmen/MySnowmen";
import { Web3Context } from "../Web3Context";

function Portfolio() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [depositState, setDepositState] = useState("selecting");
  const [wallet, setWallet] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const web3Context = useContext(Web3Context);

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
              if (details.settled == false) {
                openTradeDetails.push(parsed);
              } else if (details.settled === true) {
                parsed.profitAndLoss = null;
              }

              tradeHistoryDetails.push(parsed);
              index++;
              return getDetails();
            }
            async function getTotalBalance() {
              let totalBalance = 0;

              //get MATIC Balance
              //  Convert to USD
              //  add to portfolio[] {value: "999.99", name: "MATIC"}

              //get Active Trades
              //  foreach active trade
              //    get amount * currentPrice
              //    add to portfolio[] {value: "999.99", name: "AAPL"}

              //get SNOW Balance
              //  SNOW * MATIC / SNOW
              //    Convert to USD
              //    add to portfolio[] {value: "999.99", name: "SNOW"}
            }
          }
        });
    }

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
  }, [web3Context]);
  return (
    <div>
      <div className="p-15">
        <h4>Total Funds</h4>
        <h1>$175,000</h1>
        <Button
          text="+ Deposit"
          theme="primary"
          onClick={() => {
            setModalIsOpen(true);
            // deposit100();
          }}
        />
      </div>
      <div>
        <MySnowmen />
        <TabList
          defaultActiveKey={1}
          onChange={function noRefCheck() {}}
          tabStyle="bar"
        >
          <Tab
            tabKey={1}
            tabName={
              <div style={{ display: "flex" }}>
                <span style={{ paddingLeft: "4px" }}>Active Trades</span>
              </div>
            }
          >
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
                      openTrade.ticker}
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
                    {Math.round(openTrade.profitAndLoss.percentage * 100) / 100}
                    %)
                  </span>
                  <Button
                    text="close"
                    theme="secondary"
                    onClick={() => {
                      // setClosingTrade(openTrade);
                      // setOrderState("closing");
                      // setModalIsOpen(true);
                      //handleClosePosition(openTrade.id)}
                    }}
                  />
                </div>
              ))}
            {openTrades.length === 0 && (
              <h4>You currently don't have any open orders.</h4>
            )}
          </Tab>
          <Tab
            tabKey={2}
            tabName={
              <div style={{ display: "flex" }}>
                <span style={{ paddingLeft: "4px" }}>Trade History</span>
              </div>
            }
          >
            <div style={{ height: "250px", width: "350px" }}>
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
          </Tab>
        </TabList>
      </div>
      <Modal isOpen={modalIsOpen}>
        {depositState === "selecting" && (
          <>
            <h4>
              Deposits are currently limited to $1.00 due to our low number of
              funds of Mumbai MATIC. Please select how much you would like to
              deposit.
            </h4>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                marginTop: "1em",
              }}
            >
              <div
                style={{
                  width: "20%",
                  backgroundColor: "#a4b0be",
                  borderRadius: "10%",
                  textAlign: "center",
                  paddingTop: "50px",
                  paddingBottom: "50px",
                }}
                onClick={() => {
                  setDepositState("loading");
                  deposit(50);
                }}
              >
                $0.50
              </div>
              <div
                style={{
                  width: "20%",
                  backgroundColor: "#a4b0be",
                  borderRadius: "10%",
                  textAlign: "center",
                  paddingTop: "50px",
                  paddingBottom: "50px",
                }}
                onClick={() => {
                  setDepositState("loading");
                  deposit(100);
                }}
              >
                $1.00
              </div>
            </div>
          </>
        )}
        {depositState === "loading" && (
          <>
            <h4>Connecting to Financial Service Provider...</h4>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Portfolio;
