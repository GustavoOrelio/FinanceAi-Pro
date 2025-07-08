import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken, generateToken } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Inicializa o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Prompt base para o assistente
const BASE_PROMPT = `Você é um assistente financeiro pessoal chamado FinanceAI.
Você deve ajudar os usuários a gerenciar suas finanças, fornecendo análises, dicas e recomendações personalizadas.
Você deve ser amigável, profissional e sempre considerar o contexto financeiro do usuário ao responder.
Você deve se comunicar em português do Brasil.

Suas principais responsabilidades são:
1. Analisar gastos e orçamentos
2. Fornecer dicas de economia
3. Ajudar com planejamento financeiro
4. Acompanhar metas financeiras
5. Dar recomendações de investimentos`;

export async function POST(req: NextRequest) {
  try {
    // Verifica o token de autenticação
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Gera um novo token para renovar a sessão
    const newToken = generateToken(user);

    // Obtém os dados da requisição
    const { message, context, history } = await req.json();

    // Prepara o prompt com o contexto financeiro
    let prompt = `${BASE_PROMPT}\n\nContexto financeiro do usuário:\n`;

    if (context.monthlySpending) {
      prompt += `- Gastos do mês: R$ ${context.monthlySpending}\n`;
    }

    if (context.monthlyLimit) {
      prompt += `- Limite mensal: R$ ${context.monthlyLimit}\n`;
    }

    if (context.goals?.length > 0) {
      prompt += `\nMetas:\n`;
      context.goals.forEach((goal: any) => {
        prompt += `- ${goal.title}: ${goal.progress}% concluído\n`;
      });
    }

    if (context.recentTransactions?.length > 0) {
      prompt += `\nTransações recentes:\n`;
      context.recentTransactions.forEach((transaction: any) => {
        prompt += `- ${transaction.description}: R$ ${transaction.amount} (${transaction.date})\n`;
      });
    }

    // Adiciona o histórico da conversa
    if (history?.length > 0) {
      prompt += `\nHistórico da conversa:\n`;
      history.forEach((msg: any) => {
        prompt += `${msg.role === "user" ? "Usuário" : "Assistente"}: ${
          msg.content
        }\n`;
      });
    }

    // Adiciona a mensagem atual
    prompt += `\nUsuário: ${message}\n\nAssistente:`;

    // Chama o modelo Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Cria a resposta com o novo token no header
    const jsonResponse = NextResponse.json({
      response: response.text(),
      user,
    });
    jsonResponse.headers.set("x-new-token", newToken);

    return jsonResponse;
  } catch (error: any) {
    console.error("Erro no chat:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.status || 500 }
    );
  }
}
