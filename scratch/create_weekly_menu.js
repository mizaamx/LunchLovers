import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";

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

const selectedWeekId = "2026-07-20";

const weeklyMenuByDay = {
  lunes: [
    "8zCXc04mKmBLRicGrNDT", // Chilaquiles Verdes con Pollo
    "Ox06ZFDG129bBtaw9REr", // Cochinita Pibil
    "Vj6SlljzwZvCTcebPC9a", // Soya con Nopal y Salsa Verde
    "9MxM72j04cIcvHK5CI9i", // Esquites (Nuevo)
    "i3WxFWCIVsSGd2qFrf3m"  // Tortilla Española (Nuevo)
  ],
  martes: [
    "XIsktTR4SecmKzepibwe", // Pechuga de Pollo con Ensalada y Arroz (Nuevo)
    "p2RLsDGyEI1mjyHjW4YS", // Pescado a la Paprika
    "tLw02qo8GmYHtlqybE1W", // Pollo con Mole
    "phom0mDMnsh28JfZQuTt", // Fruta con Miel y Jengibre (Nuevo)
    "uOTBQEeBoU8dfljrXDTh"  // Dulce de Zanahoria
  ],
  miercoles: [
    "5nH5DbDbmPxCNyzGM1fN", // Pollo con Crema de Champiñones
    "4vq5jeBhd3MYHOo1BxuA", // Sopa de Nopal (Nuevo)
    "L9qJfZ6SeieBDAgn6r13", // Bistec a la Mexicana
    "fkWQYxEc2iN4eMSurpq3", // Crepa de Avena (Nuevo)
    "L2APREmoOWjSiDQE4i8h"  // Zanahoria, Pepino, Chile y Limón
  ],
  jueves: [
    "WrdvjsKvvPtJNgU8pXsL", // Pescado al Horno y Verduras (Nuevo)
    "TvZkjrsV3yuukgiUfWGD", // Entomatado de Cerdo
    "gSivQPK8iOpJosLX5ImE", // Pasta Fusil con Champiñones Huevo y Queso
    "ZJCHAIAhLIJGm04KQrD2", // Manzana con Crema de Maní
    "Fz1Xd2fazmHoOs8TusBC"  // Elote con Queso
  ],
  viernes: [
    "KHrFuk1teVGB41VcOTPQ", // Carne Asada
    "mWGXYArohuY7T4qqNehj", // Milanesa de Cerdo con Ensalada y Arroz
    "6IsqqPBIGjCXe7AGAvm5", // Pollo a la BBQ (Nuevo)
    "6o8PEY42FrObW42MqPS9", // Yogur con Frutos Rojos (Nuevo)
    "IsdHNDEmIK85IMS6zpGT"  // Sándwich de Huevo (Nuevo)
  ]
};

const createWeeklyMenu = async () => {
  try {
    // 1. Query all active weekly menus and set them to inactive
    const activeQuery = query(collection(db, 'WeeklyMenus'), where('isActive', '==', true));
    const activeSnap = await getDocs(activeQuery);
    
    for (const menuDoc of activeSnap.docs) {
      if (menuDoc.id !== selectedWeekId) {
        await setDoc(doc(db, 'WeeklyMenus', menuDoc.id), { isActive: false }, { merge: true });
        console.log(`Deactivated weekly menu: ${menuDoc.id}`);
      }
    }

    // 2. Set the selected menu as active
    await setDoc(doc(db, 'WeeklyMenus', selectedWeekId), {
      availableDishes: weeklyMenuByDay,
      isActive: true
    }, { merge: true });
    
    console.log(`Created and activated weekly menu: ${selectedWeekId}`);
  } catch (err) {
    console.error('Error creating weekly menu:', err);
  }
};

createWeeklyMenu();
