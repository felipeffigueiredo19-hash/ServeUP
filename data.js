
// Versão do cardápio: limpa produtos antigos salvos no navegador quando o cardápio é trocado.
const SERVEUP_CARDAPIO_VERSAO = "cardapio-2026-09-14-2";
if (localStorage.getItem("serveup_cardapio_versao") !== SERVEUP_CARDAPIO_VERSAO) {
    localStorage.removeItem("serveup_produtos_adm");
    localStorage.removeItem("serveup_produtos_editados");
    localStorage.removeItem("serveup_produtos_excluidos");
    localStorage.removeItem("serveup_recomendacoes_adm");
    localStorage.setItem("serveup_cardapio_versao", SERVEUP_CARDAPIO_VERSAO);
}

/* =========================================================
   Dados dos produtos do cardápio e recomendações por humor.
   ========================================================= */

/* =========================================================
   DADOS DOS PRODUTOS
   ========================================================= */
   // Precisa sobreviver a uma navegação (recarregamento real de página),
   // por isso fica espelhada no sessionStorage.
   let veioDoNaoDizer = sessionStorage.getItem("serveup_veio_nao_dizer") === "1";

const produtos = {
    "parmegiana": {
        categoria: "pratos",
        nome: "Parmegiana",
        preco: 42.00,
        descricao: "Bife empanado crocante, coberto com molho de tomate, presunto e queijo muçarela, acompanhado de arroz branco. Ingredientes: bife bovino, farinha de rosca, ovo, molho de tomate, presunto, muçarela e arroz.",
        imagem: "../imagens/parmegiana.jpg"
    },
    "macarrao-bolonhesa": {
        categoria: "pratos",
        nome: "Macarrão à Bolonhesa",
        preco: 32.90,
        descricao: "Macarrão servido com molho de tomate caseiro e carne moída bem temperada. Ingredientes: macarrão, carne moída, molho de tomate, cebola, alho e temperos.",
        imagem: "../imagens/macarrao.jpg"
    },
    "frango-grelhado": {
        categoria: "pratos",
        nome: "Frango Grelhado",
        preco: 34.90,
        descricao: "Filé de frango grelhado, acompanhado de arroz branco e temperos. Ingredientes: filé de frango, arroz, alho, sal, pimenta e azeite.",
        imagem: "../imagens/frango grelhado.jpg"
    },
    "lasanha-bolonhesa": {
        categoria: "pratos",
        nome: "Lasanha Bolonhesa",
        preco: 38.90,
        descricao: "Camadas de massa, carne moída e molho de tomate, finalizadas com queijo derretido. Ingredientes: massa de lasanha, carne moída, molho de tomate, cebola, alho, muçarela e parmesão.",
        imagem: "../imagens/lasanha.jpg"
    },
    "lasanha-queijos": {
        categoria: "pratos",
        nome: "Lasanha de Queijos",
        preco: 39.90,
        descricao: "Lasanha cremosa preparada com molho branco e uma combinação de queijos. Ingredientes: massa de lasanha, leite, creme de leite, farinha de trigo, manteiga, muçarela, parmesão e provolone.",
        imagem: "../imagens/lasanha.jpg"
    },
    "bife-acebolado": {
        categoria: "pratos",
        nome: "Bife Acebolado",
        preco: 39.90,
        descricao: "Bife grelhado acompanhado de cebolas douradas e bem temperadas. Ingredientes: bife bovino, cebola, alho, sal, pimenta e azeite.",
        imagem: "../imagens/bife.png"
    },
    "peixe-milanesa": {
        categoria: "pratos",
        nome: "Peixe à Milanesa",
        preco: 42.90,
        descricao: "Filé de peixe empanado e dourado, acompanhado de arroz branco. Ingredientes: filé de peixe, farinha de trigo, ovo, farinha de rosca, arroz, limão e temperos.",
        imagem: "../imagens/file.jpg"
    },
    "frango-empanado": {
        categoria: "pratos",
        nome: "Frango Empanado",
        preco: 36.90,
        descricao: "Filé de frango empanado e crocante, acompanhado de arroz branco. Ingredientes: filé de frango, farinha de trigo, ovo, farinha de rosca, arroz e temperos.",
        imagem: "../imagens/frango.jpg"
    },
    "coca-cola-lata": {
        categoria: "bebidas",
        nome: "Coca-Cola Lata",
        preco: 6.50,
        descricao: "Refrigerante de cola servido bem gelado.",
        imagem: "../imagens/coca.jpg"
    },
    "coca-zero-lata": {
        categoria: "bebidas",
        nome: "Coca-Cola Zero Lata",
        preco: 6.50,
        descricao: "Refrigerante de cola sem açúcar, servido bem gelado.",
        imagem: "../imagens/coca.jpg"
    },
    "fanta-laranja-lata": {
        categoria: "bebidas",
        nome: "Fanta Laranja Lata",
        preco: 6.50,
        descricao: "Refrigerante sabor laranja, servido bem gelado.",
        imagem: "../imagens/fanta.jpg"
    },
    "fanta-uva-lata": {
        categoria: "bebidas",
        nome: "Fanta Uva Lata",
        preco: 6.50,
        descricao: "Refrigerante sabor uva, servido bem gelado.",
        imagem: "../imagens/fanta uva.jpg"
    },
    "sprite-lata": {
        categoria: "bebidas",
        nome: "Sprite Lata",
        preco: 6.50,
        descricao: "Refrigerante sabor limão, leve e refrescante.",
        imagem: "../imagens/sprite.jpg"
    },
    "agua": {
        categoria: "bebidas",
        nome: "Água",
        preco: 4.00,
        descricao: "Água mineral servida gelada.",
        imagem: "../imagens/agua sem.jpg"
    },
    "agua-com-gas": {
        categoria: "bebidas",
        nome: "Água com Gás",
        preco: 4.50,
        descricao: "Água mineral gaseificada, servida gelada.",
        imagem: "../imagens/agua gas.jpg"
    },
    "coca-2l": {
        categoria: "bebidas",
        nome: "Coca-Cola 2L",
        preco: 13.00,
        descricao: "Refrigerante de cola em garrafa de 2 litros.",
        imagem: "../imagens/coca garra.jpg"
    },
    "suco-laranja-1l": {
        categoria: "bebidas",
        nome: "Jarra de suco de laranja",
        preco: 12.00,
        descricao: "Suco de laranja refrescante, servido gelado.",
        imagem: "../imagens/orange.jpg"
    },
    "suco-maracuja-1l": {
        categoria: "bebidas",
        nome: "Jarra de suco de maracujá",
        preco: 12.00,
        descricao: "Suco de maracujá refrescante, servido gelado.",
        imagem: "../imagens/suco mara.jpg"
    },
    "suco-limao-1l": {
        categoria: "bebidas",
        nome: "Jarra de suco de limão",
        preco: 11.00,
        descricao: "Suco de limão refrescante, servido gelado.",
        imagem: "../imagens/suco limon.jpg"
    },
    "brownie": {
        categoria: "sobremesas",
        nome: "Brownie",
        preco: 12.00,
        descricao: "Brownie de chocolate macio por dentro, com sabor intenso de chocolate. Ingredientes: chocolate, cacau em pó, farinha de trigo, açúcar, ovos, manteiga e baunilha.",
        imagem: "../imagens/brownie.jpg"
    },
    "petit-gateau": {
        categoria: "sobremesas",
        nome: "Petit Gâteau",
        preco: 15.00,
        descricao: "Bolinho de chocolate com casca assada e recheio cremoso, servido como sobremesa especial. Ingredientes: chocolate, farinha de trigo, açúcar, ovos e manteiga.",
        imagem: "../imagens/petit-gateau.jpg"
    },
    "sorvete-baunilha": {
        categoria: "sobremesas",
        nome: "Sorvete de Baunilha",
        preco: 9.00,
        descricao: "Sorvete cremoso e suave, com sabor clássico de baunilha. Ingredientes: leite, creme de leite, açúcar e essência de baunilha.",
        imagem: "../imagens/sorvete branco.jpg"
    },
    "sorvete-chocolate": {
        categoria: "sobremesas",
        nome: "Sorvete de Chocolate",
        preco: 9.00,
        descricao: "Sorvete cremoso e intenso, preparado com sabor de chocolate. Ingredientes: leite, creme de leite, açúcar, chocolate e cacau em pó.",
        imagem: "../imagens/sorvete marrom.jpg"
    },
    "gelatina": {
        categoria: "sobremesas",
        nome: "Gelatina",
        preco: 7.00,
        descricao: "Sobremesa leve, colorida e refrescante, perfeita para finalizar a refeição. Ingredientes: água e pó de gelatina de morango.",
        imagem: "../imagens/gelatina.jpg"
    },
    "mousse-limao": {
        categoria: "sobremesas",
        nome: "Mousse de Limão",
        preco: 10.00,
        descricao: "Mousse cremoso com sabor cítrico e refrescante de limão. Ingredientes: leite condensado, creme de leite e suco de limão.",
        imagem: "../imagens/mousse L.jpg"
    },
    "mousse-maracuja": {
        categoria: "sobremesas",
        nome: "Mousse de Maracujá",
        preco: 10.00,
        descricao: "Mousse cremoso e aerado, com sabor marcante e refrescante de maracujá. Ingredientes: leite condensado, creme de leite e suco ou polpa de maracujá.",
        imagem: "../imagens/mousse.jpg"
    }
};

