// robbyweeds/server/index.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from server!');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
