import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

const getDishes = async () => {
  try {
    const dishesSnap = await getDocs(collection(db, 'Dishes'));
    const list = dishesSnap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      category: doc.data().category,
      imageUrl: doc.data().imageUrl
    }));
    console.log(JSON.stringify(list, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

getDishes();