/*
 * Garante que TODO produto tenha um ID estável.
 * Os produtos escritos diretamente no código antes não possuíam
 * a propriedade "id", por isso os botões EDITAR e as recomendações
 * não conseguiam identificar esses itens. O nome da chave do objeto
 * vira o ID oficial do produto.
 */
Object.entries(produtos).forEach(([id, produto]) => {
    if (!produto.id) produto.id = id;
});


/* =========================================================
   RECOMENDAÇÕES POR HUMOR
   ========================================================= */

const recomendacoes = {
    feliz: { opcoes: [
        { produto: "parmegiana", titulo: "Uma escolha caprichada para acompanhar seu bom humor.", descricao: "Bife empanado, molho de tomate, presunto e muçarela, acompanhado de arroz. Ingredientes: bife bovino, farinha de rosca, ovo, molho de tomate, presunto, muçarela e arroz.", tag: "PARA APROVEITAR" },
        { produto: "petit-gateau", titulo: "Um doce especial para deixar o momento ainda melhor.", descricao: "Petit gâteau de chocolate com recheio cremoso.", tag: "MUITO SABOR" }
    ] },
    cansado: { opcoes: [
        { produto: "macarrao-bolonhesa", titulo: "Comida quentinha para uma pausa gostosa.", descricao: "Macarrão com molho de tomate e carne moída. Ingredientes: macarrão, carne moída, molho de tomate, cebola, alho e temperos.", tag: "CONFORTO" },
        { produto: "lasanha-queijos", titulo: "Uma opção quentinha e tranquila.", descricao: "Lasanha cremosa de queijos. Ingredientes: massa de lasanha, molho branco, muçarela, parmesão e provolone.", tag: "COMIDA CASEIRA" }
    ] },
    estressante: { opcoes: [
        { produto: "frango-grelhado", titulo: "Uma escolha leve para sua pausa.", descricao: "Filé de frango grelhado com arroz. Ingredientes: filé de frango, arroz, alho, sal, pimenta e azeite.", tag: "MAIS LEVE" },
        { produto: "suco-maracuja-1l", titulo: "Uma bebida refrescante para acompanhar.", descricao: "Suco de maracujá servido gelado.", tag: "REFRESCANTE" }
    ] },
    triste: { opcoes: [
        { produto: "lasanha-bolonhesa", titulo: "Uma escolha quentinha e caprichada.", descricao: "Lasanha de carne com queijo. Ingredientes: massa de lasanha, carne moída, molho de tomate, muçarela e parmesão.", tag: "RECONFORTANTE" },
        { produto: "brownie", titulo: "Uma sobremesa especial para finalizar.", descricao: "Brownie de chocolate macio e intenso.", tag: "ESCOLHA ESPECIAL" }
    ] },
    "nao-dizer": { opcoes: [
        { produto: "parmegiana", titulo: "Deixa o ServeUp escolher por você.", descricao: "Bife empanado, molho de tomate, presunto e muçarela, acompanhado de arroz. Ingredientes: bife bovino, farinha de rosca, ovo, molho de tomate, presunto, muçarela e arroz.", tag: "ESCOLHA DO SERVEUP" },
        { produto: "macarrao-bolonhesa", titulo: "Outra escolha cheia de sabor.", descricao: "Macarrão com molho de tomate e carne moída. Ingredientes: macarrão, carne moída, molho de tomate, cebola, alho e temperos.", tag: "OUTRA ESCOLHA" }
    ] }
};

