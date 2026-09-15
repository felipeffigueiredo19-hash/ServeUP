/* =========================================================
   Chamar garçom e o jogo 'Corrida ServeUp' (kart).
   ========================================================= */

function tocarSomNotificacaoGarcom() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const agora = ctx.currentTime;
        const notas = [880, 1174, 880];
        notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const ganho = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            ganho.gain.setValueAtTime(0.0001, agora + i * 0.12);
            ganho.gain.exponentialRampToValueAtTime(0.22, agora + i * 0.12 + 0.02);
            ganho.gain.exponentialRampToValueAtTime(0.0001, agora + i * 0.12 + 0.20);
            osc.connect(ganho); ganho.connect(ctx.destination);
            osc.start(agora + i * 0.12); osc.stop(agora + i * 0.12 + 0.22);
        });
        setTimeout(() => ctx.close().catch(()=>{}), 700);
    } catch (_) {}
}

const btnChamarGarcom = document.getElementById("btnChamarGarcom");

if (btnChamarGarcom) {
    let garcomCooldown = false;

    btnChamarGarcom.addEventListener("click", () => {
        if (garcomCooldown) {
            mostrarNotificacao("⏳ Garçom já foi chamado! Aguarde um momento.");
            return;
        }

        // Feedback visual no botão
        btnChamarGarcom.classList.add("garcom-chamado");
        btnChamarGarcom.querySelector("strong").textContent = "Garçom chamado!";
        btnChamarGarcom.querySelector("small").textContent = "Já estamos indo até você";

        mostrarNotificacao("🔔 Garçom chamado! Ele chegará em instantes.");
        tocarSomNotificacaoGarcom();

        garcomCooldown = true;

        setTimeout(() => {
            btnChamarGarcom.classList.remove("garcom-chamado");
            btnChamarGarcom.querySelector("strong").textContent = "Chamar o garçom";
            btnChamarGarcom.querySelector("small").textContent = "Precisando de algo?";
            garcomCooldown = false;
        }, 30000); // 30s de cooldown
    });
}

let kart = {
    canvas: null, ctx: null,
    x: 360, y: 350,
    estradaOffset: 0, obstaculos: [],
    pontos: 0, velocidade: 0,
    esquerda: false, direita: false,
    ultimoTempo: 0, proximoObstaculo: 0,
    ultimaFaixa: -1,
    ultimaFaixaLivre: -1,
    ondasCorrida: 0
};

const KART_LARGURA = 54;
const KART_ALTURA = 70;
const KART_FAIXAS = 3;

function prepararKart() {
    kart.canvas = document.getElementById("kartCanvas");
    if (!kart.canvas) return;
    kart.ctx = kart.canvas.getContext("2d");
    kart.x = kart.canvas.width / 2;
    kart.y = kart.canvas.height - 65;
    kart.estradaOffset = 0;
    kart.obstaculos = [];
    kart.pontos = 0;
    kart.velocidade = 0;
    // A primeira leva entra depois que a corrida começa; nenhum carro
    // fica parado na tela de início. Depois, o trânsito é contínuo.
    kart.proximoObstaculo = 75;
    kart.ultimaFaixa = -1;
    kart.ultimaFaixaLivre = -1;
    kart.ondasCorrida = 0;
    kart.esquerda = false;
    kart.direita = false;
    window.kartAtivo = false;
    const pontos = document.getElementById("kartPontos");
    const velocidade = document.getElementById("kartVelocidade");
    const status = document.getElementById("kartStatus");
    if (pontos) pontos.textContent = "0";
    if (velocidade) velocidade.textContent = "0";
    if (status) status.textContent = "Clique em INICIAR CORRIDA ou toque na tela para começar. Use os botões para virar.";
    const botao = document.getElementById("btnIniciarKart");
    if (botao) { botao.disabled = false; botao.textContent = "🏁 INICIAR CORRIDA"; }
    const gameOver = document.getElementById("kartGameOver");
    if (gameOver) gameOver.classList.add("hidden");
    desenharKart();
}

