import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  QuerySnapshot,
} from "firebase/firestore";

import {
  createCheckoutSession,
  getProducts,
  getStripePayments,
} from "@stripe/firestore-stripe-payments";

let firebaseApp = initializeApp({
  apiKey: "AIzaSyCyeH0yNDHJB0DgK8Jc6Vn639aJprHMyFs",
  authDomain: "fundamentals-8cb60.firebaseapp.com",
  projectId: "fundamentals-8cb60",
  storageBucket: "fundamentals-8cb60.appspot.com",
  messagingSenderId: "92773496342",
  appId: "1:92773496342:web:b96389276ee84f91126737",
});

let auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export async function getToken(wallet) {
  let token = null;

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch(
    `https://us-central1-fundamentals-8cb60.cloudfunctions.net/issueToken?walletAddress=${wallet}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      let a = JSON.parse(result);
      token = a._token;
    })
    .catch((error) => console.log("error", error));

  console.log(token);
  return token;
}

export async function getMaticPrice() {
  let maticPrice = null;

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch(
    "https://us-central1-fundamentals-8cb60.cloudfunctions.net/getMaticPrice",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      let a = JSON.parse(result);
      maticPrice = a.usdPrice;
      console.log(result);
    })
    .catch((error) => console.log("error", error));
  return maticPrice;
}

export async function tokenSignIn(token) {
  let u = await signInWithCustomToken(auth, token);
  console.log(u);
}

export async function deposit(amount) {
  console.log("depositing...");
  console.log(amount);
  let price;

  if (amount === 30) {
    price = "price_1Lz49IGC9MhpkKozWrkRia2P";
  } else if (amount === 50) {
    price = "price_1Lz2V1GC9MhpkKozrDR8UPnJ";
  } else if (amount === 100) {
    price = "price_1Lz2VdGC9MhpkKozqO96JJcs";
  }

  const payments = await getStripePayments(firebaseApp, {
    productsCollection: "products",
    customersCollection: "customers",
  });

  const session = await createCheckoutSession(payments, {
    mode: "payment",
    price: price,
    success_url: "https://fundamentals-8cb60.web.app/deposit/success",
    cancel_url: "https://fundamentals-8cb60.web.app/deposit/cancel",
  });

  console.log(session);

  window.location.assign(session.url);
}

export async function subscribeToSnowCoinTransfers() {
  const q = query(collection(db, "moralis/events/Snowcoin"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tempTxs = [];
    querySnapshot.forEach((doc) => {
      tempTxs.push(doc.data());
    });
    return tempTxs;
  });
}

export async function getSnowmenNfts(wallet) {
  let snowmen = null;

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch(
    `https://us-central1-fundamentals-8cb60.cloudfunctions.net/getSnowmenNfts?wallet=${wallet}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      snowmen = JSON.parse(result);
    })
    .catch((error) => console.log("error", error));

  return snowmen;
}