/* =========================================================
   CONFIGURAÇÕES EDITÁVEIS PELO ADM
   ========================================================= */

const RECOMENDACOES_ADM_KEY = "serveup_recomendacoes_adm";
const PRODUTOS_EDITADOS_KEY = "serveup_produtos_editados";
const PRODUTOS_EXCLUIDOS_KEY = "serveup_produtos_excluidos";

// Produtos excluídos pelo administrador ficam gravados neste navegador.
// Assim, um produto definido diretamente no código também deixa de aparecer
// depois de recarregar a página. O botão "RESTAURAR PRATOS" pode desfazer
// a exclusão dos produtos que vieram originalmente do código.
function carregarProdutosExcluidos() {
    try {
        const salvos = JSON.parse(localStorage.getItem(PRODUTOS_EXCLUIDOS_KEY) || "[]");
        return Array.isArray(salvos) ? salvos : [];
    } catch (erro) {
        return [];
    }
}

function salvarProdutosExcluidos() {
    localStorage.setItem(PRODUTOS_EXCLUIDOS_KEY, JSON.stringify(produtosExcluidos));
}

const PRODUTOS_CODIGO_IDS = Object.keys(produtos);
let produtosExcluidos = carregarProdutosExcluidos();

function carregarRecomendacoesAdm() {
    try {
        const salvas = JSON.parse(localStorage.getItem(RECOMENDACOES_ADM_KEY) || "null");
        if (!salvas) return;
        Object.keys(salvas).forEach(humor => {
            if (Array.isArray(salvas[humor])) recomendacoes[humor] = { opcoes: salvas[humor] };
        });
    } catch (erro) {
        console.warn("Não foi possível carregar as recomendações do ADM.", erro);
    }
}

