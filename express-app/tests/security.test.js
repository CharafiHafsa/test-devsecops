const request = require('supertest');
const app = require('../index');

describe('Security Tests - Express App', () => {

  // --------------------------------------------------------------
  // Test 1 : L'application répond correctement
  // --------------------------------------------------------------
  it('GET / should return 200 and welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello from Express');
  });

  // --------------------------------------------------------------
  // Test 2 : Vérification du Content-Type
  // --------------------------------------------------------------
  it('GET / should return text/html Content-Type', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/html/);
  });

  // --------------------------------------------------------------
  // Test 3 : Les en-têtes de sécurité HTTP sont absents
  // (Ce test DOIT échouer tant que les en-têtes ne sont pas ajoutés)
  // --------------------------------------------------------------
  it('GET / should have X-Content-Type-Options header', async () => {
    const res = await request(app).get('/');
    expect(res.headers).toHaveProperty('x-content-type-options');
  });

  it('GET / should have X-Frame-Options header', async () => {
    const res = await request(app).get('/');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  // --------------------------------------------------------------
  // Test 4 : Protection contre les méthodes HTTP dangereuses
  // --------------------------------------------------------------
  it('POST / should return 404 (no POST endpoint)', async () => {
    const res = await request(app).post('/');
    expect(res.status).toBe(404);
  });

  // --------------------------------------------------------------
  // Test 5 : Pas de version exposée dans les en-têtes
  // --------------------------------------------------------------
  it('GET / should not expose X-Powered-By header', async () => {
    const res = await request(app).get('/');
    expect(res.headers).not.toHaveProperty('x-powered-by');
  });

  // --------------------------------------------------------------
  // Test 6 : Rate limiting simulé
  // Vérifie que l'application ne crashe pas avec 20 requêtes rapides
  // --------------------------------------------------------------
  it('GET / should handle 20 rapid requests without crashing', async () => {
    const requests = Array(20).fill().map(() => request(app).get('/'));
    const responses = await Promise.all(requests);
    responses.forEach(res => {
      expect(res.status).toBe(200);
    });
  });

});