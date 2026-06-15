/**
 * Cloud Function: notificarNuevoPedido
 * Disparador: Firestore - onCreate en 'orders/{orderId}'
 * Envía un correo electrónico al administrador con los detalles del nuevo pedido.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();

// Catálogo interno para traducir IDs a nombres de platillos en el correo
const dishCatalog = {
  1: 'Amanida de Saumon avec Avocat (Keto / Proteína)',
  2: 'Buddha Bowl de Quinoa avec Edamame (Vegano)',
  3: 'Salată de Pui et Quinoa Fitness (Proteína)',
  4: 'Ensalada de Tofu Crujiente (Keto / Vegano)',
  5: 'Saumon Glacé Oriental Style Keto (Keto)',
  6: 'Curry de Poids Chiches et Quinoa Fit (Vegano / Proteína)',
};

// Configuración del transporte de correo SMTP con variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER, // Correo del remitente (ej. notificaciones.gdl@gmail.com)
    pass: process.env.SMTP_PASS, // Contraseña de aplicación SMTP
  },
});

exports.notificarNuevoPedido = onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No snapshot data associated with document creation.");
    return null;
  }

  const orderData = snapshot.data();
  const orderId = event.params.orderId;

  // Extracción de datos del pedido
  const userName = orderData.userName || orderData.name || "Cliente GDL";
  const userEmail = orderData.userEmail || orderData.email || "Sin correo";
  const planRaw = orderData.plan || "Plan Normal";
  const totalAmount = orderData.totalAmount || orderData.total || 0;
  
  // Mapear nombres de plan legibles
  const planNames = {
    basic: 'Plan Básico (5 Platillos)',
    normal: 'Plan Normal (10 Platillos)',
    pro: 'Plan Pro (10 Platillos + Snacks)',
  };
  const planName = planNames[planRaw.toLowerCase()] || planRaw;

  // Formatear dirección de entrega estructurada o string fallback
  let addressText = "";
  if (orderData.deliveryAddress) {
    const addr = orderData.deliveryAddress;
    addressText = `
      <strong>Calle y Num:</strong> ${addr.street || ""}<br/>
      <strong>Colonia:</strong> ${addr.colony || ""}<br/>
      <strong>Municipio:</strong> ${addr.municipality || ""}<br/>
      <strong>C.P.:</strong> ${addr.zipCode || ""}<br/>
      <strong>Instrucciones:</strong> ${addr.instructions || "Ninguna"}
    `;
  } else {
    addressText = orderData.address || "Dirección no provista";
  }

  // Obtener nombres de platillos seleccionados
  const mealIds = orderData.selectedMealIds || orderData.mealIds || [];
  const mealsListHtml = mealIds.length > 0 
    ? `<ul>` + mealIds.map(id => `<li>${dishCatalog[id] || `Platillo ID: ${id}`}</li>`).join("") + `</ul>`
    : `<p style="font-style: italic; color: #7f8c8d;">No se seleccionaron platillos para este periodo.</p>`;

  // Generar sugerencias de preparación/ingredientes usando Gemini 3 Flash Preview
  const mealNames = mealIds.map(id => dishCatalog[id] || `Platillo ID: ${id}`);
  let aiSuggestionsHtml = "";

  if (process.env.GEMINI_API_KEY && mealNames.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `El cliente ha contratado el plan "${planName}" y ha seleccionado los siguientes platillos para esta semana:
${mealNames.map(name => `- ${name}`).join("\n")}

Genera una lista con 3 o 4 sugerencias de preparación o ingredientes adicionales sencillos y frescos para complementar estos platillos (por ejemplo, añadir un toque de limón fresco, aguacate, semillas de sésamo o cilantro).
La respuesta DEBE ser una lista HTML simple (etiqueta <ul> conteniendo elementos <li>). No incluyes explicaciones adicionales antes o después, solo el marcado HTML. No uses emojis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      if (response && response.text) {
        let cleanHtml = response.text.trim();
        if (cleanHtml.startsWith("```html")) {
          cleanHtml = cleanHtml.replace(/^```html/, "").replace(/```$/, "").trim();
        } else if (cleanHtml.startsWith("```")) {
          cleanHtml = cleanHtml.replace(/^```/, "").replace(/```$/, "").trim();
        }
        aiSuggestionsHtml = cleanHtml;
      }
    } catch (error) {
      console.error("Error al generar sugerencias con Gemini:", error);
    }
  }

  // Fallback si la llamada a Gemini falló o no hay API Key configurada
  if (!aiSuggestionsHtml) {
    aiSuggestionsHtml = `
      <ul>
        <li>Agrega unas rebanadas de aguacate fresco a tus ensaladas o Buddha bowls para un toque de grasas saludables adicionales.</li>
        <li>Un chorrito de limón recién exprimido antes de consumir resaltará los sabores naturales de tus pescados y ensaladas.</li>
        <li>Espolvorea semillas de chía o sésamo tostado sobre el curry o bowls para añadir textura y fibra extra.</li>
        <li>Mantén tus platillos refrigerados a una temperatura de 2-4 grados Celsius y consúmelos preferentemente antes de la fecha recomendada.</li>
      </ul>
    `;
  }

  // Configuración del correo para el administrador
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lunchlovers.com";
  const subject = `🚨 NUEVO PEDIDO: ${planName} - ${userName}`;

  // Plantilla HTML estilizada con la paleta de la marca (Crema, Terracota, Mostaza)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #F4EBDC;
          color: #333333;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(176, 90, 50, 0.08);
          margin: 0 auto;
          border: 1px solid rgba(176, 90, 50, 0.1);
        }
        .header {
          background-color: #B05A32;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 20px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header p {
          color: #F4EBDC;
          font-size: 12px;
          margin: 5px 0 0 0;
          font-weight: bold;
        }
        .content {
          padding: 30px 25px;
        }
        .section-title {
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          color: #B05A32;
          letter-spacing: 1px;
          border-bottom: 2px solid #F4EBDC;
          padding-bottom: 6px;
          margin-top: 25px;
          margin-bottom: 12px;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .meta-table td {
          padding: 8px 0;
          font-size: 13px;
          vertical-align: top;
        }
        .meta-table td.label {
          width: 30%;
          font-weight: bold;
          color: #7f8c8d;
        }
        .meta-table td.value {
          color: #2c3e50;
        }
        ul {
          padding-left: 20px;
          margin: 5px 0;
        }
        li {
          font-size: 13px;
          margin-bottom: 6px;
          color: #34495e;
          font-weight: bold;
        }
        .button-container {
          text-align: center;
          margin-top: 35px;
        }
        .btn-admin {
          display: inline-block;
          background-color: #DA9E33;
          color: #ffffff;
          font-weight: bold;
          text-decoration: none;
          padding: 12px 35px;
          border-radius: 30px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 6px rgba(218, 158, 51, 0.15);
        }
        .footer {
          background-color: #fcf9f5;
          padding: 20px;
          text-align: center;
          font-size: 11px;
          color: #95a5a6;
          border-top: 1px solid #F4EBDC;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header -->
        <div class="header">
          <h1>Lunch Lovers GDL</h1>
          <p>Notificación de Gestión Interna</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p style="margin-top: 0; font-size: 14px; font-weight: bold; color: #2c3e50;">
            Se ha registrado una nueva orden de comida a través de la plataforma.
          </p>
          
          <!-- Datos Generales -->
          <div class="section-title">Resumen del Pedido</div>
          <table className="meta-table">
            <tr>
              <td className="label">ID de Orden:</td>
              <td className="value" style="font-family: monospace; font-weight: bold;">${orderId}</td>
            </tr>
            <tr>
              <td className="label">Plan Contratado:</td>
              <td className="value" style="font-weight: bold; color: #B05A32;">${planName}</td>
            </tr>
            <tr>
              <td className="label">Monto Pagado:</td>
              <td className="value" style="font-weight: bold;">$${totalAmount} MXN</td>
            </tr>
          </table>

          <!-- Datos del Cliente -->
          <div class="section-title">Datos del Cliente</div>
          <table className="meta-table">
            <tr>
              <td className="label">Nombre:</td>
              <td className="value">${userName}</td>
            </tr>
            <tr>
              <td className="label">Correo:</td>
              <td className="value">${userEmail}</td>
            </tr>
          </table>

          <!-- Platillos Seleccionados -->
          <div class="section-title">Platillos para la Semana</div>
          ${mealsListHtml}

          <!-- Dirección de entrega -->
          <div class="section-title">Dirección de Entrega (ZMG)</div>
          <p style="font-size: 13px; line-height: 1.6; color: #34495e; background-color: #faf8f5; padding: 12px; border-radius: 8px; border: 1px solid #F4EBDC;">
            ${addressText}
          </p>

          <!-- Sugerencias de Preparación de la IA -->
          <div class="section-title">Sugerencias de la IA para tus Platillos</div>
          <div style="font-size: 13px; line-height: 1.6; color: #333333; background-color: #fcfbf9; padding: 16px; border-radius: 12px; border: 1px dashed #B05A32; margin-top: 15px;">
            <p style="margin-top: 0; font-weight: bold; color: #B05A32; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Complementos sugeridos por NutriLovers AI:
            </p>
            ${aiSuggestionsHtml}
          </div>

          <!-- Botón de acción rápido -->
          <div class="button-container">
            <a href="https://lunch-lovers.firebaseapp.com/#admin" class="btn-admin">
              Ver en Panel de Admin
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          Este correo fue generado automáticamente por la Cloud Function de lunch-lovers.<br/>
          Lunch Lovers GDL &copy; 2026 - Todos los derechos reservados.
        </div>

      </div>
    </body>
    </html>
  `;

  // Envío del correo
  try {
    const info = await transporter.sendMail({
      from: `"Notificaciones Lunch Lovers" <${process.env.SMTP_USER || "no-reply@lunchlovers.com"}>`,
      to: adminEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully for order ${orderId}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email for order ${orderId}:`, error);
    return { success: false, error: error.message };
  }
});

// Trigger para establecer automáticamente el custom claim de admin al registrarse
const functions = require("firebase-functions");
exports.establecerAdminClaim = functions.auth.user().onCreate(async (user) => {
  if (user.email === "admin@lunchlovers.com" || user.email === "chef@lunchlovers.com") {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`Custom claim de admin asignado exitosamente al usuario ${user.uid}`);
    } catch (error) {
      console.error(`Error al establecer claim de admin para ${user.uid}:`, error);
    }
  }
});

// Endpoint HTTPS seguro de Chat con Gemini (Backend Proxy)
exports.chatConGemini = onRequest({ cors: true }, async (req, res) => {
  // Solo permitir solicitudes POST
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).send("Bad Request: messages array is required.");
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY no configurado en el servidor." });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const SYSTEM_INSTRUCTION = `
Eres un Asistente Personal de Nutrición experto de 'Lunch Lovers GDL'.
Tu objetivo es ayudar al usuario a armar su menú semanal recomendándole combinaciones de nuestros platillos según sus metas calóricas diarias o semanales.
Sé siempre sumamente amable, profesional, conciso y estructurado en tus respuestas. Usa viñetas cortas.

Nuestro catálogo real de platillos es:
1. Amanida de Saumon avec Avocat (Keto / Proteína) - 420 Kcal | 38g Proteína | 24g Grasa | 8g Carb.
2. Buddha Bowl de Quinoa avec Edamame (Vegano) - 380 Kcal | 16g Proteína | 12g Grasa | 52g Carb.
3. Salată de Pui et Quinoa Fitness (Alto en Proteína) - 410 Kcal | 45g Proteína | 8g Grasa | 35g Carb.
4. Ensalada de Tofu Crujiente avec Végétaux (Keto / Vegano) - 310 Kcal | 18g Proteína | 22g Grasa | 10g Carb.
5. Saumon Glacé Oriental Style Keto (Keto) - 395 Kcal | 35g Proteína | 21g Grasa | 11g Carb.
6. Curry de Poids Chiches et Quinoa Fit (Vegano / Alto en Proteína) - 440 Kcal | 22g Proteína | 14g Grasa | 48g Carb.

Si el usuario te dice sus calorías objetivo para el almuerzo o cena, sugiérele la mejor combinación para sus almuerzos/cenas semanales (ej. si su plan es de 5 platillos, sugiérele 5 de ellos para almuerzo; si es de 10 platillos, almuerzo y cena para 5 días). Haz los cálculos exactos y muéstrale la suma total de calorías y macros.
Importante: No inventes platillos fuera de este catálogo. Responde en español. No uses emojis.
`;

    // Mapear historial al formato esperado por la SDK
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const responseText = response.text || 'No pude procesar la respuesta. Por favor, intenta de nuevo.';
    res.status(200).json({ text: responseText });
  } catch (error) {
    console.error("Error en chatConGemini:", error);
    res.status(500).json({ error: error.message || "Error al conectar con la IA." });
  }
});