function desenharCarroKart(ctx, centroX, centroY, corPrincipal, corDetalhe) {
    const x = centroX - KART_LARGURA / 2;
    const y = centroY - KART_ALTURA / 2;

    // Carro apontado para cima (sentido da corrida). A frente fica no topo:
    // faróis claros acima, para-brisa logo abaixo e lanternas vermelhas atrás.
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 5, y + 12, 8, 20);
    ctx.fillRect(x + KART_LARGURA - 3, y + 12, 8, 20);
    ctx.fillRect(x - 5, y + 47, 8, 20);
    ctx.fillRect(x + KART_LARGURA - 3, y + 47, 8, 20);

    ctx.fillStyle = corPrincipal;
    ctx.beginPath();
    ctx.roundRect(x, y, KART_LARGURA, KART_ALTURA, 12);
    ctx.fill();

    // Frente do carro: faróis no topo e grade dianteira.
    ctx.fillStyle = "#fff6cf";
    ctx.fillRect(x + 7, y + 6, 12, 7);
    ctx.fillRect(x + KART_LARGURA - 19, y + 6, 12, 7);
    ctx.fillStyle = corDetalhe;
    ctx.beginPath();
    ctx.roundRect(x + 9, y + 16, KART_LARGURA - 18, 18, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillRect(x + 13, y + 19, KART_LARGURA - 26, 5);

    // Parte traseira: lanternas vermelhas na parte inferior.
    ctx.fillStyle = "#171109";
    ctx.fillRect(x + 12, y + 45, 30, 5);
    ctx.fillStyle = "#ef3f4f";
    ctx.fillRect(x + 7, y + 56, 11, 6);
    ctx.fillRect(x + KART_LARGURA - 18, y + 56, 11, 6);
}

function desenharKart() {
    if (!kart.ctx) return;
    const ctx = kart.ctx, w = kart.canvas.width, h = kart.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // A pista ocupa 100% do canvas. Não existe acostamento, gramado,
    // faixa externa ou qualquer corredor lateral que possa virar atalho.
    const estradaX = 0, estradaW = w;
    ctx.fillStyle = "#292725";
    ctx.fillRect(estradaX, 0, estradaW, h);
    ctx.fillStyle = "#d8a63c";
    ctx.fillRect(0, 0, 5, h);
    ctx.fillRect(w - 5, 0, 5, h);

    // Divisórias das 3 faixas, para deixar claro onde virar.
    ctx.fillStyle = "rgba(255,255,255,.55)";
    const faixaH = 48;
    for (const divisor of [estradaX + estradaW / 3, estradaX + estradaW * 2 / 3]) {
        for (let y = -faixaH + (kart.estradaOffset % 90); y < h; y += 90) {
            ctx.fillRect(divisor - 3, y, 6, faixaH);
        }
    }

    kart.obstaculos.forEach(o => {
        desenharCarroKart(ctx, o.x + KART_LARGURA / 2, o.y + KART_ALTURA / 2, o.cor, o.detalhe);
    });

    desenharCarroKart(ctx, kart.x, kart.y, "#d8a63c", "#f7f2e8");
}

function centroFaixaKart(faixa) {
    const estradaX = 0, estradaW = kart.canvas.width;
    return estradaX + estradaW * (faixa + 0.5) / KART_FAIXAS;
}

function criarLevaCarrosKart() {
    const w = kart.canvas.width;
    const cores = [
        ["#e85d5d", "#ffd447"],
        ["#5d8ee8", "#b9d4ff"],
        ["#7ac943", "#eaffbf"],
        ["#b45de8", "#efd0ff"],
        ["#ef8d3c", "#ffe0a8"]
    ];

    /*
     * Trânsito espalhado:
     * - Vários carros por leva, mas com grande distância entre eles.
     * - Os carros usam TODA a pista, inclusive as duas linhas divisórias.
     * - A ordem das posições é embaralhada em cada leva.
     * - Nunca colocamos dois carros praticamente lado a lado no mesmo trecho,
     *   evitando a sensação de "parede" de carros.
     */
    const pontosPossiveis = [
        w * 0.17,       // esquerda
        w / 3,          // divisória esquerda
        w * 0.50,       // centro
        w * 2 / 3,       // divisória direita
        w * 0.83        // direita
    ];

    // Em cada grupo, 3 carros vêm em posições diferentes e separados no tempo.
    // A posição horizontal é sorteada, então não existe sequência decorável.
    const embaralhado = [...pontosPossiveis].sort(() => Math.random() - 0.5);
    const quantidade = 3;
    const separacaoY = 175;

    for (let i = 0; i < quantidade; i++) {
        let indice = pontosPossiveis.indexOf(embaralhado[i]);

        // Evita repetir exatamente a última posição como primeiro carro da leva.
        if (i === 0 && indice === kart.ultimaFaixa) {
            const alternativas = pontosPossiveis
                .map((_, n) => n)
                .filter(n => n !== kart.ultimaFaixa);
            indice = alternativas[Math.floor(Math.random() * alternativas.length)];
        }
        if (i === 0) kart.ultimaFaixa = indice;

        // Pequena variação lateral para o trânsito não parecer robótico.
        const variacao = (Math.random() - 0.5) * 22;
        const marg = KART_LARGURA / 2 + 8;
        const xCentro = Math.max(marg, Math.min(w - marg, pontosPossiveis[indice] + variacao));
        const paleta = cores[Math.floor(Math.random() * cores.length)];

        kart.obstaculos.push({
            x: xCentro - KART_LARGURA / 2,
            y: -KART_ALTURA - 25 - (i * separacaoY),
            w: KART_LARGURA,
            h: KART_ALTURA,
            cor: paleta[0],
            detalhe: paleta[1],
            pontuou: false
        });
    }

    kart.ondasCorrida++;
}

