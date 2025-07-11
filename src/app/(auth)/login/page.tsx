'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { authService } from '@/services/api';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { loadInitialData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  // Formulário de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Formulário de cadastro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Formulário de recuperação de senha
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(loginData.email, loginData.password);
      await login(response.user, response.token);
      await loadInitialData();
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });
      await login(response.user, response.token);
      await loadInitialData();
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(resetEmail);
      toast.success('Email de recuperação enviado com sucesso');
      setResetPasswordOpen(false);
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast.error('Erro ao solicitar recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <h1>FinanceAI Pro</h1>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Controle suas finanças com inteligência artificial"
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Entre com sua conta para continuar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0">
                          Esqueceu sua senha?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleForgotPassword}>
                          <DialogHeader>
                            <DialogTitle>Recuperar senha</DialogTitle>
                            <DialogDescription>
                              Digite seu email para receber instruções de recuperação
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="mt-2"
                              placeholder="seu@email.com"
                              required
                            />
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Enviando...' : 'Enviar'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle>Criar conta</CardTitle>
                    <CardDescription>
                      Crie sua conta para começar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar conta'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 