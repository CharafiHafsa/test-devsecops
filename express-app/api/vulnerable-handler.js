// Fichier de test pour déclencher les règles Semgrep manquantes

// --- Règle missing-get-server-session ---
// Handler sans appel à getServerSession()
export async function GET(request) {
  // pas de const session = await getServerSession(...)
  return new Response(JSON.stringify({ data: "sensitive" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// --- Règle ReDoS : $regex avec variable non échappée ---
async function search(query) {
  const q = query;
  // Trouvé : q est utilisé directement dans $regex sans échappement
  const filter = { code: { $regex: q, $options: "i" } };
  // ... utilisation dans une requête MongoDB
}

// --- Autre console.log ---
console.log("test api handler");