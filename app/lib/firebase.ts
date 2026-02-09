import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCb2qWVBuvSi18KBhEdIPfXfFoox0iQfrI",
    authDomain: "tribe-fam-ai.firebaseapp.com",
    projectId: "tribe-fam-ai",
    storageBucket: "tribe-fam-ai.firebasestorage.app",
    messagingSenderId: "402276620224",
    appId: "1:402276620224:web:9507d59ab928069c9e1a25"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
