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

async function main() {
  console.log("Obteniendo platillos de la BD...");
  try {
    const querySnapshot = await getDocs(collection(db, "Dishes"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name.includes("Thai") || data.name.includes("Adobada") || data.name.includes("Calabacitas") || data.name.includes("Espinaca")) {
        console.log(`- ${data.name}: ${data.imageUrl}`);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

main();
