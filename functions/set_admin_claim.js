const admin = require("firebase-admin");

// Inicializar usando las credenciales del entorno local del CLI
admin.initializeApp({
  projectId: "lunchloversgdl-72e51"
});

const email = "admin@lunchlovers.com";

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Exito: Se asigno el rol de Administrador (Custom Claim) a ${email} (${user.uid})`);
    
    // Verificar claims actualizados
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log("Claims del usuario:", updatedUser.customClaims);
    process.exit(0);
  } catch (error) {
    console.error("Error al establecer el rol de admin:", error.message);
    console.log("Nota: Asegurate de haber registrado primero el usuario admin@lunchlovers.com en la pagina web.");
    process.exit(1);
  }
}

setAdmin();
