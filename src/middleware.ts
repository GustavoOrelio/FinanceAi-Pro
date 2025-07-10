import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ignora rotas que não são da API
  if (!request.url.includes("/api/")) {
    return NextResponse.next();
  }

  // Ignora rotas de autenticação e registro
  if (
    request.url.includes("/api/auth/") ||
    (request.url.includes("/api/users") && request.method === "POST")
  ) {
    return NextResponse.next();
  }

  // Verifica se tem o header de autorização
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Extrai o token e adiciona o header com o token para verificação posterior
    const token = authHeader.split(" ")[1];
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-auth-token", token);

    // Retorna a requisição modificada
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Erro ao processar token:", error);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
