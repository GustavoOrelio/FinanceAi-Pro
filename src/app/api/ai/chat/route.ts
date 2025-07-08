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

1. Análise Financeira
- Analisar gastos e orçamentos
- Identificar tendências e padrões
- Calcular métricas financeiras importantes
- Avaliar a saúde financeira geral

2. Planejamento e Metas
- Ajudar a estabelecer metas financeiras realistas
- Criar planos de economia
- Sugerir estratégias para atingir objetivos
- Monitorar o progresso das metas

3. Educação Financeira
- Explicar conceitos financeiros
- Fornecer dicas de educação financeira
- Recomendar recursos educacionais
- Esclarecer dúvidas sobre finanças

4. Otimização de Gastos
- Identificar áreas de economia
- Sugerir cortes de gastos
- Recomendar alternativas mais econômicas
- Alertar sobre gastos excessivos

5. Investimentos
- Explicar diferentes tipos de investimentos
- Discutir estratégias de investimento
- Avaliar perfil de risco
- Sugerir diversificação de portfólio

6. Gestão de Dívidas
- Analisar situação de dívidas
- Sugerir estratégias de pagamento
- Calcular juros e amortizações
- Recomendar consolidação de dívidas

7. Planejamento de Longo Prazo
- Auxiliar no planejamento de aposentadoria
- Sugerir reservas de emergência
- Planejar grandes compras
- Considerar inflação e custos futuros

8. Recomendações Personalizadas
- Adaptar sugestões ao perfil do usuário
- Considerar objetivos individuais
- Respeitar limites e restrições
- Priorizar necessidades específicas

Diretrizes de Comunicação:
1. Seja claro e objetivo
2. Use linguagem acessível
3. Forneça exemplos práticos
4. Explique os motivos das recomendações
5. Seja empático e compreensivo
6. Evite julgamentos
7. Mantenha o foco nas soluções
8. Incentive bons hábitos financeiros

Ao analisar o contexto financeiro do usuário, considere:
- Gastos mensais e limites
- Histórico de transações
- Progresso das metas
- Padrões de consumo
- Situação financeira geral
- Objetivos de curto e longo prazo

Lembre-se: Seu objetivo é ajudar o usuário a tomar melhores decisões financeiras e alcançar seus objetivos.`;

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
      prompt += `- Gastos do mês: R$ ${context.monthlySpending.toFixed(2)}\n`;
    }

    if (context.monthlyLimit) {
      prompt += `- Limite mensal: R$ ${context.monthlyLimit.toFixed(2)}\n`;

      // Adiciona análise do limite
      if (context.monthlySpending && context.monthlyLimit) {
        const percentageUsed =
          (context.monthlySpending / context.monthlyLimit) * 100;
        prompt += `- Utilização do limite: ${percentageUsed.toFixed(1)}%\n`;

        if (percentageUsed > 90) {
          prompt += `⚠️ Alerta: Gastos próximos do limite mensal\n`;
        } else if (percentageUsed > 100) {
          prompt += `⚠️ Alerta: Limite mensal excedido\n`;
        }
      }
    }

    if (context.goals?.length > 0) {
      prompt += `\nMetas:\n`;
      context.goals.forEach((goal: any) => {
        prompt += `- ${goal.title}: ${goal.progress.toFixed(1)}% concluído\n`;

        // Adiciona análise da meta
        if (goal.progress < 25) {
          prompt += `  📊 Progresso inicial - Foco em estabelecer hábitos\n`;
        } else if (goal.progress < 75) {
          prompt += `  📈 Progresso consistente - Manter o ritmo\n`;
        } else {
          prompt += `  🎯 Meta próxima de ser alcançada\n`;
        }
      });
    }

    if (context.recentTransactions?.length > 0) {
      prompt += `\nTransações recentes:\n`;

      // Agrupa transações por categoria
      const transactionsByCategory = context.recentTransactions.reduce(
        (acc: any, t: any) => {
          if (!acc[t.category]) {
            acc[t.category] = { total: 0, count: 0 };
          }
          acc[t.category].total += t.amount;
          acc[t.category].count++;
          return acc;
        },
        {}
      );

      // Adiciona análise por categoria
      Object.entries(transactionsByCategory).forEach(
        ([category, data]: [string, any]) => {
          const average = data.total / data.count;
          prompt += `- ${category}: R$ ${data.total.toFixed(2)} (${
            data.count
          } transações, média R$ ${average.toFixed(2)})\n`;
        }
      );
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
