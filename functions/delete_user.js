const admin = require("firebase-admin");

admin.initializeApp({
  projectId: "lunchloversgdl-72e51"
});

const email = "admin@lunchlovers.com";

async function deleteUser() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    console.log(`Exito: Se elimino el usuario ${email} (${user.uid}) de Firebase Auth.`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`El usuario ${email} no existe en Firebase Auth, listo para registro.`);
      process.exit(0);
    } else {
      console.error("Error al eliminar el usuario:", error.message);
      process.exit(1);
    }
  }
}

deleteUser();
