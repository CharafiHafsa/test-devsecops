// Vulnérabilités A-09, A-14, A-19
export async function GET(request) {
  return new Response(JSON.stringify({ data: "sensitive" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function search(query) {
  const q = query;
  const filter = { code: { $regex: q, $options: "i" } };
}