import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken, generateToken } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Inicializa o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Função auxiliar para limpar e validar JSON
function cleanAndParseJSON(text: string): any {
  try {
    // Remove caracteres que podem interferir na detecção do JSON
    text = text.replace(/```json/g, "").replace(/```/g, "");

    // Tenta encontrar o JSON mais externo
    let jsonText = "";
    let bracketCount = 0;
    let inString = false;
    let start = -1;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Controla strings para não confundir com chaves/colchetes dentro de strings
      if (char === '"' && text[i - 1] !== "\\") {
        inString = !inString;
      }

      if (!inString) {
        if (char === "{" || char === "[") {
          if (bracketCount === 0) start = i;
          bracketCount++;
        } else if (char === "}" || char === "]") {
          bracketCount--;
          if (bracketCount === 0 && start !== -1) {
            jsonText = text.slice(start, i + 1);
            break;
          }
        }
      }
    }

    if (!jsonText) {
      throw new Error("JSON não encontrado na resposta");
    }

    // Tenta fazer o parse do JSON encontrado
    const parsed = JSON.parse(jsonText);

    // Valida a estrutura do JSON baseado no tipo
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        // Garante que todos os campos necessários existem
        if (item.category) {
          return {
            category: String(item.category),
            predictedAmount: Number(item.predictedAmount) || 0,
            confidence: Number(item.confidence) || 0,
            explanation: String(item.explanation || ""),
            pattern: String(item.pattern || ""),
            insight: String(item.insight || ""),
            suggestion: String(item.suggestion || ""),
          };
        }
        if (item.type) {
          return {
            type: String(item.type),
            title: String(item.title || ""),
            description: String(item.description || ""),
            potentialImpact: String(item.potentialImpact || ""),
            priority: String(item.priority || "medium"),
          };
        }
        return item;
      });
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao processar JSON:", error, "\nTexto original:", text);
    throw new Error("Falha ao processar resposta do modelo");
  }
}

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
    const { type, data } = await req.json();

    let result;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    switch (type) {
      case "predictions":
        const predictionsPrompt = `Você é um assistente especializado em análise financeira.
        Analise os seguintes dados históricos de compras do usuário ${
          user.id
        } e faça previsões de gastos para o próximo mês.
        Use APENAS os dados fornecidos para este usuário específico:
        ${JSON.stringify(data.purchasesByCategory, null, 2)}
        
        Gere um array JSON com previsões para cada categoria. Siga EXATAMENTE este formato, sem adicionar texto antes ou depois:
        [
          {
            "category": "nome da categoria",
            "predictedAmount": número do valor previsto,
            "confidence": número entre 0 e 1,
            "explanation": "explicação da previsão"
          }
        ]`;

        const predictionsResult = await model.generateContent(
          predictionsPrompt
        );
        result = cleanAndParseJSON(predictionsResult.response.text());
        break;

      case "recommendations":
        const recommendationsPrompt = `Você é um assistente especializado em finanças pessoais.
        Analise os seguintes dados financeiros do usuário ${user.id}.
        Use APENAS os dados fornecidos para este usuário específico:
        - Total gasto: ${data.totalSpent}
        - Limite mensal: ${data.monthlyLimit}
        - Progresso das metas: ${JSON.stringify(data.goalProgress, null, 2)}
        
        Gere um array JSON com 3-5 recomendações. Siga EXATAMENTE este formato, sem adicionar texto antes ou depois:
        [
          {
            "type": "saving",
            "title": "título da recomendação",
            "description": "descrição detalhada",
            "potentialImpact": "descrição do impacto",
            "priority": "high"
          }
        ]
        
        Use apenas estes valores para o campo "type": "saving", "investment", "budget", "general"
        Use apenas estes valores para o campo "priority": "high", "medium", "low"`;

        const recommendationsResult = await model.generateContent(
          recommendationsPrompt
        );
        result = cleanAndParseJSON(recommendationsResult.response.text());
        break;

      case "patterns":
        const patternsPrompt = `Você é um assistente especializado em análise de padrões financeiros.
        Analise os seguintes padrões de compra do usuário ${user.id}.
        Use APENAS os dados fornecidos para este usuário específico:
        ${JSON.stringify(data.purchasesByCategory, null, 2)}
        
        Gere um array JSON com análises para cada categoria. Siga EXATAMENTE este formato, sem adicionar texto antes ou depois:
        [
          {
            "category": "nome da categoria",
            "pattern": "descrição do padrão identificado",
            "insight": "insight relevante",
            "suggestion": "sugestão de melhoria"
          }
        ]`;

        const patternsResult = await model.generateContent(patternsPrompt);
        result = cleanAndParseJSON(patternsResult.response.text());
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de análise inválido" },
          { status: 400 }
        );
    }

    // Cria a resposta com o novo token no header
    const jsonResponse = NextResponse.json({ result });
    jsonResponse.headers.set("x-new-token", newToken);

    return jsonResponse;
  } catch (error: any) {
    console.error("Erro na análise:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.status || 500 }
    );
  }
}
