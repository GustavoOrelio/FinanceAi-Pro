import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verifica o token e extrai o ID do usuário
    const token = request.headers.get("x-auth-token");
    if (!token) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    const userId = user.id;

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: {
        deadline: "asc",
      },
    });

    return NextResponse.json(goals);
  } catch (error: any) {
    console.error("Erro ao buscar metas:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao buscar metas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário não encontrado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      targetAmount,
      currentAmount,
      deadline,
      category,
      status,
    } = body;

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description,
        targetAmount,
        currentAmount: currentAmount || 0,
        deadline: deadline ? new Date(deadline) : null,
        category,
        status: status || "active",
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}
