import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return NextResponse.json({ error: "Erro ao buscar meta" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      category,
      status,
    } = body;

    const goal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        title,
        description,
        targetAmount,
        currentAmount,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        category,
        status,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar meta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.goal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json(
      { error: "Erro ao deletar meta" },
      { status: 500 }
    );
  }
}