function iniciarCorridaKart() {
    if (window.kartAtivo) return;
    prepararKart();
    window.kartAtivo = true;
    kart.velocidade = 6;
    kart.ultimoTempo = performance.now();
    const status = document.getElementById("kartStatus");
    const botao = document.getElementById("btnIniciarKart");
    if (status) status.textContent = "🏁 Corrida iniciada, clique nos botões para virar;";
    if (botao) { botao.disabled = true; botao.textContent = "🏁 CORRIDA EM ANDAMENTO"; }
    window.kartAnimationFrame = requestAnimationFrame(atualizarKart);
}

function pararCorridaKart() {
    window.kartAtivo = false;
    kart.esquerda = false;
    kart.direita = false;
    if (window.kartAnimationFrame) {
        cancelAnimationFrame(window.kartAnimationFrame);
        window.kartAnimationFrame = null;
    }
}

function colisaoKart(o) {
    const player = {
        left: kart.x - KART_LARGURA / 2 + 5,
        right: kart.x + KART_LARGURA / 2 - 5,
        top: kart.y - KART_ALTURA / 2 + 7,
        bottom: kart.y + KART_ALTURA / 2 - 7
    };
    return player.left < o.x + KART_LARGURA - 5 &&
           player.right > o.x + 5 &&
           player.top < o.y + KART_ALTURA - 7 &&
           player.bottom > o.y + 7;
}

function atualizarKart(tempo) {
    if (!window.kartAtivo) return;
    const dt = Math.min((tempo - kart.ultimoTempo) / 16.67, 2);
    kart.ultimoTempo = tempo;

    if (kart.esquerda) kart.x -= 7.5 * dt;
    if (kart.direita) kart.x += 7.5 * dt;

    const estradaX = 0, estradaFim = kart.canvas.width;
    const limiteEsq = estradaX + KART_LARGURA / 2 + 8;
    const limiteDir = estradaFim - KART_LARGURA / 2 - 8;
    kart.x = Math.max(limiteEsq, Math.min(limiteDir, kart.x));
    kart.estradaOffset += kart.velocidade * dt;

    kart.proximoObstaculo -= dt;
    if (kart.proximoObstaculo <= 0) {
        criarLevaCarrosKart();
        // As levas se sobrepõem no tempo, mantendo carros visíveis em
        // diferentes alturas da pista. Assim não há corredor lateral para farm.
        kart.proximoObstaculo = Math.max(72, 92 - kart.pontos * 0.10) + Math.random() * 28;
    }

    kart.obstaculos.forEach(o => o.y += kart.velocidade * dt);

    for (const o of kart.obstaculos) {
        if (colisaoKart(o)) {
            pararCorridaKart();
            const status = document.getElementById("kartStatus");
            if (status) status.textContent = "💥 Você bateu! Tente outra rota.";
            const fimPontos = document.getElementById("kartGameOverPontos");
            if (fimPontos) fimPontos.textContent = kart.pontos;
            const botao = document.getElementById("btnIniciarKart");
            if (botao) { botao.disabled = false; botao.textContent = "🏁 INICIAR CORRIDA"; }
            const gameOver = document.getElementById("kartGameOver");
            if (gameOver) gameOver.classList.remove("hidden");
            desenharKart();
            return;
        }
    }

    kart.obstaculos = kart.obstaculos.filter(o => {
        if (o.y > kart.canvas.height + 20) {
            if (!o.pontuou) {
                o.pontuou = true;
                kart.pontos++;
                const el = document.getElementById("kartPontos");
                if (el) el.textContent = kart.pontos;
            }
            return false;
        }
        return true;
    });

    kart.velocidade = Math.min(15, 6 + Math.floor(kart.pontos / 5));
    const vel = document.getElementById("kartVelocidade");
    if (vel) vel.textContent = kart.velocidade;
    desenharKart();
    window.kartAnimationFrame = requestAnimationFrame(atualizarKart);
}

