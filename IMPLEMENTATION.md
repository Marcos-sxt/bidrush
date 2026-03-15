# 🟣 MonadWork — Guia Completo de Implementação

> Documento técnico detalhado para implementação total do MonadWork — marketplace freelance descentralizado na Monad blockchain.

---

## Índice

1. [Contexto Técnico da Monad](#1-contexto-técnico-da-monad)
2. [Arquitetura Geral do Projeto](#2-arquitetura-geral-do-projeto)
3. [Smart Contracts — Design Detalhado](#3-smart-contracts--design-detalhado)
4. [Frontend — Design Detalhado](#4-frontend--design-detalhado)
5. [Integração Frontend ↔ Contratos](#5-integração-frontend--contratos)
6. [Deploy e Verificação](#6-deploy-e-verificação)
7. [Referências](#7-referências)

---

## 1. Contexto Técnico da Monad

### 1.1 O que é a Monad?

A Monad é uma blockchain Layer-1 **compatível com EVM** (Ethereum Virtual Machine) que implementa **execução paralela de transações**. Isso significa que:

- Contratos escritos em **Solidity** funcionam sem modificação
- Ferramentas como **Foundry**, **Hardhat**, **Wagmi**, **Viem** funcionam nativamente
- Carteiras como **MetaMask** e **Phantom** se conectam configurando apenas RPC + Chain ID

### 1.2 Números da Monad vs Ethereum

| Atributo | Ethereum | Monad |
|---|---|---|
| **TPS (transações/seg)** | ~10 | ~10,000 |
| **Frequência de blocos** | 12 segundos | 400ms |
| **Finalidade** | 12-18 minutos | 800ms |
| **Bytecode** | EVM (Pectra) | EVM (Pectra) — idêntico |
| **Max contract size** | 24.5 KB | 128 KB |
| **Consenso** | Gasper (PoS) | MonadBFT (PoS) |
| **Mempool** | Global | Local (líderes) |

### 1.3 Diferenças Cruciais para o Nosso Projeto

#### Gas é cobrado pelo gas LIMIT, não pelo gas usado

Na Monad, o total debitado do sender é `value + gas_price * gas_limit` (não `gas_used`). Isso é uma medida anti-DoS para a execução assíncrona. **Implicação**: devemos definir gas limits apertados nos contratos para não desperdiçar MON dos usuários.

#### Execução Paralela

A Monad executa transações em paralelo usando múltiplos executores. Os resultados são commitados na ordem original. Isso é **transparente para o desenvolvedor** — o resultado é idêntico a execução serial. Mas é exatamente isso que torna nosso **Flash Auction com centenas de lances simultâneos** viável: todos processados no mesmo bloco de 400ms.

#### Reserve Balance

A Monad tem um sistema de [Reserve Balance](https://docs.monad.xyz/developer-essentials/reserve-balance) que garante que transações incluídas no consenso podem ser pagas. EOAs delegados com EIP-7702 não podem ter o saldo abaixo de 10 MON.

#### Sem Mempool Global

A Monad usa mempool local. RPCs encaminham transações para os próximos 3 líderes. Isso significa que nossos eventos on-chain (alertas de leilão) são a melhor forma de notificar a rede — não dependemos de mempool sniffing.

### 1.4 Network Information

#### Mainnet
| Propriedade | Valor |
|---|---|
| **Chain ID** | `143` |
| **Currency** | `MON` |
| **RPC** | `https://rpc.monad.xyz` |
| **WebSocket** | `wss://rpc.monad.xyz` |
| **Block Explorer** | `https://monadvision.com` |
| **Multicall3** | `0xcA11bde05977b3631167028862bE2a173976CA11` |

#### Testnet
| Propriedade | Valor |
|---|---|
| **Chain ID** | `10143` |
| **Currency** | `MON` |
| **RPC** | `https://testnet-rpc.monad.xyz` |
| **WebSocket** | `wss://testnet-rpc.monad.xyz` |
| **Block Explorer** | `https://testnet.monadvision.com` |
| **Faucet** | `https://faucet.monad.xyz` |
| **Multicall3** | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### 1.5 Por que a Monad é perfeita para o MonadWork?

1. **Flash Auctions de 2 minutos** geram centenas de transações de lance. A execução paralela processa tudo em um bloco.
2. **Finalidade de 800ms** permite que o cliente veja o resultado do leilão quase instantaneamente.
3. **Gas baixíssimo** torna micro-interações (lances, votos de tribunal, updates de score) economicamente viáveis.
4. **EVM nativo** significa que temos acesso a todo o ecossistema de ferramentas Solidity/Foundry.
5. **Blocos a cada 400ms** permitem o cronômetro de 2 minutos funcionar com granularidade fina.

---

## 2. Arquitetura Geral do Projeto

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Auth    │ │  Auction │ │  Bidding │ │  Dash    │ │  Work    │ │
│  │  Page    │ │  Creator │ │  Terminal│ │  Board   │ │  space   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │            │       │
│  ┌────▼─────────────▼────────────▼─────────────▼────────────▼────┐ │
│  │              Wagmi + Viem (Wallet + RPC Layer)                 │ │
│  └────────────────────────────┬──────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                      JSON-RPC / WebSocket
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                        MONAD BLOCKCHAIN                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    MonadWorkPlatform.sol                        │  │
│  │  (contrato monolítico com toda a lógica do hackathon)          │  │
│  │                                                                │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │
│  │  │  Profiles   │ │   Auctions  │ │   Escrow    │              │  │
│  │  │  + Scores   │ │   + Bids    │ │   + Dispute │              │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                    ⚡ Parallel Execution Engine ⚡                    │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Decisão: Contrato Monolítico (Hackathon)

Para o hackathon, **tudo vai em um contrato só**: `MonadWorkPlatform.sol`. Justificativa:
- Deploy único, endereço único
- Sem complexidade de inter-contract calls
- Mais rápido de implementar e testar
- Storage compartilhado sem proxies

Em produção, isso seria dividido em contratos separados com interfaces padronizadas.

### 2.3 Decisão: Tudo On-Chain

Para o hackathon, **todos os dados ficam no storage do contrato**:
- Perfis de usuários (scores, roles)
- Leilões (parâmetros, status, lances)
- Jobs (entrega, status, disputa)
- Votos do tribunal

Isso é caro em blockchains tradicionais mas viável na Monad pelo gas baixo e para demonstrar o conceito "fully on-chain".

---

## 3. Smart Contracts — Design Detalhado

### 3.1 Estruturas de Dados (Structs)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MonadWorkPlatform {

    // ============================
    // STRUCTS
    // ============================

    struct UserProfile {
        uint256 qualityScore;       // 0–100, começa em 50 para novos
        uint256 completedJobs;      // numero de jobs completed
        uint256 totalEarned;        // total MON recebido
        uint256 totalSpent;         // total MON gasto (como cliente)
        uint256 disputesWon;        // disputes ganhas
        uint256 disputesLost;       // disputes perdidas
        uint256 registeredAt;       // timestamp de registro
        bool exists;                // se o perfil existe
    }

    struct Auction {
        address client;             // quem criou o leilão
        string description;        // descricao do trabalho (on-chain p/ hackathon)
        uint256 maxBudget;          // valor máximo em MON (wei)
        uint256 minScore;           // score mínimo exigido (0-100)
        uint256 startTime;          // timestamp de início
        uint256 endTime;            // timestamp de fim (startTime + 120s)
        uint256 escrowAmount;       // valor travado no escrow
        AuctionStatus status;       // enum do estado
        uint256 bidCount;           // quantos bids foram feitos
        address selectedFreelancer; // freelancer escolhido
    }

    struct Bid {
        address freelancer;         // quem fez o lance
        uint256 amount;             // valor pedido em MON (wei)
        uint256 deliveryTime;       // tempo estimado em horas
        uint256 freelancerScore;    // score no momento do lance (snapshot)
        uint256 timestamp;          // quando o lance foi feito
    }

    struct Job {
        uint256 auctionId;          // qual leilão gerou este job
        address client;             // cliente
        address freelancer;         // freelancer selecionado
        uint256 agreedAmount;       // valor acordado
        string deliveryProof;       // link/hash da entrega (on-chain p/ hackathon)
        JobStatus status;           // enum do estado
        uint256 startedAt;          // quando o job começou
        uint256 deliveredAt;        // quando o freelancer entregou
    }

    struct Dispute {
        uint256 jobId;              // qual job está em disputa
        address[] auditors;         // auditores selecionados
        uint256 votesForClient;     // votos a favor do cliente
        uint256 votesForFreelancer; // votos a favor do freelancer
        mapping(address => bool) hasVoted;  // quem já votou
        uint256 totalVotesNeeded;   // quorum necessário
        bool resolved;              // se já foi resolvido
    }

    // ============================
    // ENUMS
    // ============================

    enum AuctionStatus {
        Active,         // aceitando bids
        Closed,         // tempo acabou, aguardando seleção
        Selected,       // freelancer selecionado, job em andamento
        Cancelled       // cancelado pelo cliente
    }

    enum JobStatus {
        InProgress,     // freelancer trabalhando
        Delivered,      // freelancer entregou
        Approved,       // cliente aprovou, pagamento liberado
        Disputed,       // em disputa
        Resolved        // disputa resolvida
    }
}
```

### 3.2 Storage (State Variables)

```solidity
    // ============================
    // STATE VARIABLES
    // ============================

    // Perfis — mapeados por endereço
    mapping(address => UserProfile) public profiles;
    address[] public registeredUsers; // lista de todos os usuários

    // Leilões
    uint256 public auctionCounter;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) public auctionBids; // auctionId => bids

    // Jobs
    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;

    // Disputas
    uint256 public disputeCounter;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobToDispute; // jobId => disputeId

    // Configurações
    uint256 public constant AUCTION_DURATION = 120; // 2 minutos em segundos
    uint256 public constant INITIAL_SCORE = 50;     // score inicial
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant SCORE_BOOST_PER_JOB = 5;   // +5 por job completo
    uint256 public constant SCORE_PENALTY_DISPUTE = 15; // -15 por dispute perdida
    uint256 public constant AUDITOR_COUNT = 3;          // auditores por disputa
    uint256 public constant MIN_AUDITOR_SCORE = 70;     // score mínimo para auditar
```

### 3.3 Events (Eventos On-Chain)

Eventos são **cruciais** no MonadWork. Eles são o mecanismo pelo qual o frontend descobre o que está acontecendo na rede. Na Monad, com blocos a cada 400ms, isso é quase real-time.

```solidity
    // ============================
    // EVENTS
    // ============================

    // Autenticação e Perfil
    event UserRegistered(address indexed user, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    // Leilão Flash
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed client,
        string description,
        uint256 maxBudget,
        uint256 minScore,
        uint256 endTime
    );
    event AuctionClosed(uint256 indexed auctionId, uint256 totalBids);

    // Lances
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed freelancer,
        uint256 amount,
        uint256 deliveryTime,
        uint256 freelancerScore
    );
    event BidRejected(
        uint256 indexed auctionId,
        address indexed freelancer,
        string reason
    );

    // Job
    event FreelancerSelected(
        uint256 indexed auctionId,
        address indexed freelancer,
        uint256 agreedAmount
    );
    event DeliverySubmitted(uint256 indexed jobId, string proof);
    event JobApproved(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    // Disputa
    event DisputeOpened(uint256 indexed jobId, uint256 indexed disputeId);
    event AuditorAssigned(uint256 indexed disputeId, address indexed auditor);
    event VoteCast(
        uint256 indexed disputeId,
        address indexed auditor,
        bool inFavorOfClient
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        bool clientWon,
        uint256 amount
    );
```

### 3.4 Funções Core

#### 3.4.1 Registro de Perfil

```solidity
    /// @notice Registra ou retorna o perfil do usuário.
    ///         Chamada automaticamente na primeira interação.
    function registerUser() external {
        if (!profiles[msg.sender].exists) {
            profiles[msg.sender] = UserProfile({
                qualityScore: INITIAL_SCORE,
                completedJobs: 0,
                totalEarned: 0,
                totalSpent: 0,
                disputesWon: 0,
                disputesLost: 0,
                registeredAt: block.timestamp,
                exists: true
            });
            registeredUsers.push(msg.sender);
            emit UserRegistered(msg.sender, block.timestamp);
        }
    }
```

#### 3.4.2 Criar Leilão Flash (Cliente)

```solidity
    /// @notice Cliente cria um leilão flash travando MON no contrato
    /// @param _description Descrição do trabalho
    /// @param _minScore Score mínimo exigido do freelancer
    function createAuction(
        string calldata _description,
        uint256 _minScore
    ) external payable {
        require(profiles[msg.sender].exists, "Register first");
        require(msg.value > 0, "Must lock funds");
        require(_minScore <= MAX_SCORE, "Invalid min score");

        uint256 auctionId = auctionCounter++;

        auctions[auctionId] = Auction({
            client: msg.sender,
            description: _description,
            maxBudget: msg.value,
            minScore: _minScore,
            startTime: block.timestamp,
            endTime: block.timestamp + AUCTION_DURATION,
            escrowAmount: msg.value,
            status: AuctionStatus.Active,
            bidCount: 0,
            selectedFreelancer: address(0)
        });

        profiles[msg.sender].totalSpent += msg.value;

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _description,
            msg.value,
            _minScore,
            block.timestamp + AUCTION_DURATION
        );
    }
```

#### 3.4.3 Enviar Lance (Freelancer)

```solidity
    /// @notice Freelancer envia lance para um leilão ativo
    /// @param _auctionId ID do leilão
    /// @param _amount Valor pedido em MON (wei)
    /// @param _deliveryTime Tempo estimado em horas
    function placeBid(
        uint256 _auctionId,
        uint256 _amount,
        uint256 _deliveryTime
    ) external {
        Auction storage auction = auctions[_auctionId];

        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp <= auction.endTime, "Auction ended");
        require(msg.sender != auction.client, "Client cannot bid");
        require(profiles[msg.sender].exists, "Register first");
        require(_amount <= auction.maxBudget, "Bid exceeds max budget");

        // VERIFICAÇÃO CHAVE: Score mínimo
        // Se o score for abaixo, a tx REVERTE — poupando tempo de todos
        uint256 freelancerScore = profiles[msg.sender].qualityScore;
        if (freelancerScore < auction.minScore) {
            emit BidRejected(_auctionId, msg.sender, "Score too low");
            revert("Score below minimum");
        }

        auctionBids[_auctionId].push(Bid({
            freelancer: msg.sender,
            amount: _amount,
            deliveryTime: _deliveryTime,
            freelancerScore: freelancerScore,
            timestamp: block.timestamp
        }));

        auction.bidCount++;

        emit BidPlaced(
            _auctionId,
            msg.sender,
            _amount,
            _deliveryTime,
            freelancerScore
        );
    }
```

> **Nota sobre Monad**: Na Monad, centenas de chamadas `placeBid` no mesmo período de 2 minutos serão processadas **em paralelo** dentro do mesmo bloco (ou poucos blocos). Cada bid é independente — não há conflito de estado entre bids de freelancers diferentes no mesmo leilão (elas leem o mesmo score mas escrevem em slots diferentes do array). A execução paralela da Monad é perfeitamente adequada aqui.

#### 3.4.4 Fechar Leilão e Selecionar Freelancer (Cliente)

```solidity
    /// @notice Fecha o leilão (qualquer um pode chamar após o tempo)
    function closeAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(auction.status == AuctionStatus.Active, "Not active");
        require(block.timestamp > auction.endTime, "Auction still active");

        auction.status = AuctionStatus.Closed;
        emit AuctionClosed(_auctionId, auction.bidCount);
    }

    /// @notice Cliente seleciona o freelancer vencedor
    /// @param _auctionId ID do leilão
    /// @param _bidIndex Índice do bid escolhido
    function selectFreelancer(
        uint256 _auctionId,
        uint256 _bidIndex
    ) external {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender == auction.client, "Only client");
        require(
            auction.status == AuctionStatus.Closed,
            "Auction not closed"
        );
        require(_bidIndex < auctionBids[_auctionId].length, "Invalid bid");

        Bid storage winningBid = auctionBids[_auctionId][_bidIndex];
        auction.selectedFreelancer = winningBid.freelancer;
        auction.status = AuctionStatus.Selected;

        // Criar Job
        uint256 jobId = jobCounter++;
        jobs[jobId] = Job({
            auctionId: _auctionId,
            client: auction.client,
            freelancer: winningBid.freelancer,
            agreedAmount: winningBid.amount,
            deliveryProof: "",
            status: JobStatus.InProgress,
            startedAt: block.timestamp,
            deliveredAt: 0
        });

        emit FreelancerSelected(
            _auctionId,
            winningBid.freelancer,
            winningBid.amount
        );
    }
```

#### 3.4.5 Entregar Trabalho (Freelancer)

```solidity
    /// @notice Freelancer submete a prova de entrega
    function submitDelivery(
        uint256 _jobId,
        string calldata _proof
    ) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.freelancer, "Only freelancer");
        require(job.status == JobStatus.InProgress, "Job not in progress");

        job.deliveryProof = _proof;
        job.status = JobStatus.Delivered;
        job.deliveredAt = block.timestamp;

        emit DeliverySubmitted(_jobId, _proof);
    }
