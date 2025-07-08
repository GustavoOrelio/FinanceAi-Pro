# FinanceAI Pro

Um assistente financeiro pessoal inteligente que ajuda você a gerenciar suas finanças de forma eficiente.

## Funcionalidades

### Gestão Financeira

- Controle de gastos e receitas
- Categorização de transações
- Definição de limites mensais
- Acompanhamento de metas financeiras
- Análise de gastos por categoria
- Gestão de lojas e estabelecimentos

### Inteligência Artificial

- **Assistente AI Avançado**

  - Análise financeira personalizada
  - Recomendações baseadas no contexto
  - Educação financeira
  - Planejamento financeiro
  - Suporte via chat com linguagem natural
  - Reconhecimento de voz para comandos

- **Insights e Previsões**
  - Previsão de gastos futuros por categoria
  - Análise de padrões de consumo
  - Recomendações personalizadas
  - Identificação de tendências
  - Alertas inteligentes
  - Sugestões de otimização

### Ferramentas

- Scanner de preços com OCR
- Rastreador de humor financeiro
- Sistema de notificações
- Backup automático
- Modo offline
- Suporte a PWA

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Prisma
- PostgreSQL
- TailwindCSS
- Google Gemini AI
- OpenAI Whisper

## Configuração

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/financeai-pro.git
cd financeai-pro
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="sua-chave-api"
OPENAI_API_KEY="sua-chave-api"
JWT_SECRET="seu-segredo"
```

4. Execute as migrações do banco de dados

```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

## Contribuição

Contribuições são bem-vindas! Por favor, leia o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.
