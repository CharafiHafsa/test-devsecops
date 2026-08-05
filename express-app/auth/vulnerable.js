// Fichier de test pour déclencher les règles Semgrep de l'audit

// --- Règle A-01 : User.findOne sans .select('+password') ---
async function checkUser(email) {
  const User = {}; // simulation
  // Trouvé : manque .select('+password')
  const user = await User.findOne({ email: email });
  return user;
}

// --- Règle A-17 : DEFAULT_OWNER_EMAIL codé en dur ---
const DEFAULT_OWNER_EMAIL = "superadmin@example.com";

// --- Règle A-18 : isSuperAdmin bypass ---
async function checkAccess(userDoc) {
  if (userDoc.isSuperAdmin) {
    return { role: 'owner', salesAccess: true };
  }
}

// --- Règle no-console-log (warning) ---
console.log("Ce fichier est un test de vulnérabilités.");