import React from 'react'
import Lottie from 'react-lottie'
import loadingAnimation from "./loading.json"

function LoadingAnimation() {

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingAnimation,
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

export default LoadingAnimation