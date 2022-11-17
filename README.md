
# Snow Finance

A decentralized stock trading platform.


## About

The Gamestop and Robinhood incident showed financial investors that they **don't have full control** on their financial assets. Middlemen could **change the rules** as they wish. We could not use our funds deposited to the platform to buy whatever we want. Selling assets was also temporarily disabled on many other platforms. 

This is a problem that could be solved by Decentralized Finance (deFi). Snow Finance is a stock trading platform **executing solely through smart contracts**. This makes it the first stock trading platform you could **100% trust**. Buying and selling stocks is automatically handled, with **no middle man**, **no conflicts of interest**, **no changed rules**

The buy function could always be called, as well as all other functions. 

All data regarding commissions and your trade history is always publically visible.

Snow Finance also demonstrates other aspects of deFi through its **Snow Vault** and **Snowmen NFTs**
## Features

- **Contracts For Difference** on the Polygon Blockchain
- All trades are executed through **smart contracts**
- Users have **full control** over assets in the Snow Finance Ecosystem
- **100% Uptime**
- Stock trading platform with **zero rules changed**
- **Transparent** fees and orders
- Limited supply Snowmen NFTs provide **commission free trading**
- **Circular Liquidity flow** through SNOW Coin, Snow Vault and the Stock Trading Platform

## Stock Trading Platform Mechanics

The stock trading platform is based on the contracts for difference (CFD) model. The trader places an order at a given price, and when closing the trade, the price difference is settled. 
If the trade is profitable for the trader, funds are sent to his wallet. 

If the trade is not profitable, funds are sent to the Snow Vault.

```bash
transferValue = priceDifference * amountOfShares
```

The trader also pays a 0.25% commission on closing a trade, which is transferred to the Snow Vault.

Snow Finance utilises ChainLink's 'Connect To Any API' to get stock price data onto the blockchain.

## Snow Vault and SNOW Coin

The Snow Vault is a way for users to provide liquidity to the stock trading platform.

A user can deposit MATIC to the Snow Vault and receive SNOW Coins in return.

Each Snow Coin represents a share of the funds in the Snow Vault.

SNOW Coins, ERC20 tokens,  will be minted to his account. The percentage difference his MATIC deposit makes to the snow Vault will allow him to mint the same percentage amount of the Snow Coin Supply.
Depositting 50% of the funds in the vault will result in 50% of Snow Coin's supply to be minted to your account.

Calling the 'WithdrawAndBurn(amount)' function in the smart contract will result in burning 'amount' Snow Coins and withdraws 
```bash
(amount / total Snow Coin supply) * Funds In Contract
```
**In Summary**:

- burning x% of the Snow Coin supply allows you to withdraw x% of the funds in the contract.

- depositing y% of the funds in the liquidity pool allows you to mint y% of SNOW Coin's supply to your account

**User's incentive to provide liquidity**

All commissions from the trading platform are transferred to the Snow Vault.
Snow Finance's trading platform works based on the Contracts For Difference (CFD) concept.

When a trader is profitable, funds are transferred from the Snow Vault to the trader's account.

When a trader is not profitable, funds are transferred from the trader to the Snow Vault.

Statistics say that 70 - 80% of traders make losing trades. This results in a surplus of funds placed into the Snow Vault, allowing the liquidity providers to withdraw more funds than depositted.

Users' commissions and Snowmen NFTs royalties are also added to the vault.

## Snowmen NFTs

Snow Finance also demonstrates a way to use NFTs in financial products.

**Snowmen NFT holders do not pay commission on the stock trading platform**. This concept could be used by new financial products to integrate premium features in an efficient (and fun) way.

With a **limited supply** of Snowmen NFTs (Currently at 100 Snowmen on the Mumbai Testnet), these would be highly valuable assets for high frequency traders and traders trading large amounts of money.

Snowmen NFTs are transferrable and its holder has full control over it. He may hold it to enjoy commission free trading, sell it to high frequency trader or gift it to a friend.

Snowmen NFTs royalties from OpenSea also are transferred into the Snow Vault, furtherly adding liquidity to the platform.

## Tech Stack

- Moralis
- Moralis Web3 UI kit
- Polygon (Mumbai Testnet)
- ChainLink
- Google Firebase
- Google Cloud Storage
- Google Cloud Functions
- React
- Node.js
- Solidity
## Demo

Visit https://fundamentals-8cb60.web.app/ for a live demo of Snow Finance


