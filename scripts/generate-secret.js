const crypto = require("crypto");

// Generate secure random secret for NextAuth
function generateNextAuthSecret() {
  // Generate 256-bit (32 bytes) random data
  const randomBytes = crypto.randomBytes(32);

  // Create SHA-256 hash
  const secret = crypto.createHash("sha256").update(randomBytes).digest("hex");

  return secret;
}

// Generate and display the secret
console.log("\n=== Generated NextAuth Secret ===");
const secret = generateNextAuthSecret();
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log("\n📋 Copy this to your .env.local file");
console.log("🔒 This is a secure 256-bit SHA-256 hash");
console.log("\nExample .env.local entry:");
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log("NEXTAUTH_URL=http://localhost:3000");
console.log("MONGODB_URL=your_mongodb_connection_string");
