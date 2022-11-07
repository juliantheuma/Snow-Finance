import React from 'react'
import Lottie from 'react-lottie'
import snowBoard from "./snowboard.json"

function SnowBoard() {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: snowBoard,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

  return (
    <>
    <Lottie options={defaultOptions} height={250} width={250}/>
    </>
  )
}

export default SnowBoard