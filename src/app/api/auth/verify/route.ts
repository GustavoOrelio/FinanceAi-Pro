import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
