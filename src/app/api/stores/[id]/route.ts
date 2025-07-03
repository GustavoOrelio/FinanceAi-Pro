import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      include: {
        purchases: {
          include: {
            payments: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem permissão para acessar a loja
    if (store.createdById !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("Erro ao buscar loja:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verifica se a loja existe e se o usuário tem permissão para editá-la
    const existingStore = await prisma.store.findUnique({
      where: { id: params.id },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    if (existingStore.createdById !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, logo } = body;

    const store = await prisma.store.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        logo,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("Erro ao atualizar loja:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar loja" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verifica se a loja existe e se o usuário tem permissão para deletá-la
    const existingStore = await prisma.store.findUnique({
      where: { id: params.id },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    if (existingStore.createdById !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    await prisma.store.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar loja:", error);
    if (error.message === "Token inválido") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro ao deletar loja" },
      { status: 500 }
    );
  }
}
