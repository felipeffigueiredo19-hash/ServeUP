/* =========================================================
   PREPARAR CONFIRMAÇÃO
   ========================================================= */

function prepararConfirmacao() {

    if (!pedidoResumoItens || !precoPedido) {
        return;
    }

    const ids = Object.keys(carrinho);

    pedidoResumoItens.innerHTML = "";

    let total = 0;

    ids.forEach(id => {

        const produto = produtos[id];
        const quantidade = carrinho[id];

        if (!produto || !quantidade) {
            return;
        }

        const subtotal = produto.preco * quantidade;
        total += subtotal;

        const item = document.createElement("div");
        item.className = "pedido-resumo-item";

        item.innerHTML = `
            <div class="pedido-resumo-item-info">
                <h3>${produto.nome}</h3>
                <span>${quantidade} ${quantidade === 1 ? "unidade" : "unidades"}</span>
            </div>

            <strong>${formatarPreco(subtotal)}</strong>
        `;

        pedidoResumoItens.appendChild(item);

    });

    if (ids.length === 0) {
        pedidoResumoItens.innerHTML = `
            <div class="pedido-resumo-vazio">
                Nenhum item no carrinho.
            </div>
        `;
    }

    precoPedido.textContent = formatarPreco(total);

}

/* =========================================================
   CONFIRMAR RECOMENDAÇÃO DIRETAMENTE
   ========================================================= */

if (btnEscolherSugestao) {

    /*
       O evento principal já foi configurado acima.
       Esta parte existe apenas para manter
       o fluxo organizado.
    */

}


/* =========================================================
   BOTÃO DE VOLTAR DA CONFIRMAÇÃO
   ========================================================= */

if (btnVoltarConfirmacao) {

    btnVoltarConfirmacao.addEventListener(
        "click",
        () => {

            mostrarTela(
                telas.cardapio
            );

            atualizarCardapio();

        }
    );

}


/* =========================================================
   CONFIRMAR PEDIDO
   ========================================================= */

if (btnGarcom) {

    btnGarcom.addEventListener(
        "click",
        () => {

            if (!Object.keys(carrinho).length) {
                mostrarNotificacao("Seu carrinho está vazio.");
                return;
            }

            // Gera o número sequencial do pedido durante a sessão atual.
            // O sessionStorage é limpo quando o site/sessão do navegador é encerrado,
            // então a contagem começa novamente em #001 ao abrir o site de novo.
            let contadorPedido = Number(
                sessionStorage.getItem("serveup_contador_pedido") || "0"
            );

            contadorPedido = (contadorPedido + 1) % 1000;

            const numero = String(contadorPedido).padStart(3, "0");

            sessionStorage.setItem(
                "serveup_contador_pedido",
                String(contadorPedido)
            );

            // numeroPedido e a estimativa de preparo pertencem às telas de
            // pedido-pronto / pedido-preparo, que só existem depois de uma
            // navegação (recarregamento de página). Por isso ficam salvos
            // no sessionStorage e são lidos quando essas páginas carregam.
            sessionStorage.setItem("serveup_numero_pedido", String(numero));
            sessionStorage.setItem("serveup_estimativa_preparo", calcularEstimativa());

            // Registra o pedido e o humor escolhido para o painel do ADM.
            totalPedidosAdm++;
            localStorage.setItem("serveup_total_pedidos", String(totalPedidosAdm));

            const humorRegistrado = humorSelecionado || "nao-dizer";
            historicoHumoresAdm[humorRegistrado] = (historicoHumoresAdm[humorRegistrado] || 0) + 1;
            localStorage.setItem("serveup_humores", JSON.stringify(historicoHumoresAdm));


            // Limpa o carrinho e segue diretamente para a tela de preparo.
            limparCarrinhoComAnimacao(() => {
                iniciarEsperaPedido();
            });


            /*
                Aqui você pode futuramente
                conectar com banco de dados,
                sistema do restaurante,
                WhatsApp ou API.
            */

        }
    );

}


/* =========================================================
   LIMPAR CARRINHO COM ANIMAÇÃO
   ========================================================= */

/* Limpa o carrinho imediatamente (sem animação) */
function limparCarrinhoComAnimacao(callback) {
    carrinho = {};
    atualizarCarrinho();
    if (callback) callback();
}


/* =========================================================
   CANCELAR PEDIDO E VOLTAR PARA A TELA INICIAL
   ========================================================= */

const btnCancelarPedido = document.getElementById("btnCancelarPedido");

if (btnCancelarPedido) {
    btnCancelarPedido.addEventListener("click", () => {
        pararCorridaKart();
        carrinho = {};
        produtoSelecionado = null;
        humorSelecionado = null;
        localStorage.removeItem("serveup_carrinho");
        sessionStorage.removeItem("serveup_numero_pedido");
        sessionStorage.removeItem("serveup_estimativa_preparo");
        sessionStorage.removeItem("serveup_humor");
        sessionStorage.removeItem("serveup_produto");
        window.location.href = "../index.html";
    });
}

const btnNovoPedidoPreparo = document.getElementById("btnNovoPedidoPreparo");

if (btnNovoPedidoPreparo) {
    btnNovoPedidoPreparo.addEventListener("click", () => {
        pararCorridaKart();
        carrinho = {};
        produtoSelecionado = null;
        humorSelecionado = null;
        localStorage.removeItem("serveup_carrinho");
        sessionStorage.removeItem("serveup_numero_pedido");
        sessionStorage.removeItem("serveup_estimativa_preparo");
        sessionStorage.removeItem("serveup_humor");
        sessionStorage.removeItem("serveup_produto");
        window.location.href = "cardapio.html";
    });
}