function salvarRecomendacoesAdm() {
    // Nunca grava nas recomendações um produto que já foi excluído.
    const limpas = Object.fromEntries(
        Object.entries(recomendacoes).map(([humor, grupo]) => [
            humor,
            (grupo?.opcoes || []).filter(opcao =>
                opcao?.produto && !produtosExcluidos.includes(opcao.produto)
            )
        ])
    );

    localStorage.setItem(RECOMENDACOES_ADM_KEY, JSON.stringify(limpas));
}

function limparRecomendacoesDeProdutosExcluidos() {
    Object.values(recomendacoes).forEach(grupo => {
        if (!Array.isArray(grupo?.opcoes)) return;
        grupo.opcoes = grupo.opcoes.filter(opcao =>
            opcao?.produto && !produtosExcluidos.includes(opcao.produto)
        );
    });
}

function carregarProdutosEditados() {
    try {
        return JSON.parse(localStorage.getItem(PRODUTOS_EDITADOS_KEY) || "{}");
    } catch (erro) {
        return {};
    }
}

const produtosEditados = carregarProdutosEditados();
Object.entries(produtosEditados).forEach(([id, dados]) => {
    if (produtos[id]) produtos[id] = normalizarProdutoIngredientes({ ...produtos[id], ...dados, id });
});

// Corrige registros antigos que foram salvos com "Ingredientes:" dentro
// da descrição e grava a versão limpa para não voltar a aparecer no cardápio.
Object.values(produtos).forEach(normalizarProdutoIngredientes);
try {
    localStorage.setItem(PRODUTOS_EDITADOS_KEY, JSON.stringify(produtosEditados));
} catch (erro) {}

// As exclusões são permanentes neste navegador e precisam ser aplicadas
// antes de carregar/usar as recomendações. Isso evita que uma recomendação
// antiga do localStorage faça um produto excluído voltar a aparecer.
carregarRecomendacoesAdm();
limparRecomendacoesDeProdutosExcluidos();
salvarRecomendacoesAdm();

/* =========================================================
   Estado global da aplicação e referências aos elementos do HTML.
   ========================================================= */

let humorSelecionado = sessionStorage.getItem("serveup_humor") || null;

let produtoSelecionado = sessionStorage.getItem("serveup_produto") || null;