```

#### 3.4.6 Aprovar e Pagar (Cliente)

```solidity
    /// @notice Cliente aprova a entrega e libera o pagamento
    function approveAndPay(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client");
        require(job.status == JobStatus.Delivered, "Not delivered");

        job.status = JobStatus.Approved;

        // Transferir fundos para o freelancer
        uint256 payment = job.agreedAmount;
        (bool sent, ) = payable(job.freelancer).call{value: payment}("");
        require(sent, "Transfer failed");

        // Devolver excedente ao cliente (se bid < maxBudget)
        Auction storage auction = auctions[job.auctionId];
        uint256 refund = auction.escrowAmount - payment;
        if (refund > 0) {
            (bool refundSent, ) = payable(job.client).call{value: refund}("");
            require(refundSent, "Refund failed");
        }

        // Atualizar scores
        _boostScore(job.freelancer);
        profiles[job.freelancer].completedJobs++;
        profiles[job.freelancer].totalEarned += payment;

        emit JobApproved(_jobId, job.freelancer, payment);
    }
```

#### 3.4.7 Sistema de Score

```solidity
    /// @dev Aumenta o score de um usuário
    function _boostScore(address _user) internal {
        uint256 oldScore = profiles[_user].qualityScore;
        uint256 newScore = oldScore + SCORE_BOOST_PER_JOB;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        profiles[_user].qualityScore = newScore;
        emit ScoreUpdated(_user, oldScore, newScore);
    }

    /// @dev Penaliza o score de um usuário
    function _penalizeScore(address _user) internal {
        uint256 oldScore = profiles[_user].qualityScore;
        uint256 newScore;
        if (oldScore <= SCORE_PENALTY_DISPUTE) {
            newScore = 0;
        } else {
            newScore = oldScore - SCORE_PENALTY_DISPUTE;
        }
        profiles[_user].qualityScore = newScore;
        emit ScoreUpdated(_user, oldScore, newScore);
    }
