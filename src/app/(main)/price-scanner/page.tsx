'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function PriceScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [price, setPrice] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast.error('Erro ao acessar câmera', {
        description: 'Verifique se você concedeu permissão para usar a câmera.',
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const capturePrice = () => {
    // Aqui você implementaria a lógica real de OCR
    // Por enquanto, vamos simular um preço detectado
    const simulatedPrice = (Math.random() * 100).toFixed(2);
    setPrice(simulatedPrice);
    stopScanner();

    toast.success('Preço detectado', {
      description: `R$ ${simulatedPrice}`,
    });
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Scanner de Preços</h1>
        <p className="text-muted-foreground">
          Escaneie preços de produtos usando a câmera do seu dispositivo
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Câmera</CardTitle>
            <CardDescription>
              Posicione o preço no centro da imagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isScanning ? (
                <>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={capturePrice}
                  >
                    Capturar Preço
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopScanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={startScanner}
                >
                  Iniciar Scanner
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preço Detectado</CardTitle>
            <CardDescription>
              Você também pode inserir o preço manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-2xl"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPrice('')}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="w-full"
              disabled={!price}
              onClick={() => {
                toast.success('Preço salvo', {
                  description: `R$ ${price}`,
                });
              }}
            >
              Salvar Preço
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 