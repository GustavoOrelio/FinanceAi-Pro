import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Busca o token de reset
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // Verifica se o token já foi usado
    if (resetToken.used) {
      return NextResponse.json(
        { error: "Token já utilizado" },
        { status: 400 }
      );
    }

    // Verifica se o token expirou
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expirado" }, { status: 400 });
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(password);

    // Atualiza a senha do usuário
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Marca o token como usado
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Senha atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
