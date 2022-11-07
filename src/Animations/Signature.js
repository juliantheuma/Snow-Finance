import React from 'react'
import signature from "./signature.json"
import Lottie from 'react-lottie'

function Signature() {

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: signature,
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

export default Signature