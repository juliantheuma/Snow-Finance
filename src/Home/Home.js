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
    </div>
  )
}

export default Home