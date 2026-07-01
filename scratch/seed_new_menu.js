import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";

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

// Reused dish IDs
const REUSED_IDS = {
  platano_asado: "RIG3RvkQ6l2DKJron9QY",       // Plátano Asado con Crema Dulce
  tinga_zanahoria: "vVrA41bCl1IJbPoJ0noC",     // Tinga de zanahoria con arroz y huevo
  pasta_poblana: "fBAsz6GFhPHNeusGqFl7",       // Pasta poblana con pollo
  huevo_tostada: "xowJ3AgtYljvxlnhxS8e"        // Huevo en Tostada
};

const NEW_DISHES_DATA = [
  // Lunes
  {
    day: 'lunes',
    name: "Carne de Puerco con Calabacitas",
    category: "platillo",
    description: "Tierno lomo de cerdo picado y guisado con calabacitas tiernas picadas, elote, jitomate y un toque sutil de cebolla.",
    macros: { calories: 380, protein: 28, fat: 14, carbs: 18 },
    imageUrl: "/dishes/puerco_calabacitas.png"
  },
  {
    day: 'lunes',
    name: "Chop Suey de Pollo",
    category: "platillo",
    description: "Tiras de pechuga de pollo salteadas al wok con una mezcla de germinado de soya, zanahoria, calabaza y apio con soya ligera.",
    macros: { calories: 320, protein: 30, fat: 8, carbs: 22 },
    imageUrl: "/dishes/chop_suey_pollo.png"
  },
  {
    day: 'lunes',
    name: "Coliflor Salteada",
    category: "platillo",
    description: "Floretes de coliflor salteados con ajo, aceite de oliva virgen, perejil fresco y almendras fileteadas tostadas.",
    macros: { calories: 240, protein: 6, fat: 12, carbs: 15 },
    imageUrl: "/dishes/coliflor_salteada.png"
  },
  {
    day: 'lunes',
    name: "Uvas con Yogurt",
    category: "snack",
    description: "Una refrescante mezcla de uvas frescas de temporada (verdes y rojas) acompañadas de yogurt griego natural sin azúcar.",
    macros: { calories: 160, protein: 9, fat: 3, carbs: 25 },
    imageUrl: "/dishes/uvas_yogurt.png"
  },
  {
    day: 'lunes',
    name: "Puré de Camote",
    category: "snack",
    description: "Cremoso puré de camote amarillo horneado, endulzado de forma natural con un toque de canela y leche de almendras.",
    macros: { calories: 180, protein: 3, fat: 2, carbs: 38 },
    imageUrl: "/dishes/pure_camote.png"
  },

  // Martes
  {
    day: 'martes',
    name: "Milanesa de Cerdo con Ensalada y Arroz",
    category: "platillo",
    description: "Fina milanesa de lomo de cerdo horneada con empanizado ligero de avena, acompañada de arroz integral al vapor y ensalada fresca.",
    macros: { calories: 450, protein: 32, fat: 12, carbs: 45 },
    imageUrl: "/dishes/milanesa_cerdo_arroz.png"
  },
  {
    day: 'martes',
    name: "Pescado Sellado",
    category: "platillo",
    description: "Filete de pescado blanco sellado a la plancha con sal de mar, pimienta y ajo, sobre una base de ejotes salteados.",
    macros: { calories: 290, protein: 35, fat: 6, carbs: 12 },
    imageUrl: "/dishes/pescado_sellado.png"
  },
  {
    day: 'martes',
    name: "Albóndigas con Salsa Morita",
    category: "platillo",
    description: "Albóndigas de res magra rellenas de huevo cocido, bañadas en una salsa ahumada de chile morita y jitomate asado.",
    macros: { calories: 380, protein: 28, fat: 16, carbs: 18 },
    imageUrl: "/dishes/albondigas_morita.png"
  },
  {
    day: 'martes',
    name: "Galletas de Avena",
    category: "snack",
    description: "Galletas caseras horneadas con hojuelas de avena entera, plátano maduro y un toque de arándanos deshidratados.",
    macros: { calories: 150, protein: 4, fat: 4, carbs: 26 },
    imageUrl: "/dishes/galletas_avena.png"
  },

  // Miércoles
  {
    day: 'miercoles',
    name: "Lentejas con Cerdo y Papa",
    category: "platillo",
    description: "Guiso reconfortante de lentejas cocidas a fuego lento con trozos tiernos de cerdo magro y cubos de papa, en un caldo sazonado.",
    macros: { calories: 390, protein: 26, fat: 10, carbs: 38 },
    imageUrl: "/dishes/lentejas_cerdo_papa.png"
  },
  {
    day: 'miercoles',
    name: "Sincronizadas",
    category: "snack",
    description: "Dos tortillas de trigo integral rellenas de jamón de pechuga de pavo y queso panela derretido, tostadas a la plancha.",
    macros: { calories: 260, protein: 16, fat: 9, carbs: 22 },
    imageUrl: "/dishes/sincronizadas.png"
  },
  {
    day: 'miercoles',
    name: "Molletes",
    category: "snack",
    description: "Mitades de pan bolillo integral untadas con frijoles refritos sin grasa, gratinados con queso panela y servidos con pico de gallo.",
    macros: { calories: 240, protein: 12, fat: 6, carbs: 34 },
    imageUrl: "/dishes/molletes.png"
  },

  // Jueves
  {
    day: 'jueves',
    name: "Bistec a la Mexicana",
    category: "platillo",
    description: "Finas tiras de bistec de res guisadas en una salsa tradicional de jitomate, cebolla blanca y chile serrano picado.",
    macros: { calories: 370, protein: 32, fat: 14, carbs: 10 },
    imageUrl: "/dishes/bistec_mexicana.png"
  },
  {
    day: 'jueves',
    name: "Entomatado de Cerdo",
    category: "platillo",
    description: "Cubos de carne de cerdo guisados en una salsa verde ácida de tomatillo, cilantro y cebolla, con un toque ligero de comino.",
    macros: { calories: 380, protein: 30, fat: 16, carbs: 12 },
    imageUrl: "/dishes/entomatado_cerdo.png"
  },
  {
    day: 'jueves',
    name: "Soya al Pastor",
    category: "platillo",
    description: "Soya texturizada marinada en adobo de chiles secos, achiote y piña asada, salteada con cebolla y cilantro frescos.",
    macros: { calories: 280, protein: 18, fat: 6, carbs: 28 },
    imageUrl: "/dishes/soya_pastor.png"
  },
  {
    day: 'jueves',
    name: "Mix de Frutas",
    category: "snack",
    description: "Ensalada fresca de frutas picadas (papaya, melón y piña), espolvoreada con semillas de calabaza y chía.",
    macros: { calories: 120, protein: 2, fat: 1, carbs: 28 },
    imageUrl: "/dishes/mix_frutas.png"
  },
  {
    day: 'jueves',
    name: "Zanahoria, Pepino, Chile y Limón",
    category: "snack",
    description: "Tiras crujientes de zanahoria y pepino frescos, sazonadas con jugo de limón y chile en polvo bajo en sodio.",
    macros: { calories: 70, protein: 1, fat: 0, carbs: 14 },
    imageUrl: "/dishes/zanahoria_pepino_limon.png"
  },

  // Viernes
  {
    day: 'viernes',
    name: "Pescado al Limón",
    category: "platillo",
    description: "Filete de pescado blanco horneado a las finas hierbas con ralladura de limón, ajo y aceite de oliva virgen.",
    macros: { calories: 280, protein: 34, fat: 8, carbs: 10 },
    imageUrl: "/dishes/pescado_limon.png"
  },
  {
    day: 'viernes',
    name: "Soya con Nopal y Salsa Verde",
    category: "platillo",
    description: "Soya guisada con tiernos cubos de nopal en una salsa de tomatillo verde y cilantro fresco, sazonada con ajo.",
    macros: { calories: 240, protein: 16, fat: 5, carbs: 24 },
    imageUrl: "/dishes/soya_nopal_verde.png"
  },
  {
    day: 'viernes',
    name: "Albóndigas de Pollo",
    category: "platillo",
    description: "Albóndigas suaves hechas de pechuga de pollo molida guisadas en un caldo ligero de jitomate y calabacitas.",
    macros: { calories: 320, protein: 28, fat: 10, carbs: 16 },
    imageUrl: "/dishes/albondigas_pollo.png"
  },
  {
    day: 'viernes',
    name: "Overnight Oats con Cocoa",
    category: "snack",
    description: "Avena integral reposada en leche de almendras durante la noche, enriquecida con cocoa pura sin azúcar y chía.",
    macros: { calories: 210, protein: 6, fat: 5, carbs: 32 },
    imageUrl: "/dishes/overnight_cocoa.png"
  }
];

