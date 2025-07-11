import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { purchaseSchema } from "@/lib/schemas";

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

    // Extrai parâmetros de paginação da URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    // Busca total de registros e dados paginados em paralelo
    const [total, purchases] = await prisma.$transaction([
      prisma.purchase.count({
        where: { userId },
      }),
      prisma.purchase.findMany({
        where: { userId },
        include: {
          store: true,
          payments: true,
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    // Calcula metadados da paginação
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: purchases,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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

    // Valida os dados de entrada usando o schema Zod
    const validation = purchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validation.error.formErrors.fieldErrors,
        },
        { status: 400 }
      );
    }

    const { storeId, amount, date, category, description, installments } =
      validation.data;

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
