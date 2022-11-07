import React from 'react'
import HomeVideo from "./Home.mp4"

function Home() {
  return (
    <div>
        <video style={{width: "100%", height: "100vh"}} autoPlay muted loop>
            <source src={HomeVideo} type="video/mp4"></source>
        </video>
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