import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: A variável de ambiente JWT_SECRET não está definida. Por favor, configure-a antes de iniciar a aplicação."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  console.log("generateToken: Gerando token para usuário:", {
    id: user.id,
    email: user.email,
  });
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  console.log("generateToken: Token gerado com sucesso");
  return token;
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error("verifyToken: Erro ao verificar token:", error);
    throw new Error("Token inválido");
  }
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) {
    throw new Error("Senha incorreta");
  }

  return user;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  console.log("getAuthUser: Verificando header de autorização");
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log(
      "getAuthUser: Header de autorização não encontrado ou inválido"
    );
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("getAuthUser: Token encontrado, verificando...");
    const user = verifyToken(token);
    console.log("getAuthUser: Token válido, usuário:", {
      id: user.id,
      email: user.email,
    });
    return user;
  } catch (error) {
    console.error("getAuthUser: Erro ao verificar token:", error);
    return null;
  }
}
