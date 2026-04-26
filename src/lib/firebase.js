import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCEmsA8IMFXCxJlMobeK4AGxDatqsuRDgo",
  authDomain: "my-web-d29b8.firebaseapp.com",
  projectId: "my-web-d29b8",
  storageBucket: "my-web-d29b8.firebasestorage.app",
  messagingSenderId: "766977358332",
  appId: "1:766977358332:web:b04be1ca1bcbb6afad5a79",
  measurementId: "G-D3F22SMGRQ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider, analytics };
