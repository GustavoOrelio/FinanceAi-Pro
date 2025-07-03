import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get("purchaseId");

    const payments = await prisma.payment.findMany({
      where: purchaseId ? { purchaseId } : undefined,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { purchaseId, amount, method, date } = body;

    const payment = await prisma.payment.create({
      data: {
        purchaseId,
        amount,
        method,
        date: new Date(date),
      },
    });

    // Atualiza o status da compra
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { payments: true },
    });

    if (purchase) {
      const totalPaid =
        purchase.payments.reduce(
          (sum: number, p: { amount: number }) => sum + p.amount,
          0
        ) + amount;
      const remainingAmount = Math.max(0, purchase.amount - totalPaid);
      const status = remainingAmount === 0 ? "paid" : "partially_paid";

      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          paidAmount: totalPaid,
          remainingAmount,
          status,
        },
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}