/* =========================================================
   NOVO PEDIDO
   ========================================================= */

if (btnNovoPedido) {

    btnNovoPedido.addEventListener(
        "click",
        () => {

            carrinho = {};

            produtoSelecionado =
                null;

            humorSelecionado =
                null;


            atualizarCarrinho();


            botoesHumor.forEach(
                botao => {

                    botao.classList.remove(
                        "selected"
                    );

                }
            );


            mostrarTela(
                telas.inicial
            );

        }
    );

}
/* =========================================================
   Notificações e cálculo da estimativa de preparo do pedido.
   ========================================================= */

const btnVoltarPreparo = document.getElementById("btnVoltarPreparo");

if (btnVoltarPreparo) {
    btnVoltarPreparo.addEventListener("click", () => {
        pararCorridaKart();
        mostrarTela(telas.cardapio);
    });
}


/* =========================================================
   NOTIFICAÇÃO
   ========================================================= */

function mostrarNotificacao(
    mensagem
) {

    const antiga =
        document.querySelector(
            ".serveup-notificacao"
        );


    if (antiga) {

        antiga.remove();

    }


    const notificacao =
        document.createElement("div");


    notificacao.className =
        "serveup-notificacao";


    notificacao.textContent =
        mensagem;


    notificacao.style.position =
        "fixed";


    notificacao.style.left =
        "50%";


    notificacao.style.bottom =
        "90px";


    notificacao.style.transform =
        "translateX(-50%) translateY(15px)";


    notificacao.style.zIndex =
        "999";


    notificacao.style.padding =
        "12px 18px";


    notificacao.style.border =
        "1px solid rgba(216,166,60,0.35)";


    notificacao.style.borderRadius =
        "12px";


    notificacao.style.background =
        "rgba(24,20,14,0.96)";


    notificacao.style.color =
        "#f7f2e8";


    notificacao.style.fontFamily =
        "Poppins, sans-serif";


    notificacao.style.fontSize =
        "10px";


    notificacao.style.fontWeight =
        "600";


    notificacao.style.boxShadow =
        "0 15px 40px rgba(0,0,0,0.4)";


    notificacao.style.opacity =
        "0";


    notificacao.style.transition =
        "all 0.25s ease";


    document.body.appendChild(
        notificacao
    );


    requestAnimationFrame(() => {

        notificacao.style.opacity =
            "1";

        notificacao.style.transform =
            "translateX(-50%) translateY(0)";

    });


    setTimeout(() => {

        notificacao.style.opacity =
            "0";

        notificacao.style.transform =
            "translateX(-50%) translateY(15px)";


        setTimeout(() => {

            notificacao.remove();

        }, 250);

    }, 1800);

}


/* =========================================================
   FECHAR CARRINHO AO REDIMENSIONAR
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 1000
        ) {

            /*
                Mantém o comportamento
                estável em telas grandes.
            */

        }

    }
);



/* =========================================================
   PEDIDO EM PREPARO + CORRIDA DE KART SERVEUP
   ========================================================= */

function pararCorridaKart() {
    if (window.kartAnimationFrame) {
        cancelAnimationFrame(window.kartAnimationFrame);
        window.kartAnimationFrame = null;
    }
    window.kartAtivo = false;
}

/**
 * Calcula a estimativa de tempo com base nos itens do carrinho.
 * Pratos têm preparo mais longo que bebidas/sobremesas.
 */
function calcularEstimativa() {
    const ids = Object.keys(carrinho);
    let temPrato = false;
    let temBebida = false;

    ids.forEach(id => {
        const p = produtos[id];
        if (!p) return;
        // Pratos da lista original
        if (["prato-feito", "strogonoff", "feijoada", "caesar"].includes(id)) {
            temPrato = true;
        } else if (["suco-maracuja", "refrigerante"].includes(id)) {
            temBebida = true;
        }
        // Produtos adicionados pelo ADM: assume prato se não for bebida/sobremesa
        if (p.categoria === "pratos") temPrato = true;
        if (p.categoria === "bebidas") temBebida = true;
    });

    if (temPrato) return "15 a 20 min";
    if (temBebida) return "5 a 10 min";
    return "10 a 15 min"; // sobremesas ou mix sem prato
}

function iniciarEsperaPedido() {
    pararCorridaKart();

    // Preenche estimativa dinâmica. Como o carrinho já foi limpo ao
    // confirmar o pedido, a estimativa calculada naquele momento fica
    // salva no sessionStorage; calcularEstimativa() aqui é só um fallback.
    const numeroEl = document.getElementById("numeroPedidoPreparo");
    if (numeroEl) {
        const numero = sessionStorage.getItem("serveup_numero_pedido");
        numeroEl.textContent = numero ? `#${numero}` : "#000";
    }

    const elEstimativa = document.getElementById("estimativaTempo");
    if (elEstimativa) {
        elEstimativa.textContent = sessionStorage.getItem("serveup_estimativa_preparo") || calcularEstimativa();
    }

    // Fecha painel de jogo se estiver aberto
    const pJogos = document.getElementById("painelJogos");
    const bJogos = document.getElementById("btnAbrirJogos");
    if (pJogos) pJogos.classList.add("hidden");
    if (bJogos) bJogos.classList.remove("hidden");

    mostrarTela(telas.pedidoPreparo);
}


if (btnAbrirJogos) {
    btnAbrirJogos.addEventListener("click", () => {
        // Os jogos agora possuem uma tela própria.
        window.location.href = "jogos.html";
    });
}
