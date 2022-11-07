import React from 'react'
import Lottie from 'react-lottie'
import bankTransfer from "./bank-transfer.json"

function BankTransfer() {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: bankTransfer,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

  return (
    <>
    <Lottie options={defaultOptions} height={120} width={120}/>
    </>
  )
}

export default BankTransfer