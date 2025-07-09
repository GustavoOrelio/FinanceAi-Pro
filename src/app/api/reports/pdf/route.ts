import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReportData } from "@/hooks/useReports";
import { verifyToken } from "@/lib/auth";

// Configuração da rota
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cores do tema
const colors = {
  primary: "#0891b2", // cyan-600
  secondary: "#6b7280", // gray-500
  success: "#059669", // emerald-600
  danger: "#dc2626", // red-600
  warning: "#d97706", // amber-600
  background: "#ffffff",
  text: "#1f2937", // gray-800
  muted: "#9ca3af", // gray-400
  border: "#e5e7eb", // gray-200
};

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/reports/pdf: Iniciando geração de PDF");

    // Verifica o token de autenticação
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      console.log("POST /api/reports/pdf: Token não fornecido");
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    console.log("POST /api/reports/pdf: Verificando token");
    const user = verifyToken(token);
    if (!user) {
      console.log("POST /api/reports/pdf: Token inválido");
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    console.log("POST /api/reports/pdf: Token válido, usuário:", {
      id: user.id,
      email: user.email,
    });

    // Verifica se a requisição é válida
    if (!request.body) {
      console.log("POST /api/reports/pdf: Corpo da requisição vazio");
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.log("POST /api/reports/pdf: Processando dados da requisição");
    const { data, period } = await request.json();

    // Valida os dados necessários
    if (!data || !period) {
      console.log("POST /api/reports/pdf: Dados incompletos");
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    console.log("POST /api/reports/pdf: Iniciando criação do documento PDF");

    // Cria um buffer para armazenar o PDF
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
      layout: "portrait",
      info: {
        Title: "Relatório Financeiro",
        Author: "FinanceAI Pro",
        Subject: `Relatório de gastos dos últimos ${period} meses`,
        Keywords: "finanças, relatório, gastos",
        CreationDate: new Date(),
      },
    });

    // Pipe o PDF para um array de chunks
    doc.on("data", chunks.push.bind(chunks));

    console.log("POST /api/reports/pdf: Gerando conteúdo do PDF");

    // Cabeçalho
    doc.rect(0, 0, doc.page.width, 150).fill(colors.primary);

    doc
      .fontSize(32)
      .fillColor(colors.background)
      .text("Relatório Financeiro", 50, 50, {
        align: "left",
        baseline: "top",
      });

    doc.fontSize(16).text(`Período: Últimos ${period} meses`, 50, 90, {
      align: "left",
      baseline: "top",
    });

    doc.text(
      format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      50,
      110,
      {
        align: "left",
        baseline: "top",
      }
    );

    // Resumo Financeiro
    doc.fontSize(20).fillColor(colors.text).text("Resumo Financeiro", 50, 180, {
      align: "left",
      baseline: "top",
    });

    // Grid de métricas principais
    const metrics = [
      { label: "Total Gasto", value: `R$ ${data.totalGasto.toFixed(2)}` },
      {
        label: "Média Mensal",
        value: `R$ ${data.mediaGastoMensal.toFixed(2)}`,
      },
      {
        label: "Ticket Médio",
        value: `R$ ${data.metricasImportantes.ticketMedio.toFixed(2)}`,
      },
      {
        label: "Total de Compras",
        value: data.metricasImportantes.totalCompras.toString(),
      },
    ];

    const startY = 220;
    const colWidth = (doc.page.width - 100) / 2;
    const rowHeight = 80;

    metrics.forEach((metric, index) => {
      const x = 50 + (index % 2) * colWidth;
      const y = startY + Math.floor(index / 2) * rowHeight;

      doc
        .rect(x, y, colWidth - 10, 70)
        .fillColor(colors.background)
        .strokeColor(colors.border)
        .lineWidth(1)
        .fillAndStroke();

      doc
        .fontSize(14)
        .fillColor(colors.secondary)
        .text(metric.label, x + 15, y + 15, {
          align: "left",
          baseline: "top",
        });

      doc
        .fontSize(18)
        .fillColor(colors.text)
        .text(metric.value, x + 15, y + 35, {
          align: "left",
          baseline: "top",
        });
    });

    // Tendências
    doc.fontSize(20).text("Tendências", 50, 400, {
      align: "left",
      baseline: "top",
    });

    // Tabela de tendências
    const trendsTableData = data.tendencias
      .slice(0, 5)
      .map((trend: any) => [
        trend.category,
        `R$ ${trend.total.toFixed(2)}`,
        `${trend.variacao > 0 ? "+" : ""}${trend.variacao.toFixed(1)}%`,
        `${trend.percentual.toFixed(1)}%`,
      ]);

    await doc.table({
      headers: ["Categoria", "Total", "Variação", "% do Total"],
      rows: trendsTableData,
      x: 50,
      y: 440,
      width: doc.page.width - 100,
      divider: {
        header: { disabled: false, width: 1, opacity: 0.5 },
        horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
      },
      padding: 10,
      headerColor: colors.primary,
      headerOpacity: 1,
      headerTextColor: colors.background,
      rowTextColor: colors.text,
      alternateRowColor: colors.border,
      alternateRowOpacity: 0.1,
    });

    // Gastos por Dia
    doc.addPage();

    doc.fontSize(20).text("Análise por Dia da Semana", 50, 50, {
      align: "left",
      baseline: "top",
    });

    // Tabela de gastos por dia
    const daysTableData = data.diasMaisGastos.map((dia: any) => [
      dia.dayOfWeek,
      `R$ ${dia.total.toFixed(2)}`,
      dia.count.toString(),
      `R$ ${(dia.total / dia.count).toFixed(2)}`,
    ]);

    await doc.table({
      headers: ["Dia", "Total", "Compras", "Média"],
      rows: daysTableData,
      x: 50,
      y: 90,
      width: doc.page.width - 100,
      divider: {
        header: { disabled: false, width: 1, opacity: 0.5 },
        horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
      },
      padding: 10,
      headerColor: colors.primary,
      headerOpacity: 1,
      headerTextColor: colors.background,
      rowTextColor: colors.text,
      alternateRowColor: colors.border,
      alternateRowOpacity: 0.1,
    });

    // Lojas Mais Frequentes
    doc.fontSize(20).text("Lojas Mais Frequentes", 50, 300, {
      align: "left",
      baseline: "top",
    });

    // Tabela de lojas mais frequentes
    const storesTableData = data.lojasMaisFrequentes
      .slice(0, 5)
      .map((loja: any) => [
        loja.store,
        `R$ ${loja.total.toFixed(2)}`,
        loja.count.toString(),
        `R$ ${loja.average.toFixed(2)}`,
        format(loja.lastPurchase, "dd/MM/yyyy"),
      ]);

    await doc.table({
      headers: ["Loja", "Total", "Compras", "Média", "Última Compra"],
      rows: storesTableData,
      x: 50,
      y: 340,
      width: doc.page.width - 100,
      divider: {
        header: { disabled: false, width: 1, opacity: 0.5 },
        horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
      },
      padding: 10,
      headerColor: colors.primary,
      headerOpacity: 1,
      headerTextColor: colors.background,
      rowTextColor: colors.text,
      alternateRowColor: colors.border,
      alternateRowOpacity: 0.1,
    });

    // Alertas
    if (
      data.limiteMensalAtingido > 80 ||
      data.metricasImportantes.gastosPendentes > 0
    ) {
      doc.addPage();

      doc.fontSize(20).text("Alertas e Avisos", 50, 50, {
        align: "left",
        baseline: "top",
      });

      let currentY = 90;

      if (data.limiteMensalAtingido > 80) {
        doc
          .rect(50, currentY, doc.page.width - 100, 80)
          .fillColor(colors.danger)
          .fill();

        doc
          .fontSize(16)
          .fillColor(colors.background)
          .text("Limite Mensal", 70, currentY + 20, {
            align: "left",
            baseline: "top",
          });

        doc
          .fontSize(14)
          .text(
            `Você já utilizou ${data.limiteMensalAtingido.toFixed(1)}% do seu limite mensal!`,
            70,
            currentY + 45,
            {
              align: "left",
              baseline: "top",
            }
          );

        currentY += 100;
      }

      if (data.metricasImportantes.gastosPendentes > 0) {
        doc
          .rect(50, currentY, doc.page.width - 100, 80)
          .fillColor(colors.warning)
          .fill();

        doc
          .fontSize(16)
          .fillColor(colors.background)
          .text("Gastos Pendentes", 70, currentY + 20, {
            align: "left",
            baseline: "top",
          });

        doc
          .fontSize(14)
          .text(
            `Você tem R$ ${data.metricasImportantes.gastosPendentes.toFixed(2)} em gastos pendentes.`,
            70,
            currentY + 45,
            {
              align: "left",
              baseline: "top",
            }
          );
      }
    }

    // Rodapé em todas as páginas
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      const pageNumber = `Página ${i + 1} de ${totalPages}`;
      const bottomY = doc.page.height - 50;

      doc.fontSize(10).fillColor(colors.muted).text(pageNumber, 50, bottomY, {
        align: "left",
        baseline: "top",
      });

      doc
        .rect(50, bottomY - 10, doc.page.width - 100, 1)
        .fillColor(colors.border)
        .fill();
    }

    console.log("POST /api/reports/pdf: Finalizando documento PDF");

    // Finaliza o documento
    doc.end();

    // Aguarda todos os chunks serem gerados
    return new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        console.log("POST /api/reports/pdf: PDF gerado com sucesso");
        const pdfBuffer = Buffer.concat(chunks);

        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition":
                "attachment; filename=relatorio-gastos.pdf",
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("POST /api/reports/pdf: Erro ao gerar PDF:", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao gerar PDF" }), {
      status: 500,
    });
  }
}
