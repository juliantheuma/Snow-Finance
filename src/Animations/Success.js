import React from 'react'
import successAnimation from "./successful.json"
import Lottie from 'react-lottie'

function Success() {

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: successAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

  return (
    <>
    <Lottie options={defaultOptions} height={120} width={200}/>
    </>
  )
}

export default Success