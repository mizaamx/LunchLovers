import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

const getMenus = async () => {
  try {
    const menusSnap = await getDocs(collection(db, 'WeeklyMenus'));
    const list = menusSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("WEEKLY MENUS COUNT:", list.length);
    console.log("MENUS:", JSON.stringify(list, null, 2));
  } catch (error) {
    console.error("Error fetching menus:", error);
  }
};

getMenus();
