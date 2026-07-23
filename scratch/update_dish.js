import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpBECZ6XxKl5diOzMLKL2Vk5coBBdKFbI",
  authDomain: "lunchloversgdl.com",
  projectId: "lunchloversgdl-72e51",
  storageBucket: "lunchloversgdl-72e51.firebasestorage.app",
  messagingSenderId: "338072316149",
  appId: "1:338072316149:web:3a9c2f056dbbc548457dbc",
  measurementId: "G-VL8D1GMC93"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const updateDish = async () => {
  try {
    const dishRef = doc(db, 'Dishes', '4vq5jeBhd3MYHOo1BxuA');
    await updateDoc(dishRef, {
      name: "Sope de Nopal",
      description: "Delicioso sope tradicional elaborado con una base de masa de maíz tierno, frijoles refritos ligeros y nopales picados con queso fresco rallado.",
      imageUrl: "/dishes/sope_nopal.png",
      macros: {
        calories: 180,
        protein: 6,
        fat: 5,
        carbs: 28
      }
    });
    console.log("Successfully updated dish to Sope de Nopal.");
  } catch (error) {
    console.error("Error updating dish:", error);
  }
};

updateDish();
