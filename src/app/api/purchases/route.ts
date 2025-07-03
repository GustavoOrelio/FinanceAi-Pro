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

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        store: true,
        payments: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(purchases);
  } catch (error: any) {
    console.error("Erro ao buscar compras:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao buscar compras" },
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
    const { storeId, amount, date, category, description, installments } = body;

    // Verifica se a loja existe
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        storeId,
        userId,
        amount,
        paidAmount: 0,
        remainingAmount: amount,
        date: new Date(date),
        category,
        description,
        status: "pending",
        installments,
      },
      include: {
        store: true,
        payments: true,
      },
    });

    return NextResponse.json(purchase);
  } catch (error: any) {
    console.error("Erro ao criar compra:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao criar compra" },
      { status: 500 }
    );
  }
}
