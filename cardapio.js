/* =========================================================
   Cardápio completo: categorias, busca, combos.
   ========================================================= */

if (btnCardapioCompleto) {

    btnCardapioCompleto.addEventListener(
        "click",
        () => {

            mostrarTela(telas.cardapio);

            atualizarAcessoAdmCardapio();
            adicionarCardsAdmAoCardapio();
            atualizarCardapio();

        }
    );

}


/* =========================================================
   VOLTAR DO CARDÁPIO
   ========================================================= */

/* =========================================================
   VOLTAR DO CARDÁPIO
   ========================================================= */

if (btnVoltarCardapio) {

    btnVoltarCardapio.addEventListener("click", () => {

        if (perfilLogado === "adm") {

            // O ADM chega direto no cardápio (sem passar pela tela de
            // humor/recomendação), então o voltar dele sempre vai pro início.
            mostrarTela(telas.inicial);
            return;
        }

        if (veioDoNaoDizer) {

            // Veio de "Prefiro não dizer"
            // Então volta para a tela de humor.
            mostrarTela(telas.humor);

            veioDoNaoDizer = false;
            sessionStorage.removeItem("serveup_veio_nao_dizer");

            return;
        }

        // Para os outros humores, mantém o comportamento normal
        mostrarTela(telas.recomendacao);

    });


}


/* =========================================================
   BOTÕES DAS CATEGORIAS
   ========================================================= */

const botoesCategoria =
    document.querySelectorAll(".aba-btn");


botoesCategoria.forEach(botao => {

    botao.addEventListener("click", () => {

        categoriaAtual =
            botao.dataset.categoria;


        botoesCategoria.forEach(item => {

            item.classList.remove("active");

        });


        botao.classList.add("active");


        atualizarCardapio();

    });

});


/* =========================================================
   ATUALIZAR CARDÁPIO
   ========================================================= */

function atualizarCardapio() {

    if (!campoBusca || !semResultados) return;

    // Remove do HTML os produtos excluídos apenas durante a sessão atual.
    // Ao recarregar a página, a lista é reiniciada e os produtos voltam.
    document.querySelectorAll(".cardapio-item[data-produto-id]").forEach(item => {
        const id = item.dataset.produtoId;
        if (typeof produtosExcluidos !== "undefined" && produtosExcluidos.includes(id)) {
            item.remove();
        }
    });

    const termo =
        campoBusca.value
            .trim()
            .toLowerCase();


    const itens =
        document.querySelectorAll(
            ".cardapio-item"
        );


    let encontrados = 0;


    itens.forEach(item => {

        const nome =
            item.dataset.nome
                .toLowerCase();


        const descricao =
            item.dataset.descricao
                .toLowerCase();


        const pertenceCategoria =
            item.classList.contains(
                `cat-${categoriaAtual}`
            );


        const correspondeBusca =
            !termo ||
            nome.includes(termo) ||
            descricao.includes(termo);


        const mostrar =
            pertenceCategoria &&
            correspondeBusca;

        if (mostrar) {

            item.classList.remove("hidden");

            encontrados++;

        } else {

            item.classList.add("hidden");

        }

    });


    if (encontrados === 0) {

        semResultados.classList.add(
            "visible"
        );

    } else {

        semResultados.classList.remove(
            "visible"
        );

    }

}


/* =========================================================
   PESQUISA
   ========================================================= */

if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        () => {

            const possuiTexto =
                campoBusca.value.trim().length > 0;


            if (possuiTexto) {

                btnLimparBusca.classList.add(
                    "visible"
                );

            } else {

                btnLimparBusca.classList.remove(
                    "visible"
                );

            }


            atualizarCardapio();

        }
    );

}


/* =========================================================
   LIMPAR PESQUISA
   ========================================================= */

if (btnLimparBusca) {

    btnLimparBusca.addEventListener(
        "click",
        () => {

            campoBusca.value = "";

            btnLimparBusca.classList.remove(
                "visible"
            );

            atualizarCardapio();

            campoBusca.focus();

        }
    );

}


/* =========================================================
   Adicionar/remover itens, atualizar e abrir/fechar o carrinho.
   ========================================================= */

const botoesAdicionar =
    document.querySelectorAll(
        ".btn-adicionar-carrinho"
    );


botoesAdicionar.forEach(botao => {

    botao.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const id =
                botao.dataset.produtoId;


            adicionarAoCarrinho(id);


            botao.classList.add(
                "adicionado"
            );


            setTimeout(() => {

                botao.classList.remove(
                    "adicionado"
                );

            }, 350);


            // Toast visual próximo ao carrinho
            const prod = produtos[id];
            mostrarToastCarrinho(
                prod ? prod.nome : "Item",
                prod ? prod.imagem : null
            );

        }
    );

});


/* =========================================================
   TOAST DE ADICIONAR AO CARRINHO (canto inferior esquerdo)
   ========================================================= */

function mostrarToastCarrinho(nomeItem, imagemSrc) {

    // Remove toast anterior se existir
    const antigo = document.getElementById("cartToast");
    if (antigo) antigo.remove();

    const toast = document.createElement("div");
    toast.id = "cartToast";
    toast.className = "cart-toast";

    // Usa imagem do produto se disponível, caso contrário usa emoji
      const iconeHtml = imagemSrc
        ? `<img class="cart-toast-img" src="${imagemSrc}" alt="${nomeItem}" onerror="this.outerHTML='<div class=cart-toast-icone>🛒</div>'">`
        : `<div class="cart-toast-icone">🛒</div>`;

    toast.innerHTML = `
        ${iconeHtml}
        <div class="cart-toast-info">
            <strong>Adicionado!</strong>
            <span>${nomeItem}</span>
        </div>
        <div class="cart-toast-check">✓</div>
    `;

    document.body.appendChild(toast);

    // Entra após 1 frame
    requestAnimationFrame(() => {
        toast.classList.add("cart-toast-visivel");
    });

    // Sai após 1.3s
    setTimeout(() => {
        toast.classList.remove("cart-toast-visivel");
        setTimeout(() => toast.remove(), 340);
    }, 1300);

}


