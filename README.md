# ChatManeiro

> Aplicação de teste para brincar com chat em tempo real usando .NET 8 + SignalR no back-end e React + Vite + Tailwind no front-end.

## Sobre o projeto
- Chat em tempo real com suporte a mensagens, indicador de digitação e contagem de usuários online.
- Histórico de até 50 mensagens servido pela API para quem chega depois.
- Front-end single page app (SPA) com página de login simples para escolher o nickname.

## Arquitetura
- server/ – ASP.NET Core minimal API com SignalR e endpoint REST de histórico (/api/history).
- web/ – SPA React + Vite + TypeScript + Tailwind que conversa com o hub /hubs/chat.

## Pré-requisitos
- [.NET SDK 8](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) e npm

## Como rodar local
### 1. Back-end
`ash
dotnet restore server
dotnet build server
dotnet watch --project server
`
O servidor sobe em http://localhost:5185 (SignalR em http://localhost:5185/hubs/chat).

### 2. Front-end
`ash
npm install --prefix web
npm run dev --prefix web
`
A SPA ficará disponível em http://localhost:5173.

### 3. Tudo junto com um único comando
Depois de instalar as dependências uma vez (
pm install na raiz – script incluso), basta rodar:
`ash
npm run dev
`
Isso inicia o dotnet watch e o Vite em paralelo.

## Como testar
- Abra duas janelas ou abas, faça login com apelidos diferentes e troque mensagens.
- Observe o texto "Fulano está digitando..." quando alguém começa a digitar.
- Use o botão de limpar para zerar o histórico local (a API mantém apenas as 50 mais recentes).

Bom proveito explorando este app de teste.