function configurarControlesKart() {
    const esquerda = document.getElementById("kartEsquerda");
    const direita = document.getElementById("kartDireita");
    const iniciar = document.getElementById("btnIniciarKart");
    if (!esquerda || !direita || !iniciar) return;

    const pressionar = (lado, valor) => { kart[lado] = valor; };
    const bindHold = (el, lado) => {
        el.addEventListener("mousedown", () => pressionar(lado, true));
        el.addEventListener("mouseup", () => pressionar(lado, false));
        el.addEventListener("mouseleave", () => pressionar(lado, false));
        el.addEventListener("touchstart", e => { e.preventDefault(); pressionar(lado, true); }, {passive:false});
        el.addEventListener("touchend", () => pressionar(lado, false));
        el.addEventListener("touchcancel", () => pressionar(lado, false));
    };
    bindHold(esquerda, "esquerda"); bindHold(direita, "direita");
    iniciar.addEventListener("click", iniciarCorridaKart);

    const canvasKart = document.getElementById("kartCanvas");
    if (canvasKart) {
        canvasKart.addEventListener("click", () => { if (!window.kartAtivo) iniciarCorridaKart(); });
        canvasKart.addEventListener("touchstart", e => {
            if (!window.kartAtivo) { e.preventDefault(); iniciarCorridaKart(); }
        }, {passive:false});
    }

    // Teclado: somente A/D e as setas controlam a direção. Espaço não inicia.
    window.addEventListener("keydown", e => {
        if (!window.kartAtivo) return;
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") { e.preventDefault(); kart.esquerda = true; }
        if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") { e.preventDefault(); kart.direita = true; }
    });
    window.addEventListener("keyup", e => {
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") kart.esquerda = false;
        if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") kart.direita = false;
    });
}

const btnTentarNovamenteKart = document.getElementById("btnTentarNovamenteKart");
const btnGameOverVoltar = document.getElementById("btnGameOverVoltar");
if (btnTentarNovamenteKart) btnTentarNovamenteKart.addEventListener("click", iniciarCorridaKart);
if (btnGameOverVoltar) btnGameOverVoltar.addEventListener("click", () => {
    pararCorridaKart();
    const gameOver = document.getElementById("kartGameOver");
    if (gameOver) gameOver.classList.add("hidden");

    // O usuário continua na central de jogos, mas volta para a área de
    // escolha dos jogos. Não dependemos de variáveis globais do HTML.
    const abas = document.querySelector(".jogos-tabs");
    if (abas) abas.scrollIntoView({ behavior: "smooth", block: "center" });
});
configurarControlesKart();

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepararKart, { once: true });
else prepararKart();

/* =========================================================
   Jogo da velha — modo contra IA ou contra outra pessoa.
   ========================================================= */

let velhaTabuleiro = Array(9).fill("");
let velhaFim = false;
let velhaPensando = false;
let velhaModo = "ia";
let vezVelha = "X";
let placarVelha = JSON.parse(localStorage.getItem("serveup_velha_placar_v2") || JSON.stringify({
    ia: { voce: 0, ia: 0, empates: 0 },
    amigo: { x: 0, o: 0, empates: 0 }
}));
placarVelha.ia ||= {voce:0, ia:0, empates:0};
placarVelha.amigo ||= {x:0, o:0, empates:0};
const velhaTabuleiroEl = document.getElementById("velhaTabuleiro");
const velhaStatusEl = document.getElementById("velhaStatus");
const velhaDescricaoEl = document.getElementById("velhaDescricao");
const modoVelhaIA = document.getElementById("modoVelhaIA");
const modoVelhaAmigo = document.getElementById("modoVelhaAmigo");
const jogoKartEl = document.getElementById("jogoKart");
const jogoVelhaEl = document.getElementById("jogoVelha");
const jogoFrangoEl = document.getElementById("jogoFrango");
const tabKart = document.getElementById("tabKart");
const tabVelha = document.getElementById("tabVelha");
const tabFrango = document.getElementById("tabFrango");

function atualizarPlacarVelha(){
    const ia = placarVelha.ia, amigo = placarVelha.amigo;
    const ids = {
        placarIAVoce: ia.voce, placarIAIa: ia.ia, placarIAEmpates: ia.empates,
        placarAmigoX: amigo.x, placarAmigoO: amigo.o, placarAmigoEmpates: amigo.empates
    };
    Object.entries(ids).forEach(([id, valor]) => { const el=document.getElementById(id); if(el) el.textContent=valor; });
    localStorage.setItem("serveup_velha_placar_v2",JSON.stringify(placarVelha));
}
function vencedorVelha(b){
    const linhas=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,c,d] of linhas) if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
    return b.every(Boolean)?"empate":null;
}
function desenharVelha(){
    // Mantido como alias para evitar comportamentos diferentes entre os modos.
    desenharVelhaComModo();
}
function terminarVelha(resultado){
    velhaFim=true; velhaPensando=false;
    const placar = placarVelha[velhaModo];
    if(resultado==="X"){
        if(velhaModo==="ia") placar.voce++; else placar.x++;
        velhaStatusEl.textContent=velhaModo==="ia"?"Você venceu! 🎉":"Jogador X venceu! 🎉";
    } else if(resultado==="O"){
        if(velhaModo==="ia") placar.ia++; else placar.o++;
        velhaStatusEl.textContent=velhaModo==="ia"?"A IA venceu desta vez. Tente de novo!":"Jogador O venceu! 🎉";
    } else {
        placar.empates++;
        velhaStatusEl.textContent="Deu empate! Boa partida.";
    }
    desenharVelha();
}

