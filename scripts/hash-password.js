const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function hashPassword() {
  try {
    // Get user details
    const username = await askQuestion("Username: ");
    const password = await askQuestion("Password: ");
    const role = await askQuestion("Role (admin/manager/user): ");

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate MongoDB document
    const user = {
      username: username,
      password: hashedPassword,
      role: role,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("\n=== MongoDB Document to Insert ===");
    console.log(JSON.stringify(user, null, 2));

    console.log("\n=== MongoDB Insert Command ===");
    console.log(`db.users.insertOne(${JSON.stringify(user, null, 2)})`);

    rl.close();
  } catch (error) {
    console.error("Error:", error.message);
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

hashPassword();
