import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, query, where } from "firebase/firestore";

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

const weekId = "2026-07-27";

const newDishes = [
  {
    key: "tinga_pollo",
    name: "Tinga de pollo",
    category: "platillo",
    description: "Jugosa pechuga de pollo deshebrada cocinada a fuego lento en una sabrosa salsa de jitomate, cebolla fileteada y chile chipotle ligero.",
    macros: { calories: 330, protein: 32, fat: 10, carbs: 14 },
    imageUrl: "/dishes/tinga_pollo.png"
  },
  {
    key: "pollo_florentina_garbanzos",
    name: "Pollo a la florentina y garbanzos",
    category: "platillo",
    description: "Trozos de pechuga de pollo y garbanzos tiernos bañados en una suave salsa de espinacas y finas hierbas con un toque cremoso.",
    macros: { calories: 370, protein: 34, fat: 11, carbs: 28 },
    imageUrl: "/dishes/pollo_florentina_garbanzos.png"
  },
  {
    key: "sandwich_aguacate_huevo",
    name: "SÁNDWICH DE AGUACATE CON HUEVO",
    category: "snack",
    description: "Pan de grano entero tostado relleno de cremoso aguacate fresco mash, huevo cocido en rebanadas y una pizca de pimienta negra.",
    macros: { calories: 270, protein: 12, fat: 14, carbs: 22 },
    imageUrl: "/dishes/sandwich_aguacate_huevo.png"
  },
  {
    key: "pasta_carne_mexicana",
    name: "Pasta con carne molida a la mexicana con verduras y elote",
    category: "platillo",
    description: "Pasta corta al dente combinada con magra carne molida guisada a la mexicana con jitomate, cebolla, calabacitas y granos de elote tierno.",
    macros: { calories: 410, protein: 26, fat: 12, carbs: 48 },
    imageUrl: "/dishes/pasta_carne_mexicana.png"
  },
  {
    key: "pasta_calabaza_berenjena",
    name: "(VEG) Pasta con calabaza y berenjena",
    category: "platillo",
    description: "Platillo vegetariano de pasta integral salteada con cubos de calabacín tierno, berenjena horneada, aceite de oliva virgen y albahaca fresca.",
    macros: { calories: 310, protein: 10, fat: 9, carbs: 46 },
    imageUrl: "/dishes/pasta_calabaza_berenjena.png"
  },
  {
    key: "calabazas_rellenas_carne",
    name: "CALABAZAS RELLENAS DE CARNE",
    category: "platillo",
    description: "Calabacitas italianas horneadas rellenas de sazonada carne molida magra y vegetales, gratinadas con una capa ligera de queso panela.",
    macros: { calories: 320, protein: 27, fat: 13, carbs: 15 },
    imageUrl: "/dishes/calabazas_rellenas_carne.png"
  },
  {
    key: "palomitas_cacahuetes",
    name: "Palomitas con cacahuetes",
    category: "snack",
    description: "Snack crujiente y saludable de palomitas de maíz horneadas al aire combinadas con cacahuate natural tostado y sal de mar.",
    macros: { calories: 190, protein: 6, fat: 10, carbs: 20 },
    imageUrl: "/dishes/palomitas_cacahuetes.png"
  }
];

const run = async () => {
  try {
    console.log("1. Creating new dishes in Firestore...");
    const createdIds = {};
    for (const dish of newDishes) {
      const { key, ...dishData } = dish;
      const docRef = await addDoc(collection(db, 'Dishes'), dishData);
      createdIds[key] = docRef.id;
      console.log(`Created dish "${dish.name}" with ID: ${docRef.id}`);
    }

    console.log("\n2. Building weekly menu structure for week 2026-07-27...");
    const weeklyMenuByDay = {
      lunes: [
        "i3WxFWCIVsSGd2qFrf3m",       // Tortilla Española
        "IsdHNDEmIK85IMS6zpGT",       // Sándwich de huevo con cebollín (Sándwich de Huevo)
        createdIds.tinga_pollo,       // Tinga de pollo (NUEVO)
        "dnWjQWzusIDY6V220eaY",       // Cerdo con elote
        "p2RLsDGyEI1mjyHjW4YS"        // Pescado con paprika
      ],
      martes: [
        "xowJ3AgtYljvxlnhxS8e",       // Huevo en tostada integral
        "FoC1zcHBniDhzwgnSltH",       // Pure dulce de camote
        createdIds.pollo_florentina_garbanzos, // Pollo a la florentina y garbanzos (NUEVO)
        "mWGXYArohuY7T4qqNehj",       // Milanesa de cerdo con ensalada y Arroz
        "Vl0sIONZ3EbZk9mxqvD6"        // Pescado al limón con verduras
      ],
      miercoles: [
        "WfZmZXSkvY9DEfytNhKl",       // Hotcake de avena y fruta
        createdIds.sandwich_aguacate_huevo, // SÁNDWICH DE AGUACATE CON HUEVO (NUEVO)
        createdIds.pasta_carne_mexicana,   // Pasta con carne molida a la mexicana con verduras y elote (NUEVO)
        "uFhvV1BiGajnaaAvveAg",       // Fajitas de cerdo con salteado de pimientos
        createdIds.pasta_calabaza_berenjena // (VEG) Pasta con calabaza y berenjena (NUEVO)
      ],
      jueves: [
        "5jyhJ4fJLGWI2HXLVuKP",       // Yogurt con granola
        "L6nlZRMR6m9P7H3zTlJg",       // (VEG) Papa con huevo
        "rxbxMAGruPDjyJR7yvDZ",       // Rajas poblanas con pollo
        createdIds.calabazas_rellenas_carne, // CALABAZAS RELLENAS DE CARNE (NUEVO)
        "LNHq57kR6EVxm9r22hmq"        // Pescado sellado
      ],
      viernes: [
        createdIds.palomitas_cacahuetes, // Palomitas con cacahuetes (NUEVO)
        "M3MUOZhSMLVIXqdEPQx4",       // Enjambre de chocolate
        "194MYiWN90jHzc2t7JWs",       // Pasta alfredo
        "YYk4RtVvyzbE7XNgOa5S",       // Carne de puerco con calabacitas
        "kbj0qzRlaLMfdXcVy7Da"        // Pescado con puré de coliflor
      ]
    };

    console.log("Weekly menu dish IDs by day:");
    console.log(JSON.stringify(weeklyMenuByDay, null, 2));

    console.log("\n3. Deactivating previous active weekly menus...");
    const activeQuery = query(collection(db, 'WeeklyMenus'), where('isActive', '==', true));
    const activeSnap = await getDocs(activeQuery);
    for (const menuDoc of activeSnap.docs) {
      if (menuDoc.id !== weekId) {
        await setDoc(doc(db, 'WeeklyMenus', menuDoc.id), { isActive: false }, { merge: true });
        console.log(`Deactivated menu: ${menuDoc.id}`);
      }
    }

    console.log(`\n4. Saving and activating weekly menu "${weekId}"...`);
    await setDoc(doc(db, 'WeeklyMenus', weekId), {
      availableDishes: weeklyMenuByDay,
      isActive: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`\n✅ Menú de la semana ${weekId} actualizado y activado exitosamente en Firestore!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error actualizando el menú semanal:", err);
    process.exit(1);
  }
};

run();
