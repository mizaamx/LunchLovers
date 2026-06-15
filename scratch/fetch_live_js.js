import https from 'https';

https.get('https://lunchloversgdl-72e51.web.app/assets/index-BHOIwRhz.js', (res) => {
  console.log("index-BHOIwRhz.js Status:", res.statusCode);
  console.log("Headers:", res.headers);
}).on('error', (err) => {
  console.error("Error:", err);
});

https.get('https://lunchloversgdl-72e51.web.app/assets/index-B8SQVUP-.js', (res) => {
  console.log("index-B8SQVUP-.js Status:", res.statusCode);
}).on('error', (err) => {
  console.error("Error:", err);
});