1. Login with your preffered method

2. Adding Funds to your account


a. visit https://fundamentals-8cb60.web.app/portfolio

b. Click Deposit

c. Select how much you'd like to deposit

d. Enter the following credit card details:

**Credit card number**: 4242 4242 4242 4242

**CVC**: 999

**Expiry Date**: 12/27

This is a test credit card.

3. Enter other details as you wish, for example:

**email** - julian.theuma@gmail.com 

**address line 1** - 99, Igloo 99

**address line 2** - Wall Street

**city** - snow city

**postal code** - SNO999


6. Login to your account again and funds should be added to your account

7. Type in a stock you would like to order and click the search icon.

8. Fill in the middle section form to place an order on the stock

9. Wait for the order to be processed.
Note: This might take a while, due to the Chainlink testnet oracle

## Use Of Moralis

- Moralis streams was used to keep track of all SNOW Coin transfers in the Snow Vault Page

  Utilising Moralis' Listen Blockchain by Moralis Streams firebase extension, any SNOW coin transfer is stored in the firestore database at path:   moralis/events/Snowcointransfers
  
  Front end side Code can be found in Snow-Finance/src/SnowPool
  
  The Moralis streams Stream Id is: e46ab0d9-45ca-4a3e-bfc3-61b1159a4315
  
- Moralis was used in cloud functions to get Snowmen NFT Metadata (Get NFTs by wallet) and getting price of Matic (Get Price)

```bash
GET 'https://deep-index.moralis.io/api/v2/erc20/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/price'
```

```bash
GET 'https://deep-index.moralis.io/api/v2/address/nft'
```

- Moralis Web3 UI Kit was used for multiple UI elements in the website.

## Use of Polygon

All smart contracts were deployed to the Polygon Mummbai network at the following addresses:

Snow Coin: 0xa03d8E21CAdf0babCEc4A188297a3236B252E079 
https://mumbai.polygonscan.com/address/0xa03d8E21CAdf0babCEc4A188297a3236B252E079

smart contract: https://mumbai.polygonscan.com/address/0xa03d8E21CAdf0babCEc4A188297a3236B252E079#code

Snowmen NFTs: 0xC1371A45C6c3fDA167ef1669dEafCAD5fdE1af0D
https://mumbai.polygonscan.com/address/0xC1371A45C6c3fDA167ef1669dEafCAD5fdE1af0D

smart contract: https://firebasestorage.googleapis.com/v0/b/fundamentals-8cb60.appspot.com/o/snowman.txt?alt=media

Snow Vault: 0x4aA45d3422E05E722B0cE16C671672e4ff8cC4Ec
https://mumbai.polygonscan.com/address/0x4aA45d3422E05E722B0cE16C671672e4ff8cC4Ec

smart contract: https://firebasestorage.googleapis.com/v0/b/fundamentals-8cb60.appspot.com/o/vault.txt?alt=media

Trading Platform: 0xAae4347E1F8FA452152DdA9f73063a490746c16E
https://mumbai.polygonscan.com/address/0xAae4347E1F8FA452152DdA9f73063a490746c16E

smart contract: https://firebasestorage.googleapis.com/v0/b/fundamentals-8cb60.appspot.com/o/stock.txt?alt=media

Polygon allows Snow Finance users to have negligible gas fees and fast transactions.

## Installation

**To run the website locally**:

1. Clone the repository

```bash
  git clone https://github.com/juliantheuma/Snow-Finance.git
```
2. Open the folder in Visual Studio Code
3. Create a new terminal
4. Install all required packages using
```bash
    npm install --force
```
5. Start the deployment server locally
```bash
    npm start
```

## Future development of Snow Finance
    
    1. Snow Finance plans to make use of Chainlink Automation to include Limit Orders, Take Profits and Stop Losses.
    
    2. Utilising Chainlink Automation will also allow Snow Finance to introduce leverage or margin into the trading platform.
    
    3. Deposit functionality will be expanded to deposit as much funds as he wants
    
    4. Deploy Snow Finance to the Polygon Mainnet

## Authors

- [@juliantheuma](https://www.github.com/juliantheuma) studying Computing and Business at University of Malta

Contacts:
- Twitter: https://twitter.com/JulianNfts
- LinkedIn: https://www.linkedin.com/in/julian-theuma-b065121b1/
- email: julian.theuma@gmail.com

