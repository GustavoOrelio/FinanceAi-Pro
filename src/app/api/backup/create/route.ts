import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import path from "path";
import { headers } from "next/headers";
import { mkdir } from "fs/promises";

const execAsync = promisify(exec);

const BACKUP_SECRET = process.env.BACKUP_SECRET || "your-backup-secret";
const BACKUP_DIR = path.join(process.cwd(), "backups");

// Função para extrair credenciais do DATABASE_URL
function getDatabaseCredentials() {
  const url = new URL(process.env.DATABASE_URL || "");
  const endpointId = url.hostname.split(".")[0]; // Extrai o ID do endpoint do hostname

  return {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.substring(1),
    endpointId,
  };
}

// Função para validar o token de backup
async function validateBackupToken(request: Request): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  return token === BACKUP_SECRET;
}

export async function POST(request: Request) {
  try {
    // Verifica autorização
    if (!(await validateBackupToken(request))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Cria diretório de backup se não existir
    try {
      await mkdir(BACKUP_DIR, { recursive: true });
    } catch (error) {
      console.error("Erro ao criar diretório de backup:", error);
      throw new Error("Não foi possível criar o diretório de backup");
    }

    // Gera nome do arquivo de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    const compressedBackupPath = `${backupPath}.gz`;

    // Extrai credenciais do banco
    const { user, password, host, port, database, endpointId } =
      getDatabaseCredentials();

    console.log("Iniciando backup do banco de dados...");
    console.log("Diretório de backup:", BACKUP_DIR);
    console.log("Credenciais:", { user, host, port, database, endpointId }); // não logamos a senha por segurança

    // Executa pg_dump e comprime o resultado
    const pgDumpCommand = `/usr/lib/postgresql/17/bin/pg_dump "postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require&options=endpoint%3D${endpointId}" | gzip > "${compressedBackupPath}"`;
    console.log(
      "Comando pg_dump (sem senha):",
      pgDumpCommand.replace(new RegExp(password, "g"), "****")
    );

    try {
      const { stderr, stdout } = await execAsync(pgDumpCommand);
      console.log("Saída do comando:", stdout);

      if (stderr) {
        console.error("Erro no pg_dump:", stderr);
        throw new Error(`Erro ao executar pg_dump: ${stderr}`);
      }

      // Verifica se o arquivo foi criado
      const { stdout: fileSize } = await execAsync(
        `ls -lh "${compressedBackupPath}" | awk '{print $5}'`
      );

      return NextResponse.json({
        success: true,
        message: "Backup criado com sucesso",
        file: backupFileName + ".gz",
        size: fileSize.trim(),
      });
    } catch (error: any) {
      console.error("Erro detalhado ao criar backup:", {
        message: error.message,
        code: error.code,
        cmd: error.cmd?.replace(new RegExp(password, "g"), "****"),
        stderr: error.stderr,
        stdout: error.stdout,
      });
      throw error;
    }
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar backup do banco de dados",
      },
      { status: 500 }
    );
  }
}
