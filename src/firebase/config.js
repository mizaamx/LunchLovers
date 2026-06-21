import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Configuración de Firebase para 'Lunch Lovers GDL'
const firebaseConfig = {
  apiKey: "AIzaSyCpBECZ6XxKl5diOzMLKL2Vk5coBBdKFbI",
  authDomain: "lunchloversgdl.com",
  projectId: "lunchloversgdl-72e51",
  storageBucket: "lunchloversgdl-72e51.firebasestorage.app",
  messagingSenderId: "338072316149",
  appId: "1:338072316149:web:3a9c2f056dbbc548457dbc",
  measurementId: "G-VL8D1GMC93"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, db, auth, storage, analytics };
