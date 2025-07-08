import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Nenhum arquivo de áudio fornecido" },
        { status: 400 }
      );
    }

    // Converte o arquivo para um Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Envia o áudio para a API do OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm", { type: "audio/webm" }),
      model: "whisper-1",
      language: "pt",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Erro na transcrição:", error);
    return NextResponse.json(
      { error: "Erro ao processar o áudio" },
      { status: 500 }
    );
  }
}
