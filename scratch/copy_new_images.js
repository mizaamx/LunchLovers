import fs from 'fs';
import path from 'path';

const filesToCopy = [
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\tinga_pollo_1784843832830.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\tinga_pollo.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\pollo_florentina_garbanzos_1784843841370.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\pollo_florentina_garbanzos.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\sandwich_aguacate_huevo_1784843849460.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\sandwich_aguacate_huevo.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\pasta_carne_mexicana_1784843857610.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\pasta_carne_mexicana.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\pasta_calabaza_berenjena_1784843865760.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\pasta_calabaza_berenjena.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\calabazas_rellenas_carne_1784843874531.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\calabazas_rellenas_carne.png"
  },
  {
    src: "C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\222e6620-64f2-439e-8f70-34f278686037\\palomitas_cacahuetes_1784843882653.png",
    dest: "c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes\\palomitas_cacahuetes.png"
  }
];

filesToCopy.forEach(item => {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, item.dest);
    console.log(`Copied ${item.src} to ${item.dest}`);
  } else {
    console.error(`Source file not found: ${item.src}`);
  }
});
