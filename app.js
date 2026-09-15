/* =========================================================
   Inicialização e navegação multipágina do ServeUp.
   ========================================================= */

const ROTAS_SERVEUP = {
    telaInicial: "index.html",
    telaLogin: "login.html",
    telaHumor: "humor.html",
    telaRecomendacao: "recomendacao.html",
    telaPedido: "pedido.html",
    telaCardapio: "cardapio.html",
    telaPedidoPreparo: "pedido-preparo.html"
};

function paginaAtualServeUp() {
    return document.body?.dataset?.page || "home";
}

function idTelaParaPagina(id) {
    const mapa = {
        telaInicial: "home", telaLogin: "login", telaHumor: "humor",
        telaRecomendacao: "recomendacao", telaPedido: "pedido",
        telaCardapio: "cardapio", telaPedidoPreparo: "pedido-preparo"
    };
    return mapa[id] || null;
}

function mostrarTela(telaId) {
    if (!telaId) return;
    const paginaDestino = idTelaParaPagina(telaId);
    const paginaAtual = paginaAtualServeUp();

    if (paginaDestino && paginaDestino !== paginaAtual) {
        const rota = ROTAS_SERVEUP[telaId];
        if (rota) {
            const destino = paginaAtual === "home" ? `html/${rota}` : (rota === "index.html" ? "../index.html" : rota);
            window.location.href = destino;
            return;
        }
    }

    // Já estamos na página correta: apenas garante que a tela fique marcada
    // como ativa (o elemento existe, pois pertence à página atual).
    const elemento = document.getElementById(telaId);
    if (elemento) {
        document.querySelectorAll(".screen").forEach(item => item.classList.remove("active"));
        elemento.classList.add("active");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function inicializarRotaAdmin() {
    if (paginaAtualServeUp() !== "administrador") return;
    if (perfilLogado !== "adm") { window.location.href = "login.html"; return; }
    const view = new URLSearchParams(window.location.search).get("view") || "gerenciar";
    if (view === "painel") abrirPainelAdm();
    else if (view === "adicionar") abrirModalAdicionarComida();
    else abrirGerenciadorAdm();
}

function inicializarServeUp() {
    if (paginaAtualServeUp() === "home") {
        // A página inicial é o ponto de entrada; um recarregamento nela começa
        // um novo fluxo, como acontecia na versão de uma única página.
        localStorage.removeItem("serveup_carrinho");
        carrinho = {};
        humorSelecionado = null;
        produtoSelecionado = null;
        recomendacaoAtualIndex = 0;
        sessionStorage.removeItem("serveup_humor");
        sessionStorage.removeItem("serveup_produto");
        sessionStorage.removeItem("serveup_recomendacao_indice");
        sessionStorage.removeItem("serveup_veio_nao_dizer");
        sessionStorage.removeItem("serveup_numero_pedido");
        sessionStorage.removeItem("serveup_estimativa_preparo");
        veioDoNaoDizer = false;
    }

    atualizarCarrinho();
    atualizarAcessoAdmCardapio();
    sincronizarProdutosCardapioGerenciador();
    atualizarCardapio();

    // Na tela de recomendação, restaura o estado que veio da seleção de humor.
    if (paginaAtualServeUp() === "recomendacao" && humorSelecionado) {
        mostrarRecomendacao(humorSelecionado, recomendacaoAtualIndex);
    }

    // Na tela de confirmação do pedido, preenche o resumo com os itens
    // atuais do carrinho (sem isso a tela sempre aparecia vazia).
    if (paginaAtualServeUp() === "pedido") {
        prepararConfirmacao();
    }

    inicializarRotaAdmin();
}

inicializarServeUp();
