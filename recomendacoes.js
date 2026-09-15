/* =========================================================
   Tela inicial, seleção de humor e tela de recomendação.
   ========================================================= */

if (btnIniciar) {

    btnIniciar.addEventListener("click", () => {

        mostrarTela(telas.humor);

    });

}


/* =========================================================
   VOLTAR PARA INÍCIO
   ========================================================= */

if (btnVoltarInicio) {

    btnVoltarInicio.addEventListener("click", () => {

        // Nesta página o botão pertence ao fluxo de seleção de humor.
        // Volta diretamente para a página inicial, limpando apenas o estado
        // temporário da seleção atual.
        sessionStorage.removeItem("serveup_humor");
        sessionStorage.removeItem("serveup_produto");
        sessionStorage.removeItem("serveup_recomendacao_indice");
        humorSelecionado = null;
        produtoSelecionado = null;
        recomendacaoAtualIndex = 0;
        veioDoNaoDizer = false;
        sessionStorage.removeItem("serveup_veio_nao_dizer");

        if (paginaAtualServeUp() === "humor") {
            window.location.href = "../index.html";
        } else {
            mostrarTela(telas.inicial);
        }

    });

}


/* =========================================================
   SELEÇÃO DE HUMOR
   ========================================================= */

const botoesHumor =
    document.querySelectorAll(".emoji-card");


botoesHumor.forEach(botao => {

    botao.addEventListener("click", () => {

        const humor =
            botao.dataset.humor;

        humorSelecionado = humor;
        sessionStorage.setItem("serveup_humor", humor);


        botoesHumor.forEach(item => {

            item.classList.remove("selected");

        });


        botao.classList.add("selected");


    // "Prefiro não dizer" leva diretamente ao cardápio,
// sem passar pela tela de recomendação.
if (humor === "nao-dizer") {

    veioDoNaoDizer = true;
    sessionStorage.setItem("serveup_veio_nao_dizer", "1");

    mostrarTela(telas.cardapio);

    atualizarAcessoAdmCardapio();
    adicionarCardsAdmAoCardapio();
    atualizarCardapio();

    return;
}

veioDoNaoDizer = false;
sessionStorage.removeItem("serveup_veio_nao_dizer");

mostrarRecomendacao(humor);

});

});


/* =========================================================
   MOSTRAR RECOMENDAÇÃO
   ========================================================= */

function obterOpcoesValidasRecomendacao(humor) {
    const grupo = recomendacoes[humor];
    if (!grupo || !Array.isArray(grupo.opcoes)) return [];

    // A lista é filtrada TODA vez que o humor é aberto. Assim, mesmo que
    // exista uma recomendação antiga no localStorage, produto excluído
    // nunca será exibido.
    return grupo.opcoes.filter(opcao => {
        if (!opcao?.produto) return false;
        if (typeof produtosExcluidos !== "undefined" && produtosExcluidos.includes(opcao.produto)) {
            return false;
        }
        return Object.prototype.hasOwnProperty.call(produtos, opcao.produto);
    });
}

function mostrarRecomendacao(humor, indice = 0) {

    const opcoesValidas = obterOpcoesValidasRecomendacao(humor);

    if (!opcoesValidas.length) {
        // Mesmo sem nenhuma sugestão cadastrada para este humor,
        // permanecemos na tela de recomendação. Assim o botão
        // "OUTRO HUMOR" continua disponível e sempre volta para
        // a tela de emoções.
        humorSelecionado = humor;
        produtoSelecionado = null;
        recomendacaoAtualIndex = 0;
        sessionStorage.setItem("serveup_humor", humor);
        sessionStorage.removeItem("serveup_produto");
        sessionStorage.removeItem("serveup_recomendacao_indice");

        if (nomePrato) nomePrato.textContent = "Nenhuma sugestão disponível";
        if (descRecomendacao) descRecomendacao.textContent = "Este humor ainda não possui nenhum prato selecionado. Escolha outro humor para receber uma sugestão.";
        if (precoPrato) precoPrato.textContent = "";
        if (tagRecomendacao) tagRecomendacao.textContent = "SEM SUGESTÃO";
        if (imgPrato) {
            imgPrato.removeAttribute("src");
            imgPrato.alt = "Nenhum prato recomendado";
            imgPrato.style.display = "none";
        }
        if (btnTrocarSugestao) btnTrocarSugestao.disabled = true;
        if (btnEscolherSugestao) btnEscolherSugestao.disabled = true;

        mostrarTela(telas.recomendacao);
        return;
    }

    indice = ((indice % opcoesValidas.length) + opcoesValidas.length) % opcoesValidas.length;
    const recomendacao = opcoesValidas[indice];
    const produto = produtos[recomendacao.produto];
    if (!produto) return;

    humorSelecionado = humor;
    produtoSelecionado = recomendacao.produto;
    recomendacaoAtualIndex = indice;
    sessionStorage.setItem("serveup_humor", humor);
    sessionStorage.setItem("serveup_produto", recomendacao.produto);
    sessionStorage.setItem("serveup_recomendacao_indice", String(indice));

    // Esta função pode ser chamada a partir de páginas diferentes de
    // recomendacao.html (ex.: ao escolher o humor, ou quando o ADM confirma
    // uma nova sugestão a partir do cardápio). Nesses casos os elementos da
    // tela de recomendação não existem no DOM atual, então o estado é
    // salvo/persistido normalmente, mas a renderização só acontece quando
    // realmente estamos na página certa — evitando erros de "null".
    if (btnEscolherSugestao) btnEscolherSugestao.disabled = false;

    if (nomePrato && descRecomendacao && precoPrato && tagRecomendacao && imgPrato) {
        nomePrato.textContent = produto.nome;
        descRecomendacao.textContent = recomendacao.descricao || produto.descricao;
        precoPrato.textContent = formatarPreco(produto.preco);
        tagRecomendacao.textContent = recomendacao.tag;

        if (produto.imagem) {
            imgPrato.src = produto.imagem;
            imgPrato.alt = produto.nome;
            imgPrato.style.display = "block";
        } else {
            imgPrato.removeAttribute("src");
            imgPrato.style.display = "none";
        }

        if (btnTrocarSugestao) {
            btnTrocarSugestao.textContent = opcoesValidas.length > 1
                ? `↻ TROCAR SUGESTÃO (${indice + 1}/${opcoesValidas.length})`
                : "↻ TROCAR SUGESTÃO";
            btnTrocarSugestao.disabled = opcoesValidas.length < 2;
        }
    }

    mostrarTela(telas.recomendacao);
}



/* =========================================================
   VOLTAR DA RECOMENDAÇÃO
   ========================================================= */

/* =========================================================
   VOLTAR DA RECOMENDAÇÃO
   ========================================================= */

if (btnVoltar) {

    btnVoltar.addEventListener("click", (event) => {
        event.preventDefault();

        // O botão "Outro humor" sempre deve retornar à seleção de emoções.
        // Fazemos a navegação direta para evitar que o estado da tela de
        // recomendação interfira no botão voltar.
        sessionStorage.removeItem("serveup_produto");
        sessionStorage.removeItem("serveup_recomendacao_indice");
        produtoSelecionado = null;
        recomendacaoAtualIndex = 0;

        window.location.href = "humor.html";
    });
}




