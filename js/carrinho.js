/* =========================================================
   ADICIONAR AO CARRINHO
   ========================================================= */

function adicionarAoCarrinho(id) {

    if (!produtos[id]) {

        return;

    }


    if (!carrinho[id]) {

        carrinho[id] = 0;

    }


    carrinho[id]++;


    atualizarCarrinho();
    localStorage.setItem("serveup_carrinho", JSON.stringify(carrinho));

}


/* =========================================================
   REMOVER DO CARRINHO
   ========================================================= */

function removerDoCarrinho(id) {

    if (!carrinho[id]) {

        return;

    }


    carrinho[id]--;


    if (carrinho[id] <= 0) {

        delete carrinho[id];

    }


    atualizarCarrinho();
    localStorage.setItem("serveup_carrinho", JSON.stringify(carrinho));

}


/* =========================================================
   ATUALIZAR CARRINHO
   ========================================================= */

function atualizarCarrinho() {

    if (!carrinhoItens || !carrinhoTotal || !contadorCarrinho) return;

    carrinhoItens.innerHTML = "";


    const ids =
        Object.keys(carrinho);


    let quantidadeTotal = 0;

    let valorTotal = 0;


    if (ids.length === 0) {

        carrinhoItens.innerHTML = `

            <div class="carrinho-vazio">

                <div class="carrinho-vazio-icone">
                    🛒
                </div>

                <h4>
                    Seu carrinho está vazio
                </h4>

                <p>
                    Adicione pratos, bebidas ou
                    sobremesas para começar seu pedido.
                </p>

            </div>

        `;


        carrinhoTotal.textContent =
            formatarPreco(0);


        contadorCarrinho.textContent =
            "0";


        return;

    }


    ids.forEach(id => {

        const produto =
            produtos[id];

        // Se o produto foi excluído pelo ADM enquanto estava no carrinho
        // de alguém, remove essa entrada em vez de quebrar a tela.
        if (!produto) {
            delete carrinho[id];
            return;
        }


        const quantidade =
            carrinho[id];


        quantidadeTotal +=
            quantidade;


        valorTotal +=
            produto.preco *
            quantidade;


        const item =
            document.createElement("div");


        item.className =
            "carrinho-item";


              item.innerHTML = `

            <img
                class="carrinho-item-imagem"
                src="${produto.imagem}"
                alt="${produto.nome}"
                loading="lazy"
            >

            <div class="carrinho-item-info">

                <h4 data-nome-id="${id}">
                    ${produto.nome}
                </h4>

                <span>
                    ${formatarPreco(
                        produto.preco
                    )}
                </span>

            </div>


            <div class="carrinho-item-quantidade">

                <button
                    type="button"
                    data-acao="remover"
                    data-id="${id}"
                    aria-label="Remover unidade"
                >
                    −
                </button>


                <span>
                    ${quantidade}
                </span>


                <button
                    type="button"
                    data-acao="adicionar"
                    data-id="${id}"
                    aria-label="Adicionar unidade"
                >
                    +
                </button>

            </div>

        `;


        carrinhoItens.appendChild(item);

    });


    carrinhoTotal.textContent =
        formatarPreco(valorTotal);


    contadorCarrinho.textContent =
        quantidadeTotal;


    contadorCarrinho.classList.remove(
        "pulsar"
    );


    void contadorCarrinho.offsetWidth;


    contadorCarrinho.classList.add(
        "pulsar"
    );


    configurarBotoesCarrinho();

}


/* =========================================================
   BOTÕES DE QUANTIDADE DO CARRINHO
   ========================================================= */

function configurarBotoesCarrinho() {

    const botoes =
        carrinhoItens.querySelectorAll(
            "button[data-id]"
        );


    botoes.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const id =
                    botao.dataset.id;


                const acao =
                    botao.dataset.acao;


                if (acao === "adicionar") {

                    adicionarAoCarrinho(id);
                    // rAF garante que o novo DOM (rebuilt pelo atualizarCarrinho)
                    // já está pintado antes de tentar animar o h4
                    requestAnimationFrame(() => flashNomeCarrinho(id, "verde"));

                }


                if (acao === "remover") {

                    // Flash ANTES de remover: o h4 ainda existe no DOM atual
                    flashNomeCarrinho(id, "vermelho");
                    // Pequeno delay para o flash ser visível antes do rebuild
                    setTimeout(() => removerDoCarrinho(id), 120);

                }

            }
        );

    });

}


/* =========================================================
   FLASH DE COR NO NOME DO ITEM DO CARRINHO
   ========================================================= */

function flashNomeCarrinho(id, cor) {
    // O h4 só existe no DOM se o item ainda está no carrinho
    const h4 = carrinhoItens.querySelector(`[data-nome-id="${id}"]`);
    if (!h4) return;

    const classe = cor === "verde" ? "nome-flash-verde" : "nome-flash-vermelho";
    h4.classList.remove("nome-flash-verde", "nome-flash-vermelho");

    // Força reflow para reiniciar a animação
    void h4.offsetWidth;

    h4.classList.add(classe);
    setTimeout(() => h4.classList.remove(classe), 700);
}


/* =========================================================
   ABRIR CARRINHO
   ========================================================= */

function abrirCarrinho() {

    // O carrinho lateral só existe no HTML da página do cardápio.
    if (!carrinhoLateral || !carrinhoOverlay) return;

    carrinhoLateral.classList.add(
        "active"
    );

    carrinhoOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   FECHAR CARRINHO
   ========================================================= */

function fecharCarrinho() {

    carrinhoLateral.classList.remove(
        "active"
    );

    carrinhoOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   EVENTOS DO CARRINHO
   ========================================================= */

if (btnAbrirCarrinho) {

    btnAbrirCarrinho.addEventListener(
        "click",
        abrirCarrinho
    );

}


if (btnFecharCarrinho) {

    btnFecharCarrinho.addEventListener(
        "click",
        fecharCarrinho
    );

}


if (carrinhoOverlay) {

    carrinhoOverlay.addEventListener(
        "click",
        fecharCarrinho
    );

}


/* =========================================================
   ESC PARA FECHAR CARRINHO
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            fecharCarrinho();

        }

    }
);
/* =========================================================
   Finalizar carrinho, confirmar pedido e novo pedido.
   ========================================================= */

if (btnFinalizarCarrinho) {

    btnFinalizarCarrinho.addEventListener(
        "click",
        () => {

            const ids =
                Object.keys(carrinho);


            if (ids.length === 0) {

                mostrarNotificacao(
                    "Seu carrinho está vazio."
                );

                return;

            }


            fecharCarrinho();


            prepararConfirmacao();

            mostrarTela(
                telas.pedido
            );

        }
    );

}


