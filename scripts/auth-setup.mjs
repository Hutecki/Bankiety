/**
 * Password Encryption and Secret Generation Utility
 *
 * This script helps you:
 * 1. Generate secure NEXTAUTH_SECRET (SHA-256)
 * 2. Encrypt passwords for initial user creation
 * 3. Create admin users
 *
 * Usage:
 * node scripts/auth-setup.mjs --generate-secret
 * node scripts/auth-setup.mjs --encrypt-password "mypassword"
 * node scripts/auth-setup.mjs --create-admin
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "../config/database.js";
import User from "../models/User.js";

// Generate secure random secret for NextAuth
function generateNextAuthSecret() {
  // Generate 256-bit (32 bytes) random data
  const randomBytes = crypto.randomBytes(32);

  // Create SHA-256 hash
  const secret = crypto.createHash("sha256").update(randomBytes).digest("hex");

  return secret;
}

// Encrypt password using bcrypt
async function encryptPassword(password) {
  if (!password) {
    throw new Error("Password is required");
  }

  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  return {
    original: password,
    hashed: hashedPassword,
    saltRounds,
  };
}

// Verify password against hash
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Create admin user interactively
async function createAdminUser() {
  try {
    await connectDB();
    console.log("Connected to database.");

    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt) =>
      new Promise((resolve) => {
        readline.question(prompt, resolve);
      });

    console.log("\n=== Create Admin User ===");

    const username = await question("Username: ");
    const email = await question("Email: ");
    const password = await question("Password: ");
    const confirmPassword = await question("Confirm Password: ");

    readline.close();

    // Validation
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error("User with this username or email already exists");
    }

    // Create admin user
    const adminUser = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role: "admin",
      isActive: true,
    });

    await adminUser.save();

    console.log("\n✅ Admin user created successfully!");
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);

    return adminUser;
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message);
    throw error;
  }
}

// List all users
async function listUsers() {
  try {
    await connectDB();

    const users = await User.find(
      {},
      {
        password: 0, // Exclude password field
      }
    ).sort({ createdAt: -1 });

    console.log("\n=== Users List ===");
    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive ? "Yes" : "No"}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(
        `   Last Login: ${
          user.lastLogin ? user.lastLogin.toLocaleDateString() : "Never"
        }`
      );
    });

    // Show statistics
    const stats = await User.getStats();
    console.log("\n=== Statistics ===");
    console.log(`Total Users: ${stats.totalUsers}`);
    console.log(`Active Users: ${stats.activeUsers}`);
    console.log(`Admins: ${stats.adminUsers}`);
    console.log(`Managers: ${stats.managerUsers}`);
    console.log(`Regular Users: ${stats.regularUsers}`);
  } catch (error) {
    console.error("Error listing users:", error.message);
    throw error;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    generateSecret: false,
    encryptPassword: null,
    createAdmin: false,
    listUsers: false,
    help: false,
  };

  args.forEach((arg, index) => {
    if (arg === "--generate-secret") {
      options.generateSecret = true;
    } else if (arg === "--encrypt-password") {
      options.encryptPassword = args[index + 1];
    } else if (arg === "--create-admin") {
      options.createAdmin = true;
    } else if (arg === "--list-users") {
      options.listUsers = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  });

  return options;
}

// Show help
function showHelp() {
  console.log(`
NextAuth Setup Utility

Usage:
  node scripts/auth-setup.mjs [options]

Options:
  --generate-secret       Generate secure NEXTAUTH_SECRET
  --encrypt-password PWD  Encrypt a password using bcrypt
  --create-admin          Create admin user interactively  
  --list-users            List all existing users
  --help, -h             Show this help message

Examples:
  node scripts/auth-setup.mjs --generate-secret
  node scripts/auth-setup.mjs --encrypt-password "mypassword123"
  node scripts/auth-setup.mjs --create-admin
  node scripts/auth-setup.mjs --list-users

Environment Setup:
  1. Generate secret: node scripts/auth-setup.mjs --generate-secret
  2. Add NEXTAUTH_SECRET to your .env.local file
  3. Create admin user: node scripts/auth-setup.mjs --create-admin
  `);
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    if (options.generateSecret) {
      const secret = generateNextAuthSecret();
      console.log("\n=== Generated NextAuth Secret ===");
      console.log(`NEXTAUTH_SECRET=${secret}`);
      console.log("\n📋 Copy this to your .env.local file");
      console.log("🔒 This is a secure 256-bit SHA-256 hash");
    }

    if (options.encryptPassword) {
      const result = await encryptPassword(options.encryptPassword);
      console.log("\n=== Password Encryption Result ===");
      console.log(`Original: ${result.original}`);
      console.log(`Hashed: ${result.hashed}`);
      console.log(`Salt Rounds: ${result.saltRounds}`);

      // Verify the hash works
      const isValid = await verifyPassword(result.original, result.hashed);
      console.log(`Verification: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    }

    if (options.createAdmin) {
      await createAdminUser();
    }

    if (options.listUsers) {
      await listUsers();
    }

    // Show help if no options provided
    if (
      !options.generateSecret &&
      !options.encryptPassword &&
      !options.createAdmin &&
      !options.listUsers
    ) {
      console.log("No options provided. Use --help for usage information.");
      showHelp();
    }
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateNextAuthSecret,
  encryptPassword,
  verifyPassword,
  createAdminUser,
};
