import { NextResponse } from "next/server";
import { verifyToken, generateToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    // Gera um novo token para renovar a sessão
    const newToken = generateToken(user);

    // Cria a resposta com o novo token no header
    const response = NextResponse.json({ user });
    response.headers.set("x-new-token", newToken);

    return response;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
