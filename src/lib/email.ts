import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY não configurada");
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL não configurada");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "FinanceAI Pro <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperação de Senha - FinanceAI Pro",
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha no FinanceAI Pro.</p>
        <p>Para criar uma nova senha, clique no link abaixo:</p>
        <p><a href="${resetUrl}">Redefinir Senha</a></p>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe FinanceAI Pro</p>
      `,
    });

    if (error) {
      console.error("Erro do Resend:", error);
      throw new Error(
        error.message || "Erro ao enviar email de recuperação de senha"
      );
    }

    return data;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Erro ao enviar email de recuperação de senha");
  }
}
