import { NextResponse } from "next/server";
import { validateUser, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await validateUser(email, password);

    // Gera o token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Retorna o usuário (sem a senha) e o token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Email ou senha inválidos" },
      { status: 401 }
    );
  }
}