/*
 * IA do Jogo da Velha:
 * - nunca ignora uma vitória imediata;
 * - sempre bloqueia uma derrota imediata;
 * - reconhece forks (duas ameaças ao mesmo tempo);
 * - calcula jogadas fortes com minimax limitado;
 * - entre jogadas muito próximas, às vezes escolhe a segunda melhor,
 *   para continuar competitiva sem jogar de forma robótica/perfeita.
 */
function melhorJogadaServeup(){
    const livres=velhaTabuleiro.map((v,i)=>v?null:i).filter(i=>i!==null);
    if(!livres.length)return undefined;

    // Tática obrigatória: se puder ganhar, ganha. Se precisar bloquear, bloqueia.
    const vencedora=encontrarJogadaQueFecha("O");
    if(vencedora!==undefined)return vencedora;
    const bloqueio=encontrarJogadaQueFecha("X");
    if(bloqueio!==undefined)return bloqueio;

    function avaliar(board){
        const resultado=vencedorVelha(board);
        if(resultado==="O")return 100;
        if(resultado==="X")return -100;
        if(resultado==="empate")return 0;
        return null;
    }

    function minimax(board, vezO, profundidade){
        const fim=avaliar(board);
        if(fim!==null)return fim;
        if(profundidade>=6)return heuristicaVelha(board);

        const disponiveis=board.map((v,i)=>v?null:i).filter(i=>i!==null);
        if(vezO){
            let melhor=-Infinity;
            for(const i of disponiveis){
                board[i]="O";
                melhor=Math.max(melhor,minimax(board,false,profundidade+1));
                board[i]="";
            }
            return melhor;
        }
        let melhor=Infinity;
        for(const i of disponiveis){
            board[i]="X";
            melhor=Math.min(melhor,minimax(board,true,profundidade+1));
            board[i]="";
        }
        return melhor;
    }

    function heuristicaVelha(board){
        const linhas=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        let score=0;
        for(const linha of linhas){
            const vals=linha.map(i=>board[i]);
            const o=vals.filter(v=>v==="O").length;
            const x=vals.filter(v=>v==="X").length;
            if(o===2&&x===0)score+=8;
            else if(o===1&&x===0)score+=2;
            if(x===2&&o===0)score-=10;
            else if(x===1&&o===0)score-=2;
        }
        if(board[4]==="O")score+=3;
        if(board[4]==="X")score-=3;
        for(const i of [0,2,6,8]){
            if(board[i]==="O")score+=1;
            if(board[i]==="X")score-=1;
        }
        return score;
    }

    const avaliadas=livres.map(i=>{
        velhaTabuleiro[i]="O";
        const valor=minimax(velhaTabuleiro,false,0);
        velhaTabuleiro[i]="";
        return {i,valor};
    }).sort((a,b)=>b.valor-a.valor);

    const melhor=avaliadas[0].valor;
    const proximas=avaliadas.filter(m=>m.valor>=melhor-12);

    // 25% de chance de escolher uma jogada estrategicamente próxima da melhor.
    // Assim a IA joga bem, mas não vira uma máquina impossível de vencer.
    if(Math.random()<0.25 && proximas.length>1){
        const limite=Math.min(3,proximas.length);
        return proximas[Math.floor(Math.random()*limite)].i;
    }
    return avaliadas[0].i;
}
function encontrarJogadaQueFecha(simbolo){
    const livres=velhaTabuleiro.map((v,i)=>v?null:i).filter(i=>i!==null);
    for(const i of livres){
        velhaTabuleiro[i]=simbolo;
        const ganhou=vencedorVelha(velhaTabuleiro)===simbolo;
        velhaTabuleiro[i]="";
        if(ganhou)return i;
    }
    return undefined;
}
function jogadaServeup(){
    if(velhaFim)return;
    const escolha=melhorJogadaServeup();
    if(escolha===undefined)return;
    velhaTabuleiro[escolha]="O";
    const resultado=vencedorVelha(velhaTabuleiro);
    if(resultado) terminarVelha(resultado);
    else{velhaPensando=false;velhaStatusEl.textContent="Sua vez (X). Escolha uma casa.";desenharVelha();}
}
function jogadaVelha(i){
    if(velhaFim||velhaPensando||velhaTabuleiro[i])return;
    velhaTabuleiro[i]="X";
    let resultado=vencedorVelha(velhaTabuleiro);
    if(resultado){terminarVelha(resultado);return;}

    if(velhaModo==="amigo"){
        velhaStatusEl.textContent="Vez do jogador O.";
        desenharVelha();
        return;
    }
    velhaPensando=true;velhaStatusEl.textContent="ServeUp está pensando...";desenharVelha();
    setTimeout(jogadaServeup,420);
}
function jogadaAmigo(i){
    if(velhaFim || velhaPensando || velhaTabuleiro[i]) return;

    // No modo "contra alguém", a vez alterna de verdade entre X e O.
    // Antes, qualquer clique chamava jogadaAmigo() e colocava O novamente,
    // impedindo o jogador X de fazer a segunda jogada.
    const simbolo = vezVelha;
    velhaTabuleiro[i] = simbolo;

    const resultado = vencedorVelha(velhaTabuleiro);
    if (resultado) {
        terminarVelha(resultado);
        return;
    }

    vezVelha = simbolo === "X" ? "O" : "X";
    velhaStatusEl.textContent = `Vez do jogador ${vezVelha}.`;
    desenharVelha();
}
function escolherCasaVelha(i){
    if(velhaModo==="amigo") jogadaAmigo(i);
    else jogadaVelha(i);
}
function desenharVelhaComModo(){
    if(!velhaTabuleiroEl)return;
    velhaTabuleiroEl.innerHTML="";
    velhaTabuleiro.forEach((v,i)=>{
        const btn=document.createElement("button");
        btn.type="button";btn.className="velha-casa";btn.textContent=v;btn.dataset.index=i;
        btn.disabled=Boolean(v)||velhaFim||velhaPensando;
        btn.setAttribute("aria-label", v ? `Casa ${i+1}: ${v}` : `Casa ${i+1}: vazia`);
        btn.addEventListener("click",()=>escolherCasaVelha(i));
        velhaTabuleiroEl.appendChild(btn);
    });
    atualizarPlacarVelha();
}
function novaVelha(){
    velhaTabuleiro=Array(9).fill("");
    velhaFim=false;
    velhaPensando=false;
    vezVelha="X";
    if(velhaStatusEl)velhaStatusEl.textContent=velhaModo==="ia"?"Sua vez (X). Escolha uma casa.":"Vez do jogador X.";
    desenharVelhaComModo();
}
function definirModoVelha(modo){
    velhaModo=modo;
    if(modoVelhaIA)modoVelhaIA.classList.toggle("active",modo==="ia");
    if(modoVelhaAmigo)modoVelhaAmigo.classList.toggle("active",modo==="amigo");
    if(velhaDescricaoEl)velhaDescricaoEl.textContent=modo==="ia"?"Você joga com X contra uma IA com dificuldade humana.":"Jogue localmente: X e O usam o mesmo aparelho.";
    const blocoIA=document.getElementById("placarModoIA"), blocoAmigo=document.getElementById("placarModoAmigo");
    if(blocoIA) blocoIA.classList.toggle("active",modo==="ia");
    if(blocoAmigo) blocoAmigo.classList.toggle("active",modo==="amigo");
    const rotuloX=document.getElementById("rotuloPlacarX"), rotuloO=document.getElementById("rotuloPlacarO");
    if(rotuloX)rotuloX.textContent=modo==="ia"?"VOCÊ":"JOGADOR X";
    if(rotuloO)rotuloO.textContent=modo==="ia"?"SERVEUP":"JOGADOR O";
    novaVelha();
}
function mostrarJogo(tipo){
    const k=tipo==="kart", v=tipo==="velha", f=tipo==="frango";
    jogoKartEl.classList.toggle("hidden",!k);jogoKartEl.classList.toggle("active",k);
    jogoVelhaEl.classList.toggle("hidden",!v);jogoVelhaEl.classList.toggle("active",v);
    if(jogoFrangoEl){jogoFrangoEl.classList.toggle("hidden",!f);jogoFrangoEl.classList.toggle("active",f);}
    tabKart.classList.toggle("active",k);tabVelha.classList.toggle("active",v);
    if(tabFrango)tabFrango.classList.toggle("active",f);
    if(!k)pararCorridaKart();
    if(!f)pararFrango();
}
if(tabKart)tabKart.addEventListener("click",()=>mostrarJogo("kart"));
if(tabVelha)tabVelha.addEventListener("click",()=>mostrarJogo("velha"));
if(tabFrango)tabFrango.addEventListener("click",()=>mostrarJogo("frango"));
if(modoVelhaIA)modoVelhaIA.addEventListener("click",()=>definirModoVelha("ia"));
if(modoVelhaAmigo)modoVelhaAmigo.addEventListener("click",()=>definirModoVelha("amigo"));
const btnNovaVelha=document.getElementById("btnNovaVelha"),btnZerarVelha=document.getElementById("btnZerarVelha");
if(btnNovaVelha)btnNovaVelha.addEventListener("click",novaVelha);
if(btnZerarVelha)btnZerarVelha.addEventListener("click",()=>{
    // Zera somente o placar do modo que está aberto.
    if(velhaModo === "ia") {
        placarVelha.ia = {voce:0, ia:0, empates:0};
    } else {
        placarVelha.amigo = {x:0, o:0, empates:0};
    }
    atualizarPlacarVelha();
    novaVelha();
});
definirModoVelha("ia");

