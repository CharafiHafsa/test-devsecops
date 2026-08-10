// Vulnérabilités A-01, A-17, A-18
async function checkUser(email) {
  const User = {};
  const user = await User.findOne({ email: email });  // manque .select('+password')
  return user;
}

const DEFAULT_OWNER_EMAIL = "superadmin@example.com";

async function checkAccess(userDoc) {
  if (userDoc.isSuperAdmin) {
    return { role: 'owner', salesAccess: true };
  }
}