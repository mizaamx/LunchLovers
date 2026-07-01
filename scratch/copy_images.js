import fs from 'fs';
import path from 'path';

const artifactDir = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\e5cf93a9-64e6-4674-bfcb-b0b1fdf090a9';
const destDir = 'c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes';

const files = fs.readdirSync(artifactDir);

const mappings = {
  puerco_calabacitas: 'puerco_calabacitas.png',
  chop_suey_pollo: 'chop_suey_pollo.png',
  coliflor_salteada: 'coliflor_salteada.png',
  uvas_yogurt: 'uvas_yogurt.png',
  pure_camote: 'pure_camote.png',
  milanesa_cerdo_arroz: 'milanesa_cerdo_arroz.png',
  pescado_sellado: 'pescado_sellado.png',
  albondigas_morita: 'albondigas_morita.png',
  galletas_avena: 'galletas_avena.png',
  lentejas_cerdo_papa: 'lentejas_cerdo_papa.png',
  sincronizadas: 'sincronizadas.png',
  molletes: 'molletes.png',
  bistec_mexicana: 'bistec_mexicana.png',
  entomatado_cerdo: 'entomatado_cerdo.png',
  soya_pastor: 'soya_pastor.png',
  mix_frutas: 'mix_frutas.png',
  zanahoria_pepino_limon: 'zanahoria_pepino_limon.png'
};

// 1. Copy the 17 generated images
for (const [prefix, destName] of Object.entries(mappings)) {
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
  if (match) {
    const srcPath = path.join(artifactDir, match);
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${match} -> ${destName}`);
  } else {
    console.warn(`WARNING: Could not find generated image for ${prefix}`);
  }
}

// 2. Set up fallback images for the 4 quota-limited dishes
const fallbacks = [
  { src: 'pescado_paprika.png', dest: 'pescado_limon.png' },
  { src: 'cerdo_nopales.png', dest: 'soya_nopal_verde.png' },
  { src: 'albondigas_morita.png', dest: 'albondigas_pollo.png' },
  { src: 'yogurt_chia.png', dest: 'overnight_cocoa.png' }
];

for (const { src, dest } of fallbacks) {
  const srcPath = path.join(destDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Fallback set: ${src} -> ${dest}`);
  } else {
    console.error(`ERROR: Fallback source image ${src} does not exist!`);
  }
}

console.log("Image transfer complete.");
