# 🏥 Medical App - Documentação Completa do Front-end

Bem-vindo à documentação oficial de ponta a ponta do nosso sistema de gestão médica! Este documento foi criado para detalhar **tudo** o que construímos no Front-end: desde a tecnologia escolhida até o fluxo exato de como as informações saem da tela e chegam no Backend (e vice-versa).

---

## 🚀 1. Tecnologias e Arsenal Utilizado
Nós escolhemos um ecossistema moderno, rápido e seguro. Cada peça tem um papel fundamental:

- **React.js:** A biblioteca principal. Usamos React para criar interfaces dinâmicas baseadas em componentes (como botões, formulários e layouts).
- **TypeScript:** Adicionamos "superpoderes" ao JavaScript. O TypeScript nos obriga a tipar os dados (ex: `Patient`, `Doctor`), o que evita que o código quebre por dados incorretos e ajuda a nossa IDE a dar autocompletar inteligente.
- **Vite:** É o nosso "motor de construção". Diferente do antigo Create React App, o Vite compila o projeto em milissegundos e atualiza a tela na hora durante o desenvolvimento (HMR).
- **Axios:** O nosso "carteiro". É a biblioteca responsável por pegar os dados da tela e transportar via rede (HTTP) para a API do Java, além de trazer as respostas de volta.
- **React Router DOM:** O nosso "GPS". Ele gerencia a troca de páginas (ex: sair da `/login` e ir para o `/app`) sem precisar recarregar o site inteiro (Single Page Application).
- **Lucide React:** Nossa biblioteca de ícones. Leve e moderna, usada para dar vida visual à interface.
- **Google Gemini AI:** Inteligência Artificial integrada diretamente no navegador do paciente para resumir laudos médicos com linguagem humana e tranquilizadora.

---

## 📁 2. Arquitetura e Estrutura de Pastas
O projeto foi organizado para ser escalável. Se o projeto crescer para 100 telas amanhã, ele não vai virar uma bagunça.

- `/src/pages`: Onde vivem as telas inteiras. Temos pastas isoladas para `/Auth` (Login/Registro), `/Dashboard`, `/Doctor` (Agenda do médico), e `/Patient` (Consultas e Laudos).
- `/src/services`: O "Cérebro de Comunicação". Aqui ficam os arquivos que falam com o Backend (ex: `DoctorService.ts`). Nenhuma tela faz requisição direta, elas sempre chamam os "Services", mantendo a organização.
- `/src/layouts`: Estruturas visuais que se repetem. O `DashboardLayout.tsx`, por exemplo, contém a barra lateral (Sidebar) e o cabeçalho.
- `/src/mocks`: Dados falsos que usamos no início do desenvolvimento para moldar as telas antes do Backend estar pronto.

---

## 🔐 3. Fluxo de Segurança, Autenticação e JWT
Nós blindamos o Front-end para garantir que apenas usuários autorizados vejam dados sensíveis.

### Criação de Conta (Register)
1. O usuário digita os dados.
2. **Validação Regex Local:** Antes de incomodar o Backend, o nosso Front-end verifica se a senha tem 8 caracteres, letras maiúsculas e símbolos. Se for fraca, barra na hora.
3. Se passar, o Axios envia o `POST` para o Java.

### Login e Interceptadores (O Coração da Segurança)
1. O usuário faz Login na tela `Login.tsx`.
2. O Backend valida e nos devolve um **Token JWT** e a **Role** (Patient ou Doctor).
3. Nós salvamos esse Token no "cofre" do navegador: o `localStorage`.
4. **O Interceptador (em `api.ts`):** Nós configuramos um "guarda-costas" no Axios. A partir do momento do login, **toda** requisição que sai do Front-end (ex: buscar laudos, agendar consultas) passa por esse guarda, que anexa silenciosamente o Token JWT no cabeçalho (`Authorization: Bearer <token>`).
5. Se o Token expirar e o Java devolver um Erro 401, o nosso Interceptador detecta, limpa o cofre e expulsa o usuário de volta para a tela de Login automaticamente.

---

## 📡 4. Comunicação com a API (De Ponta a Ponta)
Como os dados trafegam da tela até a nuvem:

### Variáveis de Ambiente (.env)
Temos o arquivo `.env.production`. Ele serve para ensinar ao código onde a API mora.
- Quando desenvolvemos localmente: bate no `http://localhost:8080`.
- Quando mandamos pra Vercel: o Vite lê o arquivo de produção e aponta todos os mísseis para o Render (`https://sales-backend-java.onrender.com/api`).

### Lidando com CORS e a "Ponte"
Quando o Front-end (Vercel) tenta falar com o Backend (Render), o navegador Chrome faz uma pergunta de segurança pro Java chamada de **Preflight (OPTIONS)**: *"Java, você aceita receber dados da Vercel?"*.
Graças ao alinhamento que fizemos com a equipe de Backend, o Java responde com `allowedOriginPatterns("*")`, abrindo as portas do CORS e permitindo que o nosso Axios transporte o JSON (com os dados do formulário) em segurança.

---

## 🧠 5. Inteligência Artificial: Resumo de Laudos
Na tela `PatientMyReports.tsx`, nós quebramos a barreira da medicina tradicional usando a IA do Google Gemini.

**Como funciona a mágica:**
1. Quando o paciente clica no botão "Resumir Laudo", nós pegamos o texto frio, cheio de jargões técnicos médicos, e injetamos dentro de um **Prompt Engenheirado**.
2. O Prompt diz para a IA: *"Aja como um médico empático. Explique esse laudo para um leigo de forma simples. Se houver algo grave, oriente a buscar o médico sem desespero."*
3. O Front-end bate na API do Gemini usando a nossa `GEMINI_API_KEY` injetada e devolve o texto humanizado na tela do usuário instantaneamente.

---

## 🎭 6. Role-Based Access Control (Controle por Perfil)
O nosso sistema é inteligente o suficiente para saber quem está acessando e mudar de forma:

- **Dashboard.tsx:** A mesma tela se molda de formas diferentes. Se o `userRole` for `doctor`, ele renderiza estatísticas médicas e atalhos para gerenciar agenda. Se for `patient`, ele exibe histórico e botão para novas marcações.
- **Sidebars Dinâmicas:** Os botões do menu lateral mudam. Médicos veem "Meu Consultório", pacientes veem "Meus Laudos".

---

## ☁️ 7. Deploy, Vercel e o "Efeito Cold Start"
O nosso código final está imortalizado no GitHub e conectado à **Vercel** (nossa provedora de nuvem Front-end).

- **CI/CD Automático:** Cada vez que aprovamos um Pull Request e jogamos para a branch `main`, a Vercel intercepta o código, roda o "Vite Build", empacota tudo e joga no ar globalmente em menos de 2 minutos.
- **O Efeito Cold Start (A Pegadinha do Render):** Documentamos que o plano gratuito do Render "dorme" após 15 minutos. Se o usuário abrir o sistema após muito tempo, a primeira tentativa de login causará um "Network Error", pois o Java demora 50s para ligar. Solução documentada: esperar 1 minuto e tentar novamente, sem necessidade de mexer na Vercel!

---

## 🏁 Conclusão
O nosso Front-end deixou de ser apenas um "conjunto de telinhas" para se tornar uma aplicação robusta, com arquitetura em camadas (Services), segurança por Interceptadores (JWT), integração com APIs externas (Gemini) e gestão de CI/CD via Vercel. 

Temos um código nível Sênior, pronto para escalar e atender milhares de usuários! 🚀
