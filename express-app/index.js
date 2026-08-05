const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// Désactiver l'en-tête X-Powered-By
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send('Hello from Express');
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    // nosemgrep: no-console-log
    console.log(`Express app listening on port ${port}`);
  });
}