const seedMenu = async () => {
  try {
    // 1. Get existing dishes to check for duplicates
    console.log("Fetching existing dishes...");
    const dishesSnap = await getDocs(collection(db, 'Dishes'));
    const existingDishes = dishesSnap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name.trim().toLowerCase()
    }));

    const finalMenuIds = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: []
    };

    // 2. Insert new dishes (skipping duplicates if any exist)
    console.log("Processing new dishes...");
    for (const d of NEW_DISHES_DATA) {
      const normalizedName = d.name.trim().toLowerCase();
      const duplicate = existingDishes.find(ed => ed.name === normalizedName);

      let id = "";
      if (duplicate) {
        id = duplicate.id;
        console.log(`Skipped duplicate: "${d.name}" already exists with ID: ${id}`);
      } else {
        const docRef = await addDoc(collection(db, 'Dishes'), {
          name: d.name,
          category: d.category,
          description: d.description,
          macros: d.macros,
          imageUrl: d.imageUrl
        });
        id = docRef.id;
        console.log(`Added: "${d.name}" with ID: ${id}`);
      }
      finalMenuIds[d.day].push(id);
    }

    // 3. Inject reused dishes
    finalMenuIds.martes.push(REUSED_IDS.platano_asado);
    finalMenuIds.miercoles.unshift(REUSED_IDS.tinga_zanahoria); // Tinga is Item 1
    finalMenuIds.miercoles.splice(2, 0, REUSED_IDS.pasta_poblana); // Pasta Poblana is Item 3
    finalMenuIds.viernes.push(REUSED_IDS.huevo_tostada);

    console.log("Final mapped menu IDs:", JSON.stringify(finalMenuIds, null, 2));

    // 4. Update the WeeklyMenus document for 2026-07-06
    const targetWeekId = "2026-07-06";
    console.log(`Updating WeeklyMenu document "${targetWeekId}" in Firestore...`);
    await setDoc(doc(db, 'WeeklyMenus', targetWeekId), {
      availableDishes: finalMenuIds,
      isActive: false // Kept as false (draft) so it doesn't interfere until activated
    }, { merge: true });

    console.log(`WeeklyMenu "${targetWeekId}" updated successfully with isActive: false!`);
  } catch (error) {
    console.error("Error seeding menu:", error);
  }
};

seedMenu();
