import prisma from "../prisma/client.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const SALT_ROUNDS = 10;
import { EventEmitter } from "events";
const ee = new EventEmitter();

// '---------'
export async function createUser(_, { name, email, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      include: { projects: true },
    });
    ee.emit("USER_CREATED", newUser);
    return newUser;
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("User with this email already exists.");
    }
    throw err;
  }
}
// '---------'
export async function loginUser(_, { email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { projects: true },
  });
  if (!user) throw new Error("User not found");
  if (!user.password) {
    const error = new Error(
      "This account was registered via Google. User must set a password.",
    );
    error.code = "ACCOUNT_NEEDS_PASSWORD";
    throw error;
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid password");
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const formattedUser = {
    ...user,
    createdAt: new Date(user.createdAt).getTime().toString(),
  };
  return { token, user: formattedUser };
}
// '---------'
export async function setPassword(_, { email, password }) {
  if (!email || !password) throw new Error("Email and password are required.");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found.");
  if (user.password)
    throw new Error("User already has a password. Use login instead.");
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  const { password: _password, ...safeUser } = updatedUser;
  return safeUser;
}
// '---------'
export async function loginWithGoogle(_, { idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid Google token");
  const { sub: googleId, email, name, picture } = payload;
  let user = await prisma.user.findUnique({
    where: { email },
    include: { projects: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        password: null,
        picture,
      },
      include: { projects: true },
    });
    ee.emit("USER_CREATED", user);
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const formattedUser = {
    ...user,
    createdAt: new Date(user.createdAt).getTime().toString(),
  };
  return { token, user: formattedUser };
}
// '---------'
export async function removeUser(_, { userId }) {
  const id = Number(userId);

  const userFigmaProjects = await prisma.figmaProject.findMany({
    where: { ownerId: id },
  });
  const deletedUser = await prisma.user.delete({
    where: { id },
    select: { id: true },
  });

  ee.emit("USER_DELETED", deletedUser.id);

  return deletedUser.id;
}
