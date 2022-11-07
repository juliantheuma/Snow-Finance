import React from 'react'
import Lottie from 'react-lottie'
import cancelAnimation from "./cancel.json"

function CancelAnimation() {

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: cancelAnimation,
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

export default CancelAnimation