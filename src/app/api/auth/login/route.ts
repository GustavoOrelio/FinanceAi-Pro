import { NextResponse } from "next/server";
import { validateUser, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

async function checkSuspiciousActivity(ipAddress: string): Promise<boolean> {
  // Verifica tentativas de login falhas nos últimos 10 minutos
  const failedAttempts = await prisma.loginHistory.count({
    where: {
      ipAddress,
      success: false,
      timestamp: {
        gte: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
      },
    },
  });

  return failedAttempts >= 5;
}

async function logLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  userId?: string
) {
  await prisma.loginHistory.create({
    data: {
      userId:
        userId ||
        (await prisma.user.findUnique({ where: { email } }))?.id ||
        "",
      ipAddress,
      userAgent,
      success,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const headersList = headers();

    // Captura IP e User-Agent
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica atividades suspeitas antes de tentar o login
    const isSuspicious = await checkSuspiciousActivity(ipAddress);
    if (isSuspicious) {
      console.log(
        `Atividade suspeita detectada do IP ${ipAddress}. Muitas tentativas de login falhas.`
      );
      return NextResponse.json(
        {
          error:
            "Muitas tentativas de login falhas. Tente novamente mais tarde.",
        },
        { status: 429 }
      );
    }

    try {
      const user = await validateUser(email, password);

      // Registra tentativa de login bem-sucedida
      await logLoginAttempt(email, ipAddress, userAgent, true, user.id);

      // Gera o token
      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
      });

      // Retorna o usuário (sem a senha) e o token
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } catch (error) {
      // Registra tentativa de login falha
      await logLoginAttempt(email, ipAddress, userAgent, false);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Email ou senha inválidos" },
      { status: 401 }
    );
  }
}
