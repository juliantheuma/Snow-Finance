import React from 'react'
import vaultAnimation from "./vault.json"
import Lottie from 'react-lottie'

function VaultAnimation() {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: vaultAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

  return (
    <>
    <Lottie options={defaultOptions} height={200} width={200}/>
    </>
  )
}

export default VaultAnimation