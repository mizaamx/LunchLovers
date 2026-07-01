import fs from 'fs';
import path from 'path';

const userProfile = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(userProfile, '.config', 'configstore', 'firebase-tools.json');

async function main() {
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Firebase CLI config not found at ${configPath}`);
    }
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const accessToken = configData.tokens && configData.tokens.access_token;
    if (!accessToken) {
      throw new Error("No access token found. Please run 'firebase login' first.");
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

    console.log("Fetching all active weekly menus to deactivate...");
    const activeMenusUrl = `${baseUrl}/WeeklyMenus?pageSize=100`;
    const menusResponse = await apiRequest(activeMenusUrl);
    
    if (menusResponse.documents) {
      for (const doc of menusResponse.documents) {
        const menuId = doc.name.split('/').pop();
        const fields = doc.fields || {};
        const isActive = fields.isActive && fields.isActive.booleanValue;
        
        if (isActive && menuId !== "2026-07-06") {
          console.log(`Deactivating active menu: ${menuId}...`);
          const deactivateUrl = `${baseUrl}/WeeklyMenus/${menuId}?updateMask.fieldPaths=isActive`;
          await apiRequest(deactivateUrl, {
            method: 'PATCH',
            body: JSON.stringify({
              fields: {
                isActive: { booleanValue: false }
              }
            })
          });
          console.log(`Successfully deactivated: ${menuId}`);
        }
      }
    }

    console.log("Activating menu for week 2026-07-06...");
    const activateUrl = `${baseUrl}/WeeklyMenus/2026-07-06?updateMask.fieldPaths=isActive`;
    await apiRequest(activateUrl, {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          isActive: { booleanValue: true }
        }
      })
    });

    console.log("¡ÉXITO! El menú para la semana del 2026-07-06 ahora está ACTIVO.");
    process.exit(0);
  } catch (error) {
    console.error("Error activating menu:", error);
    process.exit(1);
  }
}

main();