/* =========================================================
   Frango Voador — mini "flappy bird" temático do ServeUp.
   ========================================================= */

const GRAVIDADE_FRANGO = 0.45;
const IMPULSO_FRANGO = -7.6;
const RAIO_FRANGO = 16;
const VAO_COLUNAS_FRANGO = 150;

let frango = {
    canvas: null, ctx: null,
    largura: 0, altura: 0,
    y: 0, vy: 0,
    colunas: [],
    pontos: 0, recorde: 0,
    ultimoTempo: 0, proximaColuna: 0
};

function prepararFrango() {
    frango.canvas = document.getElementById("frangoCanvas");
    if (!frango.canvas) return;
    frango.ctx = frango.canvas.getContext("2d");
    frango.largura = frango.canvas.width;
    frango.altura = frango.canvas.height;
    frango.y = frango.altura / 2;
    frango.vy = 0;
    frango.colunas = [];
    frango.pontos = 0;
    frango.proximaColuna = 0;
    frango.recorde = Number(localStorage.getItem("serveup_frango_recorde") || 0);
    window.frangoAtivo = false;
    const elPontos = document.getElementById("frangoPontos");
    const elRecorde = document.getElementById("frangoRecorde");
    const elStatus = document.getElementById("frangoStatus");
    if (elPontos) elPontos.textContent = "0";
    if (elRecorde) elRecorde.textContent = frango.recorde;
    if (elStatus) elStatus.textContent = "Clique em INICIAR VOO ou toque na tela para começar.";
    const gameOver = document.getElementById("frangoGameOver");
    if (gameOver) gameOver.classList.add("hidden");
    desenharFrango();
}

