import https from 'https';

https.get('https://lunchloversgdl-72e51.web.app/index.html', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    console.log("HTML Content:\n", data);
  });
}).on('error', (err) => {
  console.error("Error fetching URL:", err);
});
