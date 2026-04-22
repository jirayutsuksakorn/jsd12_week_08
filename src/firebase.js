import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDTzfQxAzUDdRAfIWuzf7jVm6olIoVVt8Y",
    authDomain: "spacepokemongame.firebaseapp.com",
    projectId: "spacepokemongame",
    storageBucket: "spacepokemongame.firebasestorage.app",
    messagingSenderId: "949127045752",
    appId: "1:949127045752:web:04637d8b4b25fd4145038d",
    measurementId: "G-BCTN543ZRE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);