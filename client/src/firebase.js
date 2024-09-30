// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const testFirebaseConfig = {
  apiKey: "AIzaSyB__2yB4LzSSY9ZLJn379hAEfa2CLjZTXg",
  authDomain: "testsupersurvey.firebaseapp.com",
  projectId: "testsupersurvey",
  storageBucket: "testsupersurvey.appspot.com",
  messagingSenderId: "740469714815",
  appId: "1:740469714815:web:7d25504f471713d2fd344a",
  measurementId: "G-YWGV3NQF7M"
};

// TODO: Config for SuperSurvey app
// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "",
//   projectId: "",
//   storageBucket: "",
//   messagingSenderId: "",
//   appId: "",
//   measurementId: ""
// };

const app = initializeApp(testFirebaseConfig);
const db = getFirestore(app);

export { db };