let recomendacaoAtualIndex = Number(sessionStorage.getItem("serveup_recomendacao_indice") || 0);

// O carrinho acompanha a navegação entre telas e é limpo pelo fluxo de novo pedido.
let carrinho = {};
try { carrinho = JSON.parse(localStorage.getItem("serveup_carrinho") || "{}"); } catch (erro) { carrinho = {}; }

let categoriaAtual = "pratos";


// Dados simples do painel administrativo.
let totalPedidosAdm = Number(localStorage.getItem("serveup_total_pedidos") || 0);
let historicoHumoresAdm = JSON.parse(localStorage.getItem("serveup_humores") || "{}");

let usuarioLogado = null;

let perfilLogado = sessionStorage.getItem("serveup_perfil") || null;

/* Produtos adicionados pelo ADM ficam salvos neste navegador. */
const PRODUTOS_ADM_KEY = "serveup_produtos_adm";

function normalizarProdutoIngredientes(produto) {
    if (!produto || typeof produto !== "object") return produto;
    const descricaoOriginal = String(produto.descricao || "").trim();
    const ingredientesExistentes = String(produto.ingredientes || "").trim();
    const partes = descricaoOriginal.split(/\s*Ingredientes\s*:/i);
    if (partes.length > 1) {
        produto.descricao = partes[0].trim();
        if (!ingredientesExistentes) produto.ingredientes = partes.slice(1).join("Ingredientes:").trim();
    }
    return produto;
}

function carregarProdutosAdm() {
    try {
        const salvos = JSON.parse(localStorage.getItem(PRODUTOS_ADM_KEY)) || [];
        const lista = Array.isArray(salvos) ? salvos.map(normalizarProdutoIngredientes) : [];
        localStorage.setItem(PRODUTOS_ADM_KEY, JSON.stringify(lista));
        return lista;
    } catch (erro) {
        return [];
    }
}

const produtosAdm = carregarProdutosAdm();

produtosAdm.forEach(produto => {
    produtos[produto.id] = produto;
});

/* Credenciais do protótipo. Em produção, a autenticação deve ser feita no servidor. */
const CREDENCIAIS_ADM = {
    usuario: "programmer",
    senha: "feccetec"
};


/* =========================================================
   ELEMENTOS DAS TELAS
   ========================================================= */

/*
 * Cada página real só contém o próprio elemento de tela no DOM (as demais
 * telas vivem em outros arquivos .html). Por isso `telas` guarda apenas os
 * IDs (strings), e não os elementos em si — assim mostrarTela() consegue
 * decidir para qual página navegar mesmo quando o elemento de destino não
 * existe na página atual.
 */
const telas = {

    login: "telaLogin",

    inicial: "telaInicial",

    humor: "telaHumor",

    recomendacao: "telaRecomendacao",

    pedido: "telaPedido",

    cardapio: "telaCardapio",

    pedidoPreparo: "telaPedidoPreparo",

    pedidoPronto: "telaPedidoPronto"

};


/* =========================================================
   ELEMENTOS DO HTML
   ========================================================= */

const formLoginAdm =
    document.getElementById("formLoginAdm");

const admUsuario =
    document.getElementById("admUsuario");

const admSenha =
    document.getElementById("admSenha");

const admErro =
    document.getElementById("admErro");

const btnAbrirLoginAdm =
    document.getElementById("btnAbrirLoginAdm");

const btnVoltarLogin =
    document.getElementById("btnVoltarLogin");

const pedidoResumoItens =
    document.getElementById("pedidoResumoItens");

const btnIniciar =
    document.getElementById("btnIniciar");

const btnVoltarInicio =
    document.getElementById("btnVoltarInicio");

const btnVoltar =
    document.getElementById("btnVoltar");

const btnCardapioCompleto =
    document.getElementById("btnCardapioCompleto");

const btnVoltarCardapio =
    document.getElementById("btnVoltarCardapio");

const btnVoltarConfirmacao =
    document.getElementById("btnVoltarConfirmacao");

const btnEscolherSugestao =
    document.getElementById("btnEscolherSugestao");

const btnGarcom =
    document.getElementById("btnGarcom");

const btnNovoPedido =
    document.getElementById("btnNovoPedido");

const btnAbrirJogos =
    document.getElementById("btnAbrirJogos");

