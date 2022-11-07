import { useContext, useEffect, useMemo, useState } from "react";
import { deposit100, getToken, tokenSignIn } from "./firebase";
import { Web3Auth } from "@web3auth/web3auth";
import Web3 from "web3";
import BuyForm from "./BuyForm";
import Navbar from "./Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Portfolio from "./Portfolio/Portfolio";
import Stock from "./Stock/Stock";
import Sidebar from "./Sidebar/Sidebar";
import SnowPool from "./SnowPool/SnowPool";
import { Web3Context } from "./Web3Context";
import { Web3AuthContext } from "./Web3Context";
import SnowMen from "./Snowmen/SnowMen";
import DepositHandler from "./DepositHandler/DepositHandler";
import Home from "./Home/Home";

function App() {
  const [web3, setWeb3] = useState(null);
  const [web3Auth, setWeb3Auth] = useState(null);

  const web3AuthProviderValue = useMemo(
    () => ({ web3Auth, setWeb3Auth }),
    [web3Auth, setWeb3Auth]
  );
  const web3ProviderValue = useMemo(
    () => ({
      web3,
      setWeb3,
    }),
    [web3, setWeb3]
  );
  // const [web3Auth, setWeb3Auth] = useState(null);
  // const [web3, setWeb3] = useState(null);
  // const clientId =
  //   "BKorS2uUfX8ydSIz6PWXKCWnQ814rsQAKnmjeqfZceYzKqsUUQhfQcTBAD14pq7KsVKQtrkgXkNjO_eXjZpZ4fY";

  // useEffect(() => {
  //   let a = new Web3Auth({
  //     clientId,
  //     chainConfig: {
  //       chainNamespace: "eip155",
  //       chainId: "0x13881", // hex of 80001, polygon testnet
  //       rpcTarget:
  //         "https://polygon-mumbai.infura.io/v3/0e23b2c508c54983a71b485af5a2b0f2",
  //       // Avoid using public rpcTarget in production.
  //       // Use services like Infura, Quicknode etc
  //       displayName: "Polygon Mainnet",
  //       blockExplorer: "https://mumbai.polygonscan.com/",
  //       ticker: "MATIC",
  //       tickerName: "Matic",
  //     },
  //   });
  //   setWeb3Auth(a);
  //   a.initModal();
  // }, []);

  // async function handleLogin() {
  //   const provider = await web3Auth.connect();
  //   console.log(web3Auth);
  //   console.log(provider);
  //   let b = new Web3(web3Auth.provider);
  //   let accounts = await b.eth.getAccounts();
  //   setWeb3(b);

  //   let myAddress = accounts[0];
  //   let balance = await b.eth.getBalance(myAddress);
  //   console.log(balance);
  //   let txHash = await b.eth.sendTransaction({
  //     from: myAddress,
  //     to: "0xF55EBF8dE3697cfC2719306cC5b2DACDA9Fa0bA3",
  //     value: "0x1",
  //   });
  //   console.log(txHash);
  //   let token = await getToken(myAddress);
  //   await tokenSignIn(token);
  // }

  // async function handleLogout() {
  //   web3Auth.logout();
  // }

  // async function handleDeposit() {
  //   await deposit100();
  // }

  // async function buyStonk(ticker) {
  //   console.log("coming soon...", ticker);
  //   let contract = new web3.eth.Contract(
  //     [
  //       {
  //         inputs: [],
  //         name: "acceptOwnership",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "string",
  //             name: "ticker",
  //             type: "string",
  //           },
  //         ],
  //         name: "buyStock",
  //         outputs: [
  //           {
  //             internalType: "bytes32",
  //             name: "requestId",
  //             type: "bytes32",
  //           },
  //         ],
  //         stateMutability: "payable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         stateMutability: "nonpayable",
  //         type: "constructor",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "bytes32",
  //             name: "id",
  //             type: "bytes32",
  //           },
  //         ],
  //         name: "ChainlinkCancelled",
  //         type: "event",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "bytes32",
  //             name: "id",
  //             type: "bytes32",
  //           },
  //         ],
  //         name: "ChainlinkFulfilled",
  //         type: "event",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "bytes32",
  //             name: "id",
  //             type: "bytes32",
  //           },
  //         ],
  //         name: "ChainlinkRequested",
  //         type: "event",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "bytes32",
  //             name: "_requestId",
  //             type: "bytes32",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "_priceInEth",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "fulfillBuy",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "bytes32",
  //             name: "_requestId",
  //             type: "bytes32",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "_priceInEth",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "fulfillSell",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "from",
  //             type: "address",
  //           },
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "to",
  //             type: "address",
  //           },
  //         ],
  //         name: "OwnershipTransferRequested",
  //         type: "event",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "from",
  //             type: "address",
  //           },
  //           {
  //             indexed: true,
  //             internalType: "address",
  //             name: "to",
  //             type: "address",
  //           },
  //         ],
  //         name: "OwnershipTransferred",
  //         type: "event",
  //       },
  //       {
  //         anonymous: false,
  //         inputs: [
  //           {
  //             indexed: true,
  //             internalType: "bytes32",
  //             name: "requestId",
  //             type: "bytes32",
  //           },
  //           {
  //             indexed: false,
  //             internalType: "uint256",
  //             name: "volume",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "RequestVolume",
  //         type: "event",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "string",
  //             name: "ticker",
  //             type: "string",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "amountToSell",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "sellStock",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "address",
  //             name: "to",
  //             type: "address",
  //           },
  //         ],
  //         name: "transferOwnership",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "withdraw",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "withdrawLink",
  //         outputs: [],
  //         stateMutability: "nonpayable",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "address",
  //             name: "",
  //             type: "address",
  //           },
  //           {
  //             internalType: "string",
  //             name: "",
  //             type: "string",
  //           },
  //         ],
  //         name: "balances",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "currentPrice",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "currentRequestId",
  //         outputs: [
  //           {
  //             internalType: "bytes32",
  //             name: "",
  //             type: "bytes32",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "uint256",
  //             name: "num1",
  //             type: "uint256",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "num2",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "divide",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256",
  //           },
  //         ],
  //         stateMutability: "pure",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "uint256",
  //             name: "num1",
  //             type: "uint256",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "num2",
  //             type: "uint256",
  //           },
  //         ],
  //         name: "multiply",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256",
  //           },
  //         ],
  //         stateMutability: "pure",
  //         type: "function",
  //       },
  //       {
  //         inputs: [
  //           {
  //             internalType: "bytes32",
  //             name: "",
  //             type: "bytes32",
  //           },
  //         ],
  //         name: "orders",
  //         outputs: [
  //           {
  //             internalType: "address",
  //             name: "investor",
  //             type: "address",
  //           },
  //           {
  //             internalType: "uint256",
  //             name: "investment",
  //             type: "uint256",
  //           },
  //           {
  //             internalType: "string",
  //             name: "ticker",
  //             type: "string",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "owner",
  //         outputs: [
  //           {
  //             internalType: "address",
  //             name: "",
  //             type: "address",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //       {
  //         inputs: [],
  //         name: "volume",
  //         outputs: [
  //           {
  //             internalType: "uint256",
  //             name: "",
  //             type: "uint256",
  //           },
  //         ],
  //         stateMutability: "view",
  //         type: "function",
  //       },
  //     ],
  //     "0x05E91A2Da133988deBC55c5429aeB6E6b9e30d9d"
  //   );

  //   let accounts = await web3.eth.getAccounts();
  //   let balance = await web3.eth.getBalance(accounts[0]);
  //   console.log("before ", balance);

  //   await contract.methods
  //     .buyStock("AAPL")
  //     .send({ from: accounts[0], value: "10000000000000000" })
  //     .then((response) => console.log(response));

  //   let balance1 = await web3.eth.getBalance(accounts[0]);
  //   console.log("after ", balance1);
  // }

  return (
    <div className="App">
      <Web3AuthContext.Provider value={web3AuthProviderValue}>
        <Web3Context.Provider value={web3ProviderValue}>
          <div>
            <Navbar />
          </div>
          <div style={{ display: "flex" }}>
            <Sidebar />
            <div
              style={{  marginLeft: "250px", width: "100%", marginTop: "47px", backgroundColor: "#f7f7f7", height: "100%" }}
            >
              <Routes>
                <Route path="portfolio" element={<Portfolio />}></Route>
                <Route path="stocks/:ticker" element={<Stock />}></Route>
                <Route path="snowpool" element={<SnowPool />}></Route>
                <Route path="snowmen" element={<SnowMen />}></Route>
                <Route path="deposit/:type" element={<DepositHandler />}></Route>
                <Route path="/" exact element={<Home />}></Route>


              </Routes>
            </div>
          </div>

          {/* <button onClick={() => handleLogin()}>Login</button>
      <button onClick={() => handleLogout()}>Logout</button>
      <button onClick={() => handleDeposit()}>Deposit 100</button>
      <button onClick={() => buyStonk("AAPL")}>Buy Apple</button> */}
        </Web3Context.Provider>
      </Web3AuthContext.Provider>
    </div>
  );
}

export default App;
