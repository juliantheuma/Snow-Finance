
# Snow Finance

A decentralized stock trading platform


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

7. Enter **TEST_A** in the search bar, and click the search icon

8. Place a **Long** order on TEST_A stocks for the dollar amount you would like.
Note: 1 TEST_A stock = $200

9. Wait for the order to be processed.
Note: This might take up to 5 minutes.

10. **Close** your trade
Note: on selling, TEST_A stock is equivalent to $400

11. You should receive **100%** profit on your order amount

12. There is a **0.25% commission** if you don't hold a Snowman NFT

13. Select the Snowmen Tab

14. Claim your free Snowman NFT

15. repeat steps 7 - 10

16. You Should receive exactly double the amount you invested in stock A, without commission being reduced.




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

**To deploy and test the smart contracts**:
1. Find the contracts in /contracts
2. Copy each contract into Remix
3. Compile the contracts using solidity 0.8.17
4. Deploy the contracts to the Mumbai network
5. Call the following functions: 
```bash
    setSnowmenAddress(address)
    setSnowPoolAddress(address)

     where address is the respective newly deployed contract's address
```
6. Call the following functions:
```bash
    setTradingPlatformAddress(address)
    setSnowCoinAddress(address)

    where address is the respective newly deployed contract's address
```
7. Deposit ChainLink tokens to the trading platform contract

    You can use the following faucets: 
    Mumbai Chainlink - 
    Mumbai Polygon - https://mumbaifaucet.com/
## Authors

- [@juliantheuma](https://www.github.com/juliantheuma) studying Computing and Business at University of Malta

