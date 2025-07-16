import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "firebase-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Inicializa o Firebase Admin se ainda não estiver inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function middleware(request: NextRequest) {
  // Ignora rotas que não são da API
  if (!request.url.includes("/api/")) {
    return NextResponse.next();
  }

  // Ignora rotas públicas
  const publicPaths = ["/api/auth"];
  if (publicPaths.some((path) => request.url.includes(path))) {
    return NextResponse.next();
  }

  try {
    // Verifica se tem o header de autorização
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verifica o token do Firebase
    const token = authHeader.split(" ")[1];
    await auth().verifyIdToken(token);

    // Se chegou aqui, o token é válido
    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
