import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(request: Request) {
  try {
    // Verifica se a requisição é JSON
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Requisição deve ser JSON" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, não informamos se o email existe ou não
    if (!user) {
      return NextResponse.json({
        message:
          "Se o email existir em nossa base, você receberá as instruções de recuperação.",
      });
    }

    // Gera um token aleatório
    const token = crypto.randomBytes(32).toString("hex");

    try {
      // Salva o token no banco
      await prisma.passwordReset.create({
        data: {
          email,
          token,
          expiresAt: new Date(Date.now() + 3600000), // 1 hora
        },
      });

      // Envia o email
      await sendPasswordResetEmail(email, token);

      return NextResponse.json({
        message:
          "Se o email existir em nossa base, você receberá as instruções de recuperação.",
      });
    } catch (error) {
      console.error("Erro ao processar recuperação de senha:", error);

      // Se for um erro do Prisma
      if (error instanceof PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: "Erro ao processar solicitação" },
          { status: 500 }
        );
      }

      // Se for erro do serviço de email
      return NextResponse.json(
        { error: "Erro ao enviar email de recuperação" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);

    // Se for erro ao fazer parse do JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