const painelJogos =
    document.getElementById("painelJogos");

const btnFecharJogos =
    document.getElementById("btnFecharJogos");

const btnAbrirCarrinho =
    document.getElementById("btnAbrirCarrinho");

const btnFecharCarrinho =
    document.getElementById("btnFecharCarrinho");

const btnFinalizarCarrinho =
    document.getElementById("btnFinalizarCarrinho");

const carrinhoLateral =
    document.getElementById("carrinhoLateral");

const carrinhoOverlay =
    document.getElementById("carrinhoOverlay");

const carrinhoItens =
    document.getElementById("carrinhoItens");

const carrinhoTotal =
    document.getElementById("carrinhoTotal");

const contadorCarrinho =
    document.getElementById("contadorCarrinho");

const campoBusca =
    document.getElementById("campoBusca");

const btnLimparBusca =
    document.getElementById("btnLimparBusca");

const cardapioLista =
    document.getElementById("cardapioLista");

const semResultados =
    document.getElementById("semResultados");

const imgPrato =
    document.getElementById("imgPrato");

const nomePrato =
    document.getElementById("nomePrato");

const descRecomendacao =
    document.getElementById("descRecomendacao");

const precoPrato =
    document.getElementById("precoPrato");

const tagRecomendacao =
    document.getElementById("tagRecomendacao");

const precoPedido =
    document.getElementById("precoPedido");

const numeroPedido =
    document.getElementById("numeroPedido");

const btnAdicionarComida =
    document.getElementById("btnAdicionarComida");

const adminActions = document.getElementById("adminActions");
const adminStatus = document.getElementById("adminStatus");
const btnSairAdm = document.getElementById("btnSairAdm");
const btnPainelAdm = document.getElementById("btnPainelAdm");
const btnFecharPainelAdm = document.getElementById("btnFecharPainelAdm");
const btnAtualizarPainelAdm = document.getElementById("btnAtualizarPainelAdm");
const modalPainelAdm = document.getElementById("modalPainelAdm");
const btnTrocarSugestao = document.getElementById("btnTrocarSugestao");

const modalAdicionarComida =
    document.getElementById("modalAdicionarComida");

const btnFecharAdicionarComida =
    document.getElementById("btnFecharAdicionarComida");

const formAdicionarComida =
    document.getElementById("formAdicionarComida");

const modalGerenciarAdm = document.getElementById("modalGerenciarAdm");
const btnGerenciarAdm = document.getElementById("btnGerenciarAdm");
const btnFecharGerenciarAdm = document.getElementById("btnFecharGerenciarAdm");
const listaGerenciarProdutos = document.getElementById("listaGerenciarProdutos");
const listaRecomendacoesAdm = document.getElementById("listaRecomendacoesAdm");
const editorProdutoAdm = document.getElementById("editorProdutoAdm");
const editorProdutoTitulo = document.getElementById("editorProdutoTitulo");
const editorProdutoId = document.getElementById("editorProdutoId");
const editorProdutoNome = document.getElementById("editorProdutoNome");
const editorProdutoPreco = document.getElementById("editorProdutoPreco");
const editorProdutoDescricao = document.getElementById("editorProdutoDescricao");
const editorProdutoIngredientes = document.getElementById("editorProdutoIngredientes");
const editorProdutoImagem = document.getElementById("editorProdutoImagem");
const editorProdutoImagemArquivo = document.getElementById("editorProdutoImagemArquivo");
const btnConfirmarAlteracaoProduto = document.getElementById("btnConfirmarAlteracaoProduto");
const btnCancelarAlteracaoProduto = document.getElementById("btnCancelarAlteracaoProduto");

const novaComidaNome =
    document.getElementById("novaComidaNome");

const novaComidaPreco =
    document.getElementById("novaComidaPreco");

const novaComidaDescricao =
    document.getElementById("novaComidaDescricao");
const novaComidaIngredientes =
    document.getElementById("novaComidaIngredientes");

const novaComidaCategoria =
    document.getElementById("novaComidaCategoria");

const novaComidaImagem =
    document.getElementById("novaComidaImagem");

const novaComidaImagemArquivo =
    document.getElementById("novaComidaImagemArquivo");

const erroAdicionarComida =
    document.getElementById("erroAdicionarComida");