```

#### 3.4.8 Sistema de Disputa (Tribunal Descentralizado)

```solidity
    /// @notice Abre uma disputa sobre um job entregue
    function openDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Not involved"
        );
        require(
            job.status == JobStatus.Delivered ||
            job.status == JobStatus.InProgress,
            "Cannot dispute"
        );

        job.status = JobStatus.Disputed;

        uint256 disputeId = disputeCounter++;
        Dispute storage dispute = disputes[disputeId];
        dispute.jobId = _jobId;
        dispute.totalVotesNeeded = AUDITOR_COUNT;
        dispute.resolved = false;

        jobToDispute[_jobId] = disputeId;

        // Selecionar auditores (simplificado para hackathon)
        // Em produção: usar VRF (Chainlink/Pyth) para aleatoriedade
        _selectAuditors(disputeId);

        emit DisputeOpened(_jobId, disputeId);
    }

    /// @dev Seleciona auditores com score alto (simplificado)
    function _selectAuditors(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        Job storage job = jobs[dispute.jobId];
        uint256 selected = 0;

        for (
            uint256 i = 0;
            i < registeredUsers.length && selected < AUDITOR_COUNT;
            i++
        ) {
            address candidate = registeredUsers[i];
            // Não pode ser parte no job
            if (candidate == job.client || candidate == job.freelancer)
                continue;
            // Precisa ter score alto
            if (profiles[candidate].qualityScore < MIN_AUDITOR_SCORE)
                continue;

            dispute.auditors.push(candidate);
            selected++;
            emit AuditorAssigned(_disputeId, candidate);
        }
    }

    /// @notice Auditor vota na disputa
    function castVote(
        uint256 _disputeId,
        bool _inFavorOfClient
    ) external {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Already resolved");
        require(!dispute.hasVoted[msg.sender], "Already voted");

        // Verificar se é auditor designado
        bool isAuditor = false;
        for (uint256 i = 0; i < dispute.auditors.length; i++) {
            if (dispute.auditors[i] == msg.sender) {
                isAuditor = true;
                break;
            }
        }
        require(isAuditor, "Not an auditor");

        dispute.hasVoted[msg.sender] = true;

        if (_inFavorOfClient) {
            dispute.votesForClient++;
        } else {
            dispute.votesForFreelancer++;
        }

        emit VoteCast(_disputeId, msg.sender, _inFavorOfClient);

        // Verificar se atingiu maioria
        uint256 majority = (dispute.totalVotesNeeded / 2) + 1;
        if (dispute.votesForClient >= majority) {
            _resolveDispute(_disputeId, true);
        } else if (dispute.votesForFreelancer >= majority) {
            _resolveDispute(_disputeId, false);
        }
    }

    /// @dev Resolve a disputa e distribui fundos
    function _resolveDispute(
        uint256 _disputeId,
        bool _clientWon
    ) internal {
        Dispute storage dispute = disputes[_disputeId];
        dispute.resolved = true;

        Job storage job = jobs[dispute.jobId];
        job.status = JobStatus.Resolved;

        Auction storage auction = auctions[job.auctionId];
        uint256 amount = auction.escrowAmount;

        if (_clientWon) {
            // Devolver fundos ao cliente
            (bool sent, ) = payable(job.client).call{value: amount}("");
            require(sent, "Transfer failed");
            // Penalizar freelancer
            _penalizeScore(job.freelancer);
            profiles[job.freelancer].disputesLost++;
            profiles[job.client].disputesWon++;
        } else {
            // Pagar freelancer
            (bool sent, ) = payable(job.freelancer).call{value: amount}("");
            require(sent, "Transfer failed");
            // Penalizar cliente
            _penalizeScore(job.client);
            profiles[job.client].disputesLost++;
            profiles[job.freelancer].disputesWon++;
            profiles[job.freelancer].completedJobs++;
            profiles[job.freelancer].totalEarned += amount;
        }

        emit DisputeResolved(_disputeId, _clientWon, amount);
    }
