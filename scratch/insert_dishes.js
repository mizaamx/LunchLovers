import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const newDishes = [
  {
    name: "Esquites",
    description: "Tierno elote desgranado cocido al vapor, servido con un toque de mayonesa ligera, queso cotija espolvoreado y chile en polvo al gusto.",
    category: "snack",
    imageUrl: "/dishes/esquites.png",
    macros: { calories: 160, protein: 5, fat: 6, carbs: 24 }
  },
  {
    name: "Tortilla Española",
    description: "Clásica tortilla española de patatas elaborada con huevo y cebolla picada, cocinada al horno para una versión más ligera y saludable.",
    category: "platillo",
    imageUrl: "/dishes/tortilla_espanola.png",
    macros: { calories: 240, protein: 10, fat: 11, carbs: 25 }
  },
  {
    name: "Pechuga de Pollo con Ensalada y Arroz",
    description: "Jugosa pechuga de pollo a la plancha acompañada de arroz blanco al vapor y una fresca ensalada mixta de lechuga, jitomate y pepino.",
    category: "platillo",
    imageUrl: "/dishes/pechuga_pollo_arroz.png",
    macros: { calories: 380, protein: 32, fat: 8, carbs: 42 }
  },
  {
    name: "Fruta con Miel y Jengibre",
    description: "Una refrescante taza de frutas picadas de temporada (melón, piña, papaya y manzana) aderezadas con un toque de miel pura de abeja y jengibre fresco rallado.",
    category: "snack",
    imageUrl: "/dishes/fruta_miel_jengibre.png",
    macros: { calories: 130, protein: 1, fat: 0, carbs: 32 }
  },
  {
    name: "Sopa de Nopal",
    description: "Caldo casero y reconfortante a base de jitomate con tiras tiernas de nopal cocidas, cilantro fresco, cebolla y un ligero toque de chile.",
    category: "platillo",
    imageUrl: "/dishes/sopa_nopal.png",
    macros: { calories: 90, protein: 3, fat: 2, carbs: 15 }
  },
  {
    name: "Crepa de Avena",
    description: "Esbeltas y deliciosas crepas preparadas a base de harina de avena de grano entero, ideales para disfrutar con frutas o un hilo de miel.",
    category: "snack",
    imageUrl: "/dishes/crepa_avena.png",
    macros: { calories: 180, protein: 6, fat: 4, carbs: 30 }
  },
  {
    name: "Pescado al Horno y Verduras",
    description: "Filete de pescado blanco fresco horneado a las finas hierbas, servido con una colorida guarnición de verduras al vapor (brócoli, zanahoria y calabacita).",
    category: "platillo",
    imageUrl: "/dishes/pescado_horno_verduras.png",
    macros: { calories: 240, protein: 28, fat: 6, carbs: 12 }
  },
  {
    name: "Pollo a la BBQ",
    description: "Tierna pechuga de pollo deshebrada o en cubos, salteada y bañada en nuestra salsa BBQ casera ligera, baja en azúcares y grasas.",
    category: "platillo",
    imageUrl: "/dishes/pollo_bbq.png",
    macros: { calories: 310, protein: 30, fat: 7, carbs: 25 }
  },
  {
    name: "Yogur con Frutos Rojos",
    description: "Yogur griego cremoso natural sin azúcar refinada, acompañado de una deliciosa selección de frutos rojos frescos (fresas, frambuesas y arándanos).",
    category: "snack",
    imageUrl: "/dishes/yogur_frutos_rojos.png",
    macros: { calories: 160, protein: 12, fat: 3, carbs: 20 }
  },
  {
    name: "Sándwich de Huevo",
    description: "Sándwich preparado en pan integral tostado, relleno de un omelette de huevo entero cocinado ligeramente, con espinacas frescas y rodajas de jitomate.",
    category: "platillo",
    imageUrl: "/dishes/sandwich_huevo.png",
    macros: { calories: 270, protein: 15, fat: 10, carbs: 30 }
  }
];

const insertDishes = async () => {
  const mapping = {};
  for (const dish of newDishes) {
    try {
      const docRef = await addDoc(collection(db, 'Dishes'), dish);
      console.log(`Registered dish: "${dish.name}" with ID: ${docRef.id}`);
      mapping[dish.name] = docRef.id;
    } catch (e) {
      console.error(`Error registering "${dish.name}":`, e);
    }
  }
  console.log("MAPPING_START");
  console.log(JSON.stringify(mapping, null, 2));
  console.log("MAPPING_END");
};

insertDishes();
