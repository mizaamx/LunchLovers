import fs from 'fs';
import path from 'path';

const userProfile = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(userProfile, '.config', 'configstore', 'firebase-tools.json');

const newDishesData = [
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

async function main() {
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Firebase CLI config not found at ${configPath}`);
    }
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const accessToken = configData.tokens && configData.tokens.access_token;
    if (!accessToken) {
      throw new Error("No access token found in firebase-tools.json");
    }

    const projectId = "lunchloversgdl-72e51";
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const apiRequest = async (url, options = {}) => {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      };
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error (${response.status}): ${errorText}`);
      }
      return await response.json();
    };

    console.log("1. Creating new dishes in Firestore via REST API...");
    const createdIds = {};

    for (const dish of newDishesData) {
      const dishBody = {
        fields: {
          name: { stringValue: dish.name },
          category: { stringValue: dish.category },
          description: { stringValue: dish.description },
          imageUrl: { stringValue: dish.imageUrl },
          macros: {
            mapValue: {
              fields: {
                calories: { integerValue: dish.macros.calories },
                protein: { integerValue: dish.macros.protein },
                fat: { integerValue: dish.macros.fat },
                carbs: { integerValue: dish.macros.carbs }
              }
            }
          }
        }
      };

      const res = await apiRequest(`${baseUrl}/Dishes`, {
        method: 'POST',
        body: JSON.stringify(dishBody)
      });

      const newId = res.name.split('/').pop();
      createdIds[dish.key] = newId;
      console.log(`Created "${dish.name}" with ID: ${newId}`);
    }

    const weekId = "2026-07-27";
    const weeklyMenuByDay = {
      lunes: [
        "i3WxFWCIVsSGd2qFrf3m",       // Tortilla Española
        "IsdHNDEmIK85IMS6zpGT",       // Sándwich de huevo con cebollín
        createdIds.tinga_pollo,       // Tinga de pollo
        "dnWjQWzusIDY6V220eaY",       // Cerdo con elote
        "p2RLsDGyEI1mjyHjW4YS"        // Pescado con paprika
      ],
      martes: [
        "xowJ3AgtYljvxlnhxS8e",       // Huevo en tostada integral
        "FoC1zcHBniDhzwgnSltH",       // Pure dulce de camote
        createdIds.pollo_florentina_garbanzos, // Pollo a la florentina y garbanzos
        "mWGXYArohuY7T4qqNehj",       // Milanesa de cerdo con ensalada y Arroz
        "Vl0sIONZ3EbZk9mxqvD6"        // Pescado al limón con verduras
      ],
      miercoles: [
        "WfZmZXSkvY9DEfytNhKl",       // Hotcake de avena y fruta
        createdIds.sandwich_aguacate_huevo, // SÁNDWICH DE AGUACATE CON HUEVO
        createdIds.pasta_carne_mexicana,   // Pasta con carne molida a la mexicana con verduras y elote
        "uFhvV1BiGajnaaAvveAg",       // Fajitas de cerdo con salteado de pimientos
        createdIds.pasta_calabaza_berenjena // (VEG) Pasta con calabaza y berenjena
      ],
      jueves: [
        "5jyhJ4fJLGWI2HXLVuKP",       // Yogurt con granola
        "L6nlZRMR6m9P7H3zTlJg",       // (VEG) Papa con huevo
        "rxbxMAGruPDjyJR7yvDZ",       // Rajas poblanas con pollo
        createdIds.calabazas_rellenas_carne, // CALABAZAS RELLENAS DE CARNE
        "LNHq57kR6EVxm9r22hmq"        // Pescado sellado
      ],
      viernes: [
        createdIds.palomitas_cacahuetes, // Palomitas con cacahuetes
        "M3MUOZhSMLVIXqdEPQx4",       // Enjambre de chocolate
        "194MYiWN90jHzc2t7JWs",       // Pasta alfredo
        "YYk4RtVvyzbE7XNgOa5S",       // Carne de puerco con calabacitas
        "kbj0qzRlaLMfdXcVy7Da"        // Pescado con puré de coliflor
      ]
    };

    console.log("\n2. Deactivating all currently active WeeklyMenus...");
    const menusRes = await apiRequest(`${baseUrl}/WeeklyMenus?pageSize=100`);
    if (menusRes.documents) {
      for (const doc of menusRes.documents) {
        const menuId = doc.name.split('/').pop();
        const fields = doc.fields || {};
        const isActive = fields.isActive && fields.isActive.booleanValue;
        if (isActive && menuId !== weekId) {
          console.log(`Deactivating active menu: ${menuId}`);
          await apiRequest(`${baseUrl}/WeeklyMenus/${menuId}?updateMask.fieldPaths=isActive`, {
            method: 'PATCH',
            body: JSON.stringify({
              fields: {
                isActive: { booleanValue: false }
              }
            })
          });
        }
      }
    }

    console.log(`\n3. Setting active WeeklyMenu document "${weekId}"...`);
    const convertDayList = (arr) => ({
      arrayValue: {
        values: arr.map(id => ({ stringValue: id }))
      }
    });

    const menuBody = {
      fields: {
        isActive: { booleanValue: true },
        availableDishes: {
          mapValue: {
            fields: {
              lunes: convertDayList(weeklyMenuByDay.lunes),
              martes: convertDayList(weeklyMenuByDay.martes),
              miercoles: convertDayList(weeklyMenuByDay.miercoles),
              jueves: convertDayList(weeklyMenuByDay.jueves),
              viernes: convertDayList(weeklyMenuByDay.viernes)
            }
          }
        }
      }
    };

    await apiRequest(`${baseUrl}/WeeklyMenus/${weekId}`, {
      method: 'PATCH',
      body: JSON.stringify(menuBody)
    });

    console.log(`\n🎉 ¡Menú semanal para ${weekId} configurado y activado con éxito!`);
  } catch (err) {
    console.error("Error in REST update script:", err);
    process.exit(1);
  }
}

main();
