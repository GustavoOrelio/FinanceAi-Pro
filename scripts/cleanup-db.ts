import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log("Iniciando limpeza do banco de dados...");

    // 1. Remover histórico de login antigo (mais de 30 dias)
    const oldLoginDate = subDays(new Date(), 30);
    const deletedLogins = await prisma.loginHistory.deleteMany({
      where: {
        createdAt: {
          lt: oldLoginDate,
        },
      },
    });
    console.log(`Removidos ${deletedLogins.count} registros antigos de login`);

    // 2. Remover tokens de reset de senha usados ou expirados
    const deletedTokens = await prisma.passwordReset.deleteMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });
    console.log(`Removidos ${deletedTokens.count} tokens de reset de senha`);

    // 3. Limpar metas concluídas antigas (mais de 90 dias)
    const oldGoalDate = subDays(new Date(), 90);
    const deletedGoals = await prisma.goal.deleteMany({
      where: {
        status: "completed",
        completedAt: {
          lt: oldGoalDate,
        },
      },
    });
    console.log(`Removidas ${deletedGoals.count} metas antigas concluídas`);

    // 4. Executar VACUUM FULL para recuperar espaço
    await prisma.$executeRaw`VACUUM FULL;`;
    console.log("VACUUM FULL executado com sucesso");

    console.log("Limpeza concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a limpeza:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
