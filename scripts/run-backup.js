const dotenv = require("dotenv");
const path = require("path");

// Configura o dotenv para carregar as variáveis de ambiente
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const BACKUP_SECRET = process.env.BACKUP_SECRET || "your-backup-secret";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function runBackup() {
  try {
    console.log("Iniciando backup do banco de dados...");
    console.log("URL da API:", `${API_URL}/api/backup/create`);

    // Usando import dinâmico para node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/backup/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BACKUP_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Resposta da API:", data);

    if (!response.ok) {
      throw new Error(
        `Erro na API: ${data.error || "Erro desconhecido"} (Status: ${response.status})`
      );
    }

    console.log("Backup concluído com sucesso!");
    console.log("Arquivo:", data.file);
    console.log("Tamanho:", data.size);
  } catch (error) {
    console.error("Erro detalhado ao executar backup:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      name: error.name,
    });
    process.exit(1);
  }
}

// Executa o backup
runBackup();