```

### 3.5 View Functions (Leitura)

```solidity
    // ============================
    // VIEW FUNCTIONS
    // ============================

    /// @notice Retorna o perfil de um usuário
    function getProfile(
        address _user
    ) external view returns (UserProfile memory) {
        return profiles[_user];
    }

    /// @notice Retorna todos os bids de um leilão
    function getAuctionBids(
        uint256 _auctionId
    ) external view returns (Bid[] memory) {
        return auctionBids[_auctionId];
    }

    /// @notice Retorna os Top 3 bids (menor preço × maior score)
    /// @dev A "IA" do frontend pode usar isso ou calcular client-side
    function getTopBids(
        uint256 _auctionId
    ) external view returns (Bid[3] memory topBids) {
        Bid[] storage bids = auctionBids[_auctionId];
        if (bids.length == 0) return topBids;

        // Score composto: score × 1000 / amount (maior = melhor)
        // Simplificado: ordenar por compositeScore descrescente
        uint256[3] memory topScores;
        uint256[3] memory topIndices;

        for (uint256 i = 0; i < bids.length; i++) {
            uint256 compositeScore = (bids[i].freelancerScore * 1e18) /
                bids[i].amount;

            for (uint256 j = 0; j < 3; j++) {
                if (compositeScore > topScores[j]) {
                    // Shift down
                    for (uint256 k = 2; k > j; k--) {
                        topScores[k] = topScores[k - 1];
                        topIndices[k] = topIndices[k - 1];
                    }
                    topScores[j] = compositeScore;
                    topIndices[j] = i;
                    break;
                }
            }
        }

        for (uint256 i = 0; i < 3 && i < bids.length; i++) {
            topBids[i] = bids[topIndices[i]];
        }
    }

    /// @notice Retorna o número total de usuários registrados
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }

    /// @notice Retorna os auditores de uma disputa
    function getDisputeAuditors(
        uint256 _disputeId
    ) external view returns (address[] memory) {
        return disputes[_disputeId].auditors;
    }

    /// @notice Verifica se um leilão já pode ser fechado
    function isAuctionExpired(
        uint256 _auctionId
    ) external view returns (bool) {
        return block.timestamp > auctions[_auctionId].endTime;
    }

    /// @notice Retorna os leilões ativos (simplificado — loop limitado)
    function getActiveAuctions(
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](_limit);
        uint256 count = 0;
        for (
            uint256 i = _offset;
            i < auctionCounter && count < _limit;
            i++
        ) {
            if (auctions[i].status == AuctionStatus.Active) {
                temp[count] = i;
                count++;
            }
        }
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }
```

### 3.6 Relação com a Execução Paralela da Monad

É importante entender **onde** a execução paralela ajuda:

| Operação | Parallelizável? | Por quê |
|---|---|---|
| Múltiplos `placeBid` no mesmo leilão | ✅ Sim | Cada bid escreve em um novo índice do array. Leituras do auction state e score são de slots estáveis. A Monad detecta que não há conflitos e executa em paralelo. |
| Múltiplos `createAuction` simultâneos | ✅ Sim | Cada auction usa um counter diferente e escreve em slots separados. |
| Múltiplos `castVote` na mesma disputa | ⚠️ Parcial | Os votos escrevem no mesmo slot (`votesForClient`/`votesForFreelancer`). A Monad tentará executar em paralelo, mas detectando conflito, re-executará serialmente. Ainda assim, mais rápido que Ethereum. |
| `approveAndPay` (transferência) | ⚠️ Parcial | Transferências de MON alteram saldos — potencial conflito. Mas cada job tem um par único client/freelancer. |

---

## 4. Frontend — Design Detalhado

### 4.1 Tech Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | React + Vite | Rápido de setup, hot reload, moderno |
| Wallet | Wagmi v2 + Viem | Padrão para dApps EVM, suporte nativo a read/write contracts |
| Estilização | CSS puro (dark mode, glassmorphism) | Máximo controle visual |
| AI (mock) | Client-side scoring algorithm | Para hackathon, a "IA" é um algoritmo de ranking |

### 4.2 Configuração Wagmi/Viem para a Monad

```typescript
// config/wagmi.ts
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

