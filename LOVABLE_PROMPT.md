# Lovable AI - BidRush Frontend Generation Prompt

**Role & Personality:**
You are an elite Web3 Frontend Engineer and UI/UX Designer specializing in dark-mode, high-performance dApps. Your style is sleek, cyber-punk adjacent, minimalist yet highly aesthetic. You use glassmorphism, subtle neon glows, and strict grid alignments. You are building "BidRush", a decentralized freelance platform on the Monad blockchain.

**Overall Aesthetic & Vibe:**
- **Theme:** Deep Dark Mode. Backgrounds should be near-black (`#0A0A0A`, `#111111`) with slightly lighter panels (`#1A1A1A`) for contrast.
- **Accents:** Neon Purple (`#A855F7`, `#9333EA`) and vibrant Green for success states (`#22C55E`, `#10B981`).
- **Typography:** Modern, clean sans-serif for UI elements (e.g., Inter, SF Pro). Use elegant serif styling with italics specifically for large headers and the "BidRush" logo to give a premium, slightly editorial contrast (e.g., "Esculpir o Futuro").
- **Components:** Rounded corners (`rounded-xl`, `rounded-2xl`), subtle borders (`border-white/5` or `border-white/10`), glassmorphism effects (`backdrop-blur-md`, `bg-black/50`).
- **Layout:** Sidebar navigation on the left, main content area taking up the rest of the screen.

**Technical Stack Instructions:**
- Use **React** + **Tailwind CSS**.
- Include standard icons from `lucide-react`.
- **Do not** implement real web3 logic or API calls yet. Focus entirely on pixel-perfect UI, hardcoded mocked data matching the screenshots, and smooth responsive layouts.
- Use a mock state to toggle between views (Dashboard, Trabalhos, etc).

**Global Elements:**
1. **Sidebar (Left):**
   - Logo at top: Lightning bolt icon + "BidRush" (bold) + "DECENTRALIZED HUB" (small tracked-out letters).
   - Navigation links: Dashboard, Trabalhos, Mensagens, Central de Alertas, Configurações. Active state should have a subtle background highlight.
   - Bottom area: "Novo Projeto" button (solid purple gradient) and User Profile snippet showing avatar and address.
2. **Top Navigation/Header:**
   - Search bar with magnifying glass.
   - Network status pill: "Mainnet" with pulsing green dot.
   - Wallet address pill: "0x1a...3b4c".
   - Notification bell icon.
3. **Footer:**
   - Implement the exact Footer component provided in the reference code (dark blur, purple top border gradient, network status markers, etc).

---

### Page Details (Generate these 4 views)

**View 1: Dashboard / Setup do Projeto ("Esculpir o Futuro")**
- **Header:** "Esculpir o Futuro" in italic serif purple font. Subtext: "Defina os parâmetros neurais e contratuais da sua próxima grande iniciativa descentralizada."
- **Left Panel (AI Oracle):** A chat interface. Dark grey bubbles for AI (with lightning bolt avatar), purple bubbles for user. It should look like an ongoing conversation defining the project scope. Input field at the bottom with an up-arrow button.
- **Right Panel (Parâmetros do Contrato):**
  - **Budget:** Large text "15,500 USDC" with an underline and a thin progress bar below it.
  - **Prazo Final:** Date picker input box reading "24 DEZ, 2024".
  - **Reputation Score:** Three pill buttons (Bronze, Silver, Gold). Silver is selected.
  - **Bottom Buttons:** A secondary button "POSTAR JOB PADRÃO" and a primary glowing gradient button "INICIAR LEILÃO FLASH" with a lightning bolt.

**View 2: Visão do Job Finalizado / Entregue ("Desenvolvimento Interface dApp Staking")**
- **Header:** Title of the job. Pill badge "SMART CONTRACT ACTIVE".
- **Left Column:**
  - **Freelancer Card:** Avatar, name "Alex Rivera", title, rating, and a "Chat Freelancer" button.
  - **Escopo e Entrega:** Checklist of 3 items (2 checked green, 1 unchecked).
  - **Área de Trabalho:** A drag-and-drop file upload zone. Below it, a completed upload item "final-delivery-v1.zip" with a green checkmark.
- **Right Column (Custódia/Escrow):**
  - Lock icon. Title "ESCROW EM CUSTÓDIA".
  - Large value: "2450.00 USDT".
  - **Status Timeline:** Vertical stepping list (Contrato Criado, Fundos Depositados, Aguardando Revisão).
  - **Buttons:** Huge green button "Aprovar e Liberar Pagamento". Below it, a dark button "Abrir Disputa".
- **Bottom Row:** Three info cards: Iniciado em, Prazo Final, Tempo Decorrido, Segurança.

**View 3: Central de Inteligência / Alertas Flash (Matchmaking Algorítmico)**
- **Header:** "Central de Inteligência" (italic serif).
- **Left Column (Sugestões da IA):**
  - List of job cards. Example: "Smart Contract Audit" (4,500 USDC), "DeFi UI Design" (2,800 USDC).
  - Each card shows tags (Rust, Security, Solana), a match percentage (e.g., "98% Match de Perfil"), and a "Ver Detalhes" button.
- **Right Column (Alertas Flash & Status):**
  - Active Flash Auction card with highly visible countdown timer ("01:45"). Current bid ("1,250 USDC") with a green progress bar relative to max budget. Bright green "Entrar no Leilão" button.
  - Ecosystem Summary card below it showing network stats (Gas Médio, Projetos Ativos).

**View 4: View de Disputa Ativa ("Visão do Contratante" vs "Prova do Freelancer")**
- **Top Red Bar:** Warning banner "DISPUTA ATIVA: CONTRATO #BR-9902-X", showing Time Remaining and Arbitration Reward.
- **Side-by-Side Layout:**
  - **Left (Client):** Text block complaining about the delivery. Attached screenshot and video logs. Value in custody display.
  - **Right (Freelancer):** Text block defending the work based on TDD. Technical evidence links (GitHub Repo, IPFS Deploy Hash).
- **Bottom Arbitration Panel:** 
  - Text: "PAINEL DE VEREDITO ON-CHAIN".
  - Two large voting buttons: "Votar a favor do Cliente" (Dark Red tint) and "Votar a favor do Freelancer" (Dark Green tint).
  - Est. gas fee display next to them.

**Instructions for the AI Generator:**
Please output the full React code necessary to power this frontend visualization. Structure it cleanly into reusable components (Sidebar, TopNav, ChatPanel, EscrowCard, etc). Ensure Tailwind classes exactly match the dark, neon-accented cyber-aesthetic described and shown in the prompt. Do not leave out the provided Footer component.
