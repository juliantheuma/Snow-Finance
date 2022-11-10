import { Button } from "@web3uikit/core";
import React, { useState } from "react";
import ReactDom from "react-dom";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#FFF",
  padding: "50px",
  zIndex: 100000001,
  borderRadius: "30px",
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  zIndex: 100000000,
};

function Modal({ isOpen, onClose, children, type, amount, unit, onConfirm }) {
  const [confirm, setConfirm] = useState(false);

  function toggleConfirm() {
    setConfirm(!confirm);
  }

  function cancel() {
    onClose();
    toggleConfirm();
  }

  if (!isOpen) return null;

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} />
      <div style={MODAL_STYLES}>
        {!confirm && (
          <>
            <div>{children}</div>
            {/* <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1em",
              }}
            >
              <Button text="Confirm" theme="primary" onClick={toggleConfirm} />
              <Button text="Cancel" onClick={onClose} theme="secondary" />
            </div> */}
          </>
        )}
        {confirm && (
          <>
            {/* <h4>
              Are You Sure You Want To {type} {unit === "USD" ? "$" : ""}
              {amount} {unit === "MATIC" ? "MATIC" : ""}?
            </h4>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "0.5em",
              }}
            >
              <Button
                text="Confirm"
                theme="primary"
                onClick={() => {
                  onConfirm();
                  toggleConfirm();
                }}
              ></Button>
              <Button text="Cancel" theme="secondary" onClick={cancel} />
            </div> */}
          </>
        )}
      </div>
    </>,
    document.getElementById("portal")
  );
}

export default Modal;
