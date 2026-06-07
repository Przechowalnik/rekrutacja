import bcryptjs from "bcryptjs";

export async function hashPassword(password: string) {
  const hashedPassword = await bcryptjs.hash(password, 15);
  return hashedPassword;
}

export async function checkPassword(password: string, hashedPassword: string) {
  const isValid = await bcryptjs.compare(password, hashedPassword);
  return isValid;
}
