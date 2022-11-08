import { Button } from '@web3uikit/core'
import React, { useContext } from 'react'
import HomeVideo from "./Home.mp4"
import { Web3AuthContext, Web3Context } from '../Web3Context'

function Home() {
  const web3AuthContext = useContext(Web3AuthContext)
  const web3Context = useContext(Web3Context)
  return (
    <div>
        <video style={{width: "100%", height: "100vh"}} autoPlay muted loop>
            <source src={HomeVideo} type="video/mp4"></source>
        </video>
        <Button onClick={() => {console.log(web3AuthContext); console.log(web3Context)}} />
        <h4><b>The Rules Are Immutable</b></h4>
        <h5>Snow Finance is a Stock Trading platform powered by the blockchain</h5>
        <h5>Smart contracts automatically execute your trades, with no humans involved in the process. No one can cancel your order, or not let you buy or sell a stock.</h5>
        <h4><b>100% Uptime</b></h4>
        <h5>Snow Finance is accessible 24/7. </h5>
        <h4><b>Accessible Globally</b></h4>
        <h4><b>Snow Coin</b></h4>
        <h4><b>Snowmen</b></h4>
    </div>
  )
}

export default Home