// Definir a chain da Monad (Testnet para hackathon)
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
      webSocket: ['wss://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://testnet.monadvision.com',
    },
  },
  testnet: true,
});

// Para Mainnet (quando for pra produção):
export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
      webSocket: ['wss://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://monadvision.com',
    },
  },
});

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});
```

### 4.3 Interação com o Contrato

```typescript
// hooks/useMonadWork.ts
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MONADWORK_ABI, MONADWORK_ADDRESS } from '../config/contract';

// Ler perfil do usuário
export function useProfile(address: string) {
  return useReadContract({
    address: MONADWORK_ADDRESS,
    abi: MONADWORK_ABI,
    functionName: 'getProfile',
    args: [address],
  });
}

// Criar leilão
export function useCreateAuction() {
  const { writeContract, isPending, data } = useWriteContract();

  const createAuction = (description: string, minScore: number, budgetInMon: string) => {
    writeContract({
      address: MONADWORK_ADDRESS,
      abi: MONADWORK_ABI,
      functionName: 'createAuction',
      args: [description, BigInt(minScore)],
      value: parseEther(budgetInMon),
    });
  };

  return { createAuction, isPending, data };
}

// Fazer lance
export function usePlaceBid() {
  const { writeContract, isPending } = useWriteContract();

  const placeBid = (auctionId: number, amountInMon: string, deliveryTimeHours: number) => {
    writeContract({
      address: MONADWORK_ADDRESS,
      abi: MONADWORK_ABI,
      functionName: 'placeBid',
      args: [BigInt(auctionId), parseEther(amountInMon), BigInt(deliveryTimeHours)],
    });
  };

  return { placeBid, isPending };
}

