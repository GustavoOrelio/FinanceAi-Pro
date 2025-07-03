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

    // Busca apenas as lojas criadas pelo usuário
    const stores = await prisma.store.findMany({
      where: {
        createdById: userId,
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    return NextResponse.json(stores);
  } catch (error: any) {
    console.error("Erro ao buscar lojas:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao buscar lojas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, category, logo } = body;

    const store = await prisma.store.create({
      data: {
        name,
        description,
        category,
        logo,
        createdById: userId,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("Erro ao criar loja:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao criar loja" }, { status: 500 });
  }
}
