import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: {
        store: true,
        payments: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);
    return NextResponse.json(
      { error: "Erro ao buscar compra" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      storeId,
      amount,
      paidAmount,
      remainingAmount,
      date,
      category,
      description,
      status,
      installments,
      payments,
    } = body;

    const purchase = await prisma.purchase.update({
      where: { id: params.id },
      data: {
        storeId,
        amount,
        paidAmount,
        remainingAmount,
        date: date ? new Date(date) : undefined,
        category,
        description,
        status,
        installments,
        payments: payments
          ? {
              set: payments,
            }
          : undefined,
      },
      include: {
        store: true,
        payments: true,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar compra" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.purchase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar compra:", error);
    return NextResponse.json(
      { error: "Erro ao deletar compra" },
      { status: 500 }
    );
  }
}