function desenharFrango() {
    if (!frango.ctx) return;
    const ctx = frango.ctx, w = frango.largura, h = frango.altura;
    ctx.clearRect(0, 0, w, h);

    const ceu = ctx.createLinearGradient(0, 0, 0, h);
    ceu.addColorStop(0, "#39b7ff"); ceu.addColorStop(0.58, "#8ee7ff"); ceu.addColorStop(1, "#d9f8ff");
    ctx.fillStyle = ceu; ctx.fillRect(0, 0, w, h);

    // Nuvens para deixar o cenário mais alegre e colorido.
    ctx.fillStyle = "rgba(255,255,255,.88)";
    [[55,90,22],[145,180,28],[295,78,25],[330,265,30]].forEach(([x,y,r]) => {
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.arc(x+r*.8,y+7,r*.72,0,Math.PI*2); ctx.arc(x-r*.7,y+10,r*.65,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = "#75d85b"; ctx.fillRect(0,h-30,w,30);
    ctx.fillStyle = "#4eaf48"; ctx.fillRect(0,h-30,w,7);

    // Colunas coloridas, inspiradas em canudos/garfos de restaurante.
    frango.colunas.forEach(c => {
        ctx.fillStyle = "#ff5c6c";
        ctx.fillRect(c.x, 0, c.largura, c.topo);
        ctx.fillRect(c.x, c.topo + VAO_COLUNAS_FRANGO, c.largura, h - (c.topo + VAO_COLUNAS_FRANGO));
        ctx.fillStyle = "#ffd447";
        ctx.fillRect(c.x - 5, c.topo - 14, c.largura + 10, 14);
        ctx.fillRect(c.x - 5, c.topo + VAO_COLUNAS_FRANGO, c.largura + 10, 14);
        ctx.fillStyle = "#ff8f3d";
        ctx.fillRect(c.x + 8, 0, 7, c.topo);
        ctx.fillRect(c.x + 8, c.topo + VAO_COLUNAS_FRANGO, 7, h - (c.topo + VAO_COLUNAS_FRANGO));
    });

    // Frango (jogador), desenhado com formas simples.
    const xFrango = w * 0.28;
    ctx.save();
    ctx.translate(xFrango, frango.y);
    ctx.rotate(Math.max(-0.4, Math.min(0.9, frango.vy * 0.05)));
    ctx.fillStyle = "#ffd447";
    ctx.beginPath(); ctx.arc(0, 0, RAIO_FRANGO, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath(); ctx.ellipse(-7, 5, 9, 6, -0.35, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#f1c96b";
    ctx.beginPath(); ctx.moveTo(RAIO_FRANGO - 2, -4); ctx.lineTo(RAIO_FRANGO + 11, 0); ctx.lineTo(RAIO_FRANGO - 2, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#171109";
    ctx.beginPath(); ctx.arc(4, -5, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function baterAsasFrango() {
    if (!window.frangoAtivo) { iniciarVooFrango(); return; }
    frango.vy = IMPULSO_FRANGO;
}

function iniciarVooFrango() {
    if (window.frangoAtivo) return;
    prepararFrango();
    window.frangoAtivo = true;
    frango.vy = IMPULSO_FRANGO;
    frango.ultimoTempo = performance.now();
    const elStatus = document.getElementById("frangoStatus");
    if (elStatus) elStatus.textContent = "Toque na tela para bater as asas!";
    window.frangoAnimationFrame = requestAnimationFrame(atualizarFrango);
}

function pararFrango() {
    window.frangoAtivo = false;
    if (window.frangoAnimationFrame) cancelAnimationFrame(window.frangoAnimationFrame);
}

function encerrarFrango() {
    window.frangoAtivo = false;
    const elStatus = document.getElementById("frangoStatus");
    if (elStatus) elStatus.textContent = "💥 Você perdeu!";
    const elFim = document.getElementById("frangoGameOverPontos");
    if (elFim) elFim.textContent = frango.pontos;
    if (frango.pontos > frango.recorde) {
        frango.recorde = frango.pontos;
        localStorage.setItem("serveup_frango_recorde", frango.recorde);
    }
    const elRecorde = document.getElementById("frangoRecorde");
    if (elRecorde) elRecorde.textContent = frango.recorde;
    const gameOver = document.getElementById("frangoGameOver");
    if (gameOver) gameOver.classList.remove("hidden");
    desenharFrango();
}

function atualizarFrango(tempo) {
    if (!window.frangoAtivo) return;
    const dt = Math.min((tempo - frango.ultimoTempo) / 16.67, 2);
    frango.ultimoTempo = tempo;

    frango.vy += GRAVIDADE_FRANGO * dt;
    frango.y += frango.vy * dt;

    // Gera novas colunas com um vão sempre transponível.
    frango.proximaColuna -= dt;
    if (frango.proximaColuna <= 0) {
        const margem = 60;
        const topo = margem + Math.random() * (frango.altura - VAO_COLUNAS_FRANGO - margem * 2);
        frango.colunas.push({ x: frango.largura + 20, largura: 54, topo, pontuou: false });
        frango.proximaColuna = Math.max(48, 78 - frango.pontos * 1.1);
    }

    // À medida que os pontos aumentam, as colunas avançam mais rápido.
    const velocidade = Math.min(6.5, 3.4 + frango.pontos * 0.12);
    frango.colunas.forEach(c => c.x -= velocidade * dt);

    const xFrango = frango.largura * 0.28;
    for (const c of frango.colunas) {
        const dentroX = xFrango + RAIO_FRANGO - 5 > c.x && xFrango - RAIO_FRANGO + 5 < c.x + c.largura;
        const bateuTopo = frango.y - RAIO_FRANGO + 5 < c.topo;
        const bateuBase = frango.y + RAIO_FRANGO - 5 > c.topo + VAO_COLUNAS_FRANGO;
        if (dentroX && (bateuTopo || bateuBase)) { encerrarFrango(); return; }
        if (!c.pontuou && c.x + c.largura < xFrango) {
            c.pontuou = true;
            frango.pontos++;
            const elPontos = document.getElementById("frangoPontos");
            if (elPontos) elPontos.textContent = frango.pontos;
        }
    }

    if (frango.y - RAIO_FRANGO < 0 || frango.y + RAIO_FRANGO > frango.altura) { encerrarFrango(); return; }

    frango.colunas = frango.colunas.filter(c => c.x + c.largura > -20);

    desenharFrango();
    window.frangoAnimationFrame = requestAnimationFrame(atualizarFrango);
}

function configurarControlesFrango() {
    const canvas = document.getElementById("frangoCanvas");
    const iniciar = document.getElementById("btnIniciarFrango");
    if (!canvas || !iniciar) return;

    canvas.addEventListener("mousedown", baterAsasFrango);
    canvas.addEventListener("touchstart", e => { e.preventDefault(); baterAsasFrango(); }, { passive: false });
    iniciar.addEventListener("click", iniciarVooFrango);


}

const btnTentarNovamenteFrango = document.getElementById("btnTentarNovamenteFrango");
const btnGameOverVoltarFrango = document.getElementById("btnGameOverVoltarFrango");
if (btnTentarNovamenteFrango) btnTentarNovamenteFrango.addEventListener("click", iniciarVooFrango);
if (btnGameOverVoltarFrango) btnGameOverVoltarFrango.addEventListener("click", () => {
    pararFrango();
    const gameOver = document.getElementById("frangoGameOver");
    if (gameOver) gameOver.classList.add("hidden");
    const abas = document.querySelector(".jogos-tabs");
    if (abas) abas.scrollIntoView({ behavior: "smooth", block: "center" });
});
configurarControlesFrango();

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepararFrango, { once: true });
else prepararFrango();

