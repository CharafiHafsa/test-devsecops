const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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