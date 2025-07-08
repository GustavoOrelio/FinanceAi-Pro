"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseVoiceRecognitionProps {
  onTranscriptChange?: (transcript: string) => void;
}

export function useVoiceRecognition({
  onTranscriptChange,
}: UseVoiceRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Verifica suporte inicial
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const supported = !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        );
        setIsSupported(supported);

        if (!supported) {
          console.error("API de mídia não suportada");
          setError("Reconhecimento de voz não suportado neste navegador");
          toast.error(
            "Reconhecimento de voz não suportado neste navegador. Por favor, use um navegador moderno."
          );
        }
      } catch (err) {
        console.error("Erro ao verificar suporte:", err);
        setIsSupported(false);
        setError("Erro ao verificar suporte do navegador");
      }
    };

    checkSupport();
  }, []);

  const startListening = useCallback(async () => {
    console.log("Tentando iniciar gravação...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Cria o MediaRecorder
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Configura os handlers
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstart = () => {
        console.log("Gravação iniciada");
        setIsListening(true);
        setError(null);
        toast.success("Gravação iniciada");
      };

      mediaRecorder.current.onstop = async () => {
        console.log("Gravação finalizada");
        setIsListening(false);

        // Cria um blob com todos os chunks de áudio
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });

        try {
          // Envia o áudio para transcrição
          const formData = new FormData();
          formData.append("audio", audioBlob);

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Erro na transcrição");
          }

          const { text } = await response.json();
          console.log("Texto transcrito:", text);
          setTranscript(text);
          onTranscriptChange?.(text);
        } catch (error) {
          console.error("Erro na transcrição:", error);
          toast.error("Erro ao processar o áudio. Por favor, tente novamente.");
        }

        // Limpa os recursos
        stream.getTracks().forEach((track) => track.stop());
        audioChunks.current = [];
      };

      // Inicia a gravação
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      setError("Erro ao acessar o microfone");
      toast.error(
        "Por favor, permita o acesso ao microfone para usar o reconhecimento de voz."
      );
    }
  }, [onTranscriptChange]);

  const stopListening = useCallback(() => {
    console.log("Parando gravação...");
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    console.log("Toggle gravação, estado atual:", isListening);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    console.log("Resetando transcript");
    setTranscript("");
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
        if (mediaRecorder.current.stream) {
          mediaRecorder.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    error,
    isSupported,
  };
}
