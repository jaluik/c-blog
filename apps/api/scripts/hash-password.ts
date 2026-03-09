import { hashPassword } from "../src/utils/password";

async function main() {
  const password = process.argv[2] || "admin123";
  const hash = await hashPassword(password);
  console.log("Password hash:", hash);
}

main();
