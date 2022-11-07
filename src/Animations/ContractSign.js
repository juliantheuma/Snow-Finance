import React from 'react'
import Lottie from 'react-lottie'
import contractSignAnimation from "./contract-sign.json"

function ContractSign() {

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: contractSignAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

  return (
    <>
    <Lottie options={defaultOptions} height={500} width={500}/>
    </>
  )
}

export default ContractSign