// Escutar novos leilões em real-time via WebSocket
export function useWatchNewAuctions(onAuction: (data: any) => void) {
  useWatchContractEvent({
    address: MONADWORK_ADDRESS,
    abi: MONADWORK_ABI,
    eventName: 'AuctionCreated',
    onLogs: (logs) => {
      logs.forEach(log => onAuction(log.args));
    },
  });
}

// Escutar novos bids
export function useWatchNewBids(auctionId: number, onBid: (data: any) => void) {
  useWatchContractEvent({
    address: MONADWORK_ADDRESS,
    abi: MONADWORK_ABI,
    eventName: 'BidPlaced',
    args: { auctionId: BigInt(auctionId) },
    onLogs: (logs) => {
      logs.forEach(log => onBid(log.args));
    },
  });
}
```

### 4.4 Páginas e Componentes

#### Página 1 — Autenticação Web3

```
ConnectPage
├── ConnectWalletButton (wagmi useConnect)
├── WalletInfo
│   ├── AddressDisplay (0x...abcd)
│   ├── QualityScoreGauge (barra circular 0-100)
│   └── ProfileStats (jobs, earned, disputes)
├── RoleSelector
│   ├── ClientButton → redirect /client
│   └── FreelancerButton → redirect /freelancer
└── OnboardingFlow (se primeira vez)
```

**Lógica**:
1. `useConnect()` do wagmi conecta a carteira
2. `useAccount()` pega o endereço
3. `useProfile(address)` lê o perfil on-chain
4. Se `!profile.exists` → chama `registerUser()` automaticamente
5. Exibe score e stats
6. Usuário clica em "Enter as Client" ou "Enter as Freelancer"

#### Página 2 — Cardápio de Serviços (Cliente)

```
ClientAuctionPage
├── AIChatInterface
│   ├── MessageList
│   ├── UserInput (textarea)
│   └── AISuggestions (parâmetros sugeridos)
├── AuctionConfigPanel
│   ├── MaxBudgetSlider (MON)
│   ├── MinScoreSlider (0-100)
│   └── ParametersSummary
├── TriggerAuctionButton (🔴 vermelho, pulsa)
├── ConfirmModal
│   ├── Summary (valor, score, duração)
│   └── WalletConfirmation
└── ActiveAuctionsList (leilões anteriores do cliente)
```

**Lógica da "IA"** (para hackathon, client-side):
- O texto do usuário é parseado com regex/keywords simples
- Sugere budget baseado em keywords: "smart contract" → 1-5 MON, "frontend" → 0.5-2 MON
- Sugere score mínimo: "critical" → 80, "simple" → 50

#### Página 3 — Terminal de Lances (Freelancer)

```
FreelancerTerminal
├── AuctionAlertBanner (piscando, vermelho)
│   ├── AuctionScope (descrição inline)
│   ├── CountdownTimer (2:00 → 0:00)
│   └── ClientInfo (endereço + score)
├── BidForm
│   ├── AmountInput (MON, max = maxBudget)
│   ├── DeliveryTimeInput (horas)
│   └── SubmitBidButton
├── LiveBidFeed
│   ├── BidCard[] (endereço, valor, delivery time — real-time)
│   └── TotalBidsCounter
└── PastAuctionsList
```

**Lógica real-time**:
- WebSocket subscription via `useWatchNewAuctions` ouve `AuctionCreated`
- Quando um novo leilão chega, o banner pisca
- `useWatchNewBids` mostra bids entrando em real-time
- `CountdownTimer` compara `auction.endTime` com `Date.now()` local
- Ao submiter, se o score for baixo, a tx reverte e o frontend mostra erro

#### Página 4 — Dashboard de Resolução (Cliente)

```
ResolutionDashboard
├── AuctionResultHeader
│   ├── TimerCompleteIndicator (🟢 Auction Closed)
│   └── TotalBidsReceived
├── TopBidsList
│   ├── BidCard (rank #1)
│   │   ├── FreelancerAddress
│   │   ├── QualityScore (gauge)
│   │   ├── BidAmount (MON)
│   │   ├── DeliveryTime
│   │   ├── CompositeScore (calculated)
│   │   └── AuthorizeButton (🟢)
│   ├── BidCard (rank #2) ...
│   └── BidCard (rank #3) ...
├── AllBidsList (expandable, mostra todos)
└── AuctionDetailsPanel
```

**Lógica "IA"**:
- Chama `getAuctionBids(auctionId)` para pegar todos os bids
- Calcula `compositeScore = (score * 1e18) / amount` para cada bid
- Ordena por composite score descrescente
- Mostra os Top 3
- Ou usa `getTopBids(auctionId)` diretamente do contrato

#### Página 5 — Workspace e Liquidação

```
WorkspacePage
├── JobStatusBar (InProgress / Delivered / Approved)
├── FreelancerPanel (visível se role=freelancer)
│   ├── DeliveryLinkInput
│   ├── SubmitDeliveryButton
│   └── DeliveryStatus
├── ClientPanel (visível se role=client)
│   ├── DeliveryReviewPanel
│   │   └── DeliveryLink (iframe/link)
│   ├── ApproveAndPayButton (🟢)
│   └── OpenDisputeButton (🔴)
└── JobHistoryTimeline
```

#### Página 6 — Tribunal de Disputa

```
TribunalPage
├── DisputeAlertBanner (🔴 DISPUTA ATIVA)
├── EvidencePanel
│   ├── OriginalJobScope
│   ├── DeliveryProofLink
│   └── TransactionHistory
├── VotingPanel (visível para auditores)
│   ├── VoteForClientButton
│   ├── VoteForFreelancerButton
│   └── CurrentTally (votos client vs freelancer)
├── StatusPanel
│   ├── AuditorsAssigned (lista de endereços)
│   ├── VotesReceived / TotalNeeded
│   └── Outcome (quando resolvido)
└── DisputeResultBanner
```

---

## 5. Integração Frontend ↔ Contratos

### 5.1 Fluxo Completo (Sequência)

```
CLIENTE                          CONTRATO                         FREELANCER
   │                                 │                                │
   │──registerUser()────────────────>│                                │
   │                                 │<──────────registerUser()───────│
   │                                 │                                │
   │──createAuction({value: X})────->│                                │
   │                                 │──emit AuctionCreated──────────>│
   │                                 │       (via WebSocket)          │
   │                                 │                                │
   │                                 │<──────────placeBid()───────────│
   │                                 │<──────────placeBid()───────────│
   │                                 │<──────────placeBid()───────────│
   │                                 │   (processados em PARALELO)    │
   │                                 │                                │
   │                                 │──emit BidPlaced (para cada)──>│
   │                                 │                                │
   │    (2 minutos depois)           │                                │
   │──closeAuction()────────────────>│                                │
   │──getTopBids()──────────────────>│                                │
   │<───────────Top3 Bids────────────│                                │
   │                                 │                                │
   │──selectFreelancer(bidIndex)────>│                                │
   │                                 │──emit FreelancerSelected─────>│
   │                                 │                                │
   │                                 │<──submitDelivery(proof)────────│
   │                                 │──emit DeliverySubmitted──────>│
   │──approveAndPay()───────────────>│                                │
   │                                 │──transfer MON───────────────->│
   │                                 │──emit JobApproved────────────>│
   │                                 │──emit ScoreUpdated───────────>│
```

### 5.2 Best Practices da Monad (do docs oficial)

1. **Use gas limit explícito** quando possível, evitando chamadas `eth_estimateGas` — acelera a UX na wallet.

2. **Batch eth_call com Multicall3** (`0xcA11bde05977b3631167028862bE2a173976CA11`) para ler múltiplos dados em uma chamada só. Exemplo: ler o perfil + todos os leilões ativos em paralelo com `viem.multicall()`.

3. **Use WebSocket** (`wss://testnet-rpc.monad.xyz`) para events em vez de polling `eth_getLogs`. Com blocos a cada 400ms, polling seria muito ineficiente.

4. **Transações concorrentes**: se precisar enviar múltiplas txs, use `Promise.all()` com nonces locais. Viem faz isso automaticamente.

---

## 6. Deploy e Verificação

### 6.1 Setup do Projeto

```bash
# Estrutura do repositório
monadwork/
├── contracts/           # Smart contracts (Foundry)
│   ├── foundry.toml
│   ├── src/
│   │   └── MonadWorkPlatform.sol
│   ├── test/
│   │   └── MonadWorkPlatform.t.sol
│   └── script/
│       └── Deploy.s.sol
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── config/
│   │   │   ├── wagmi.ts
│   │   │   └── contract.ts (ABI + address)
│   │   ├── hooks/
│   │   │   └── useMonadWork.ts
│   │   ├── pages/
│   │   │   ├── ConnectPage.tsx
│   │   │   ├── ClientAuctionPage.tsx
│   │   │   ├── FreelancerTerminal.tsx
│   │   │   ├── ResolutionDashboard.tsx
│   │   │   ├── WorkspacePage.tsx
│   │   │   └── TribunalPage.tsx
│   │   ├── components/
│   │   └── App.tsx
│   ├── index.html
│   └── package.json
├── README.md
└── IMPLEMENTATION.md (este arquivo)
```

### 6.2 Deploy com Foundry

```bash
# Instalar Foundry (se não tiver)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compilar
cd contracts
forge build

# Deploy na Monad Testnet
forge create src/MonadWorkPlatform.sol:MonadWorkPlatform \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast

# Verificar no MonadVision
forge verify-contract \
  --chain-id 10143 \
  --compiler-version v0.8.24 \
  $CONTRACT_ADDRESS \
  src/MonadWorkPlatform.sol:MonadWorkPlatform \
  --etherscan-api-key $MONADVISION_API_KEY \
  --verifier-url https://testnet.monadvision.com/api
```

### 6.3 Deploy com Foundry Script

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MonadWorkPlatform.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MonadWorkPlatform platform = new MonadWorkPlatform();

        console.log("MonadWorkPlatform deployed to:", address(platform));

        vm.stopBroadcast();
    }
}
```

```bash
forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

### 6.4 Testes

```bash
# Testes locais com Foundry
forge test -vvv

# Fork da Monad Testnet para testes (NOTA: usar Monad Foundry se disponível)
forge test --fork-url https://testnet-rpc.monad.xyz -vvv
```

---

## 7. Referências

### Monad Official
- **Docs**: https://docs.monad.xyz
- **Monad for Developers**: https://docs.monad.xyz/introduction/monad-for-developers
- **Differences from Ethereum**: https://docs.monad.xyz/developer-essentials/differences
- **Gas Pricing**: https://docs.monad.xyz/developer-essentials/gas-pricing
- **Best Practices**: https://docs.monad.xyz/developer-essentials/best-practices
- **Network Info (Testnet)**: https://docs.monad.xyz/developer-essentials/testnets
- **Faucet**: https://faucet.monad.xyz

### Ferramentas
- **Foundry**: https://getfoundry.sh
- **Wagmi**: https://wagmi.sh
- **Viem**: https://viem.sh
- **Monad Foundry** (custom fork): https://docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry

### Block Explorers
- **MonadVision (Testnet)**: https://testnet.monadvision.com
- **MonadVision (Mainnet)**: https://monadvision.com
- **Monadscan**: https://monadscan.com

---

<p align="center">
  <strong>🟣 MonadWork — Built for Monad Blitz Hackathon ⚡</strong><br/>
  <em>"Tudo on-chain, tudo anônimo, tudo em 2 minutos."</em>
</p>
