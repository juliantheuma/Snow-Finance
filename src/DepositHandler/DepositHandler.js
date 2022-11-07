import { Button } from '@web3uikit/core';
import React, { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import CancelAnimation from '../Animations/CancelAnimation';
import Success from '../Animations/Success';
import { getToken, tokenSignIn } from '../firebase';
import { Web3AuthContext, Web3Context } from '../Web3Context';

function DepositHandler() {
    const web3AuthContext = useContext(Web3AuthContext)
    const web3Context = useContext(Web3Context)

    let navigate = useNavigate();
    async function handleSignIn() {
        console.log("Signing In...");
        const provider = await web3AuthContext.web3Auth.connect();
        console.log(web3AuthContext.web3Auth);
        console.log(provider);
        let b = new Web3(web3AuthContext.web3Auth.provider);
        let accounts = await b.eth.getAccounts();
        web3Context.setWeb3(b);
    
        let myAddress = accounts[0];
        // let balance = await b.eth.getBalance(myAddress);
        // console.log(balance);
    
        let token = await getToken(myAddress);
        await tokenSignIn(token);

        navigate("/portfolio")
      }

    const { type } = useParams();
  return (
    <>
    <div style={{marginTop: "25vh"}}>{type === "cancel" ? <> <CancelAnimation /> <h4 style={{display: "flex", justifyContent: "center"}}>The deposit was cancelled. Please Sign In again.</h4> </>
    : <> <Success /> <h4 style={{display: "flex", justifyContent: "center"}}>Funds have been added to your account. Please Sign In again.</h4> </>}</div>
    <div style={{display: "flex", width: "100%", justifyContent: "center", marginTop: "0.5em"}}>
    <Button theme='primary' text='Sign In' onClick={() => handleSignIn()}/>
    </div>
    </>

  )
}

export default DepositHandler