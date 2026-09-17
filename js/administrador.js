const btnRestaurarPratosCodigo = document.getElementById("btnRestaurarPratosCodigo");
/* =========================================================
   ADICIONAR RECOMENDAÇÃO AO CARRINHO
   ========================================================= */

if (btnEscolherSugestao) {

    btnEscolherSugestao.addEventListener(
        "click",
        () => {

            if (!produtoSelecionado) {

                return;

            }


            adicionarAoCarrinho(
                produtoSelecionado
            );


            // A tela de recomendação não tem o carrinho lateral no HTML
            // (ele só existe no cardápio), então avisamos com uma notificação.
            if (carrinhoLateral) {
                abrirCarrinho();
            } else {
                const produto = produtos[produtoSelecionado];
                mostrarNotificacao(
                    produto ? `${produto.nome} adicionado ao carrinho!` : "Item adicionado ao carrinho!"
                );
            }

        }
    );

}
/* =========================================================
   Controles do administrador dentro do cardápio (adicionar/editar itens).
   ========================================================= */

function atualizarAcessoAdmCardapio() {
    const logado = perfilLogado === "adm";
    if (btnAdicionarComida) btnAdicionarComida.classList.toggle("hidden", !logado);
    if (adminActions) adminActions.classList.toggle("hidden", !logado);
    if (adminStatus) adminStatus.textContent = logado ? `ADM: ${usuarioLogado || "programador"}` : "";
    if (!logado) fecharModalAdicionarComida();
}

function abrirModalAdicionarComida() {
    if (perfilLogado !== "adm") return;
    erroAdicionarComida.textContent = "";
    modalAdicionarComida.classList.remove("hidden");
    novaComidaNome.focus();
}

function fecharModalAdicionarComida() {
    if (document.body?.dataset?.page === "administrador") { window.location.href = "cardapio.html"; return; }
    if (!modalAdicionarComida) return;
    modalAdicionarComida.classList.add("hidden");
}

function separarDescricaoIngredientes(produto) {
    const descricaoOriginal = String(produto?.descricao || "").trim();
    const ingredientesProprios = String(produto?.ingredientes || "").trim();
    // Mesmo produtos antigos que guardaram "Descrição. Ingredientes: ..."
    // continuam sendo exibidos corretamente agora que descrição e ingredientes
    // são campos independentes.
    const partes = descricaoOriginal.split(/\s*Ingredientes\s*:/i);
    if (ingredientesProprios) {
        return {
            descricao: partes[0].trim(),
            ingredientes: ingredientesProprios
        };
    }
    return {
        descricao: partes[0].trim(),
        ingredientes: (partes[1] || "Não informado").trim()
    };
}

function descricaoCompletaProduto(descricao, ingredientes) {
    const d = String(descricao || "").trim();
    const i = String(ingredientes || "").trim();
    return i ? `${d} Ingredientes: ${i}`.trim() : d;
}

function criarCardProdutoAdm(produto) {
    const artigo = document.createElement("article");
    artigo.className = `cardapio-item cat-${produto.categoria}`;
    artigo.dataset.nome = produto.nome;
    artigo.dataset.descricao = produto.descricao;
    artigo.dataset.preco = Number(produto.preco).toFixed(2);
    artigo.dataset.produtoId = produto.id;

    const imagem = produto.imagem
        ? `<img src="${produto.imagem}" alt="${produto.nome}">`
        : `<div class="produto-sem-imagem">🍽️</div>`;

    artigo.innerHTML = `
        <div class="produto-imagem">
            ${imagem}
            <span class="produto-tag">NOVO</span>
        </div>
        <div class="item-conteudo">
            <div class="item-topo">
                <h4>${produto.nome}</h4>
                <span class="item-preco">${formatarPreco(Number(produto.preco))}</span>
            </div>
            <div class="item-descricao-bloco"><span class="item-descricao-titulo">Descrição</span><p class="item-descricao">${separarDescricaoIngredientes(produto).descricao}</p></div><div class="item-ingredientes-bloco"><span class="item-ingredientes-titulo">Ingredientes</span><p class="item-ingredientes">${separarDescricaoIngredientes(produto).ingredientes}</p></div>
            <div class="item-footer">
                <span class="item-detalhe">Adicionado pelo ADM</span>
                <button class="btn-adicionar-carrinho" type="button" data-produto-id="${produto.id}">+</button>
            </div>
        </div>`;

    return artigo;
}

function adicionarCardsAdmAoCardapio() {
    if (!cardapioLista) return;

    produtosAdm.forEach(produto => {
        if (!cardapioLista.querySelector(`[data-produto-id="${produto.id}"]`)) {
            cardapioLista.appendChild(criarCardProdutoAdm(produto));
        }
    });
}

/*
 * Mantém o Gerenciar ServeUp e o cardápio sincronizados.
 *
 * O HTML possui alguns produtos fixos. Se um deles não estiver no objeto
 * `produtos`, o cardápio ainda pode exibi-lo, mas o gerenciador não consegue
 * listá-lo. Aqui fazemos a sincronização nos dois sentidos:
 * 1. produto existente no cardápio -> entra em `produtos`;
 * 2. produto marcado como excluído -> seu card é removido do HTML;
 * 3. produtos adicionados pelo ADM continuam sendo incluídos normalmente.
 */
function sincronizarProdutosCardapioGerenciador() {
    if (!cardapioLista) return;

    const cards = Array.from(cardapioLista.querySelectorAll(".cardapio-item[data-produto-id]"));

    cards.forEach(card => {
        const id = card.dataset.produtoId;
        if (!id) return;

        // Se o ADM já excluiu esse produto, ele não pode reaparecer
        // somente porque o produto está escrito no HTML.
        if (produtosExcluidos.includes(id)) {
            card.remove();
            return;
        }

              // Se o card existe no HTML, mas o objeto não existe, importa os
        // dados do próprio card para que ele também apareça no gerenciador.
        if (!produtos[id]) {
            const imagemEl = card.querySelector(".produto-imagem img");
            const categoria = Array.from(card.classList)
                .find(classe => classe.startsWith("cat-"))
                ?.replace("cat-", "") || "pratos";

            produtos[id] = {
                id,
                categoria,
                nome: card.dataset.nome || card.querySelector(".item-topo h4")?.textContent.trim() || "Produto",
                preco: Number(card.dataset.preco || 0),
                descricao: card.dataset.descricao || card.querySelector(".item-descricao")?.textContent.trim() || "",
                ingredientes: card.querySelector(".item-ingredientes")?.textContent.trim() || "",
                imagem: imagemEl?.getAttribute("src") || ""
            };

        // O produto já existe (geralmente vindo do data.js). Mesmo assim,
        // mantém a imagem sincronizada com o que está de fato no HTML —
        // a menos que o ADM já tenha editado esse produto pelo painel
        // Gerenciar, caso em que a escolha do ADM tem prioridade.
        } else if (!produtosEditados[id]) {
            const imagemEl = card.querySelector(".produto-imagem img");
            const src = imagemEl?.getAttribute("src");
            if (src) produtos[id].imagem = src;
        }
    });

    // Produtos adicionados pelo ADM também devem aparecer no gerenciador
    // e no cardápio, desde que não estejam excluídos.
    produtosAdm.forEach(produto => {
        if (!produtosExcluidos.includes(produto.id)) {
            produtos[produto.id] = { ...produto, id: produto.id };
        }
    });

    adicionarCardsAdmAoCardapio();
}

function atualizarCardsDosProdutos() {
    document.querySelectorAll(".cardapio-item[data-produto-id]").forEach(card => {
        const id = card.dataset.produtoId;
        const produto = produtos[id];
        if (!produto) return;

        card.dataset.nome = produto.nome;
        const partes = separarDescricaoIngredientes(produto);
        card.dataset.descricao = produto.descricao;
        card.dataset.preco = Number(produto.preco).toFixed(2);

        const titulo = card.querySelector(".item-topo h4");
        const preco = card.querySelector(".item-preco");
        const descricao = card.querySelector(".item-descricao");
        const ingredientes = card.querySelector(".item-ingredientes");
        const imagem = card.querySelector(".produto-imagem img");

        if (titulo) titulo.textContent = produto.nome;
        if (preco) preco.textContent = formatarPreco(Number(produto.preco));
        if (descricao) descricao.textContent = partes.descricao;
        if (ingredientes) ingredientes.textContent = partes.ingredientes;
        if (imagem && produto.imagem) {
            imagem.src = produto.imagem;
            imagem.alt = produto.nome;
        }
    });
}

function salvarProdutoEditado(produto) {
    const partes = separarDescricaoIngredientes(produto);
    produtosEditados[produto.id] = {
        nome: produto.nome,
        preco: produto.preco,
        descricao: partes.descricao,
        ingredientes: String(produto.ingredientes || partes.ingredientes || "").trim(),
        imagem: produto.imagem,
        categoria: produto.categoria
    };
    localStorage.setItem(PRODUTOS_EDITADOS_KEY, JSON.stringify(produtosEditados));
}

function abrirGerenciadorAdm() {
    if (perfilLogado !== "adm" || !modalGerenciarAdm) return;
    fecharEditorProdutoAdm();
    renderizarGerenciadorProdutos();
    renderizarGerenciadorRecomendacoes();
    modalGerenciarAdm.classList.remove("hidden");
}

function fecharGerenciadorAdm() {
    if (document.body?.dataset?.page === "administrador") { window.location.href = "cardapio.html"; return; }
    if (modalGerenciarAdm) modalGerenciarAdm.classList.add("hidden");
}

function renderizarGerenciadorProdutos() {
    if (!listaGerenciarProdutos) return;
    listaGerenciarProdutos.innerHTML = "";

    const lista = Object.values(produtos).filter(
        produto => !produtosExcluidos.includes(produto.id)
    );

    if (!lista.length) {
        listaGerenciarProdutos.innerHTML = `<p class="adm-lista-vazia">Nenhum produto cadastrado no cardápio.</p>`;
        return;
    }

    lista.forEach(produto => {
        const id = produto.id;
        const linha = document.createElement("div");
        linha.className = "adm-gerenciar-item";
        linha.innerHTML = `
            <div>
                <strong>${produto.nome}</strong>
                <small>${produto.categoria} · ${formatarPreco(Number(produto.preco))}</small>
            </div>
            <div class="adm-gerenciar-acoes">
                <button type="button" class="adm-btn-editar-produto" data-id="${id}">EDITAR</button>
                <button type="button" class="adm-btn-excluir-produto" data-id="${id}">EXCLUIR</button>
            </div>`;
        listaGerenciarProdutos.appendChild(linha);
    });
}

function renderizarGerenciadorRecomendacoes() {
    if (!listaRecomendacoesAdm) return;

    const nomesHumor = {
        feliz: "😄 Feliz",
        cansado: "😴 Cansado",
        estressante: "😡 Estressado",
        triste: "😢 Triste",
    };

    const descricoesHumor = {
        feliz: "Sugestões para acompanhar um momento de bom humor.",
        cansado: "Opções mais aconchegantes para uma pausa.",
        estressante: "Sugestões para uma refeição tranquila.",
        triste: "Opções caprichadas para deixar a refeição especial.",
    };

    const produtosDisponiveis = Object.values(produtos).filter(
        produto => !produtosExcluidos.includes(produto.id)
    );

    listaRecomendacoesAdm.innerHTML = `
        <div class="adm-recomendacoes-topo">
            <div>
                <strong>Personalize as sugestões</strong>
                <span>Escolha até 2 produtos para cada humor. A descrição da sugestão acompanha automaticamente o produto escolhido.</span>
            </div>
            <span class="adm-recomendacoes-contador">${produtosDisponiveis.length} produtos disponíveis</span>
        </div>`;

    Object.keys(recomendacoes).filter(humor => humor !== "nao-dizer").forEach(humor => {
        const grupo = document.createElement("div");
        grupo.className = "adm-humor-box";
        grupo.dataset.humor = humor;

        const opcoes = [0, 1].map(indice => grupoAtualOpcao(humor, indice));

        grupo.innerHTML = `
            <div class="adm-humor-cabecalho">
                <div>
                    <span class="adm-humor-icone">${(nomesHumor[humor] || "🙂").split(" ")[0]}</span>
                    <div>
                        <h4>${(nomesHumor[humor] || humor).replace(/^[^ ]+ /, "")}</h4>
                        <p>${descricoesHumor[humor] || "Escolha as sugestões deste humor."}</p>
                    </div>
                </div>
                <span class="adm-humor-status">2 sugestões</span>
            </div>
            <div class="adm-humor-selects"></div>
            <button type="button" class="adm-btn-confirmar-recomendacao" data-humor="${humor}" disabled>✓ CONFIRMAR ALTERAÇÃO</button>`;

        const selectsWrap = grupo.querySelector(".adm-humor-selects");

        for (let i = 0; i < 2; i++) {
            const atual = opcoes[i];
            const campo = document.createElement("div");
            campo.className = "adm-recomendacao-campo";

            const label = document.createElement("label");
            label.textContent = `Sugestão ${i + 1}`;

            const select = document.createElement("select");
            select.className = "adm-recomendacao-select";
            select.dataset.humor = humor;
            select.dataset.indice = String(i);
            select.innerHTML = `<option value="">Selecione um produto</option>` + produtosDisponiveis.map(produto =>
                `<option value="${produto.id}" ${produto.id === atual?.produto ? "selected" : ""}>${produto.nome} · ${formatarPreco(Number(produto.preco))}</option>`
            ).join("");

            label.appendChild(select);
            campo.appendChild(label);

            const preview = document.createElement("div");
            preview.className = "adm-recomendacao-preview";
            preview.dataset.preview = `${humor}-${i}`;
            campo.appendChild(preview);
            selectsWrap.appendChild(campo);

            atualizarPreviewRecomendacaoAdm(select);
        }

        listaRecomendacoesAdm.appendChild(grupo);
    });
}

function atualizarPreviewRecomendacaoAdm(select) {
    const campo = select.closest(".adm-recomendacao-campo");
    const preview = campo?.querySelector(".adm-recomendacao-preview");
    if (!preview) return;

    const produto = produtos[select.value];
    if (!produto) {
        preview.innerHTML = `<span class="adm-preview-vazio">Nenhum produto selecionado</span>`;
        return;
    }

    preview.innerHTML = `
        <strong>${produto.nome}</strong>
        <span>${produto.descricao}</span>`;
}

function grupoAtualOpcao(humor, indice) {
    return recomendacoes[humor]?.opcoes?.[indice] || null;
}

function salvarSelecaoRecomendacao(select, opcoesChamada = {}) {
    const humor = select.dataset.humor;
    const indice = Number(select.dataset.indice);
    const id = select.value;
    if (!recomendacoes[humor]) recomendacoes[humor] = { opcoes: [] };
    if (!id || !produtos[id]) return;

    const produto = produtos[id];
    const anterior = recomendacoes[humor].opcoes[indice] || {};

    // A recomendação sempre acompanha os dados atuais do produto.
    // Assim, ao trocar o prato, a descrição também muda.
    recomendacoes[humor].opcoes[indice] = {
        produto: id,
        titulo: `Uma boa escolha: ${produto.nome}.`,
        descricao: produto.descricao,
        tag: anterior.tag || "SUGESTÃO SERVEUP"
    };

    salvarRecomendacoesAdm();
    if (!opcoesChamada.silencioso) {
        mostrarNotificacao(`Sugestão alterada para ${produto.nome}!`);
    }

    // Se esta recomendação estiver sendo exibida agora, atualiza a tela imediatamente.
    if (humorSelecionado === humor && recomendacaoAtualIndex === indice) {
        mostrarRecomendacao(humor, indice);
    }
}

function abrirEditorProdutoAdm(id) {
    const produto = produtos[id];
    if (!produto || !editorProdutoAdm) return;

    editorProdutoId.value = id;
    editorProdutoNome.value = produto.nome || "";
    editorProdutoPreco.value = Number(produto.preco || 0).toFixed(2);
    const partes = separarDescricaoIngredientes(produto);
    editorProdutoDescricao.value = partes.descricao;
    if (editorProdutoIngredientes) editorProdutoIngredientes.value = partes.ingredientes === "Não informado" ? "" : partes.ingredientes;
    editorProdutoImagem.value = produto.imagem || "";
    if (editorProdutoImagemArquivo) editorProdutoImagemArquivo.value = "";
    editorProdutoTitulo.textContent = `Editar: ${produto.nome}`;
    editorProdutoAdm.classList.remove("hidden");
    editorProdutoNome.focus();
}

function fecharEditorProdutoAdm() {
    if (!editorProdutoAdm) return;
    editorProdutoAdm.classList.add("hidden");
    editorProdutoId.value = "";
}

async function confirmarAlteracaoProdutoAdm() {
    const id = editorProdutoId.value;
    const produto = produtos[id];
    if (!produto) return;

    const nome = editorProdutoNome.value.trim();
    const preco = Number(editorProdutoPreco.value.replace(",", "."));
    const descricao = editorProdutoDescricao.value.trim();
    const ingredientes = editorProdutoIngredientes?.value.trim() || "";
    let imagem = editorProdutoImagem.value.trim();
    const arquivoImagem = editorProdutoImagemArquivo?.files?.[0];

    if (!nome || !Number.isFinite(preco) || preco <= 0 || !descricao || !ingredientes) {
        mostrarNotificacao("Preencha nome, preço, descrição e ingredientes corretamente.");
        return;
    }

    if (arquivoImagem) {
        if (!arquivoImagem.type.startsWith("image/")) { mostrarNotificacao("Escolha um arquivo de imagem válido."); return; }
        if (arquivoImagem.size > 5 * 1024 * 1024) { mostrarNotificacao("A imagem deve ter no máximo 5 MB."); return; }
        try { imagem = await lerImagemComoDataURL(arquivoImagem); } catch (erro) { mostrarNotificacao("Não foi possível carregar a imagem."); return; }
    }

    produtos[id] = {
        ...produto,
        id,
        nome,
        preco,
        descricao,
        ingredientes,
        imagem: imagem || produto.imagem
    };

    // Se o produto foi usado em alguma recomendação, atualiza automaticamente
    // título e descrição dessa recomendação para refletirem a edição.
    Object.values(recomendacoes).forEach(grupo => {
        (grupo.opcoes || []).forEach(opcao => {
            if (opcao.produto === id) {
                opcao.titulo = `Uma boa escolha: ${nome}.`;
                opcao.descricao = descricao;
            }
        });
    });

    salvarProdutoEditado(produtos[id]);
    salvarRecomendacoesAdm();
    atualizarCardsDosProdutos();
    renderizarGerenciadorProdutos();
    renderizarGerenciadorRecomendacoes();
    atualizarCardapio();
    atualizarPainelAdm();

    fecharEditorProdutoAdm();
    mostrarNotificacao("Alteração confirmada e salva!");
}

function editarProdutoAdm(id) {
    abrirEditorProdutoAdm(id);
}


/* Confirmação própria do ServeUp: não usa mais a caixa confirm() do navegador. */
function mostrarConfirmacaoSite(mensagem, titulo = "Confirmar ação") {
    return new Promise(resolve => {
        const antigo = document.getElementById("modalConfirmacaoSite");
        if (antigo) antigo.remove();

        const modal = document.createElement("div");
        modal.id = "modalConfirmacaoSite";
        modal.className = "modal-confirmacao-site";
        modal.innerHTML = `
            <div class="confirmacao-site-card" role="dialog" aria-modal="true" aria-labelledby="confirmacaoSiteTitulo">
                <div class="confirmacao-site-icone">⚠️</div>
                <h3 id="confirmacaoSiteTitulo">${titulo}</h3>
                <p>${mensagem}</p>
                <div class="confirmacao-site-acoes">
                    <button type="button" class="btn-cancelar-site" data-confirmacao="cancelar">CANCELAR</button>
                    <button type="button" class="btn-confirmar-site" data-confirmacao="confirmar">CONFIRMAR</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        let finalizado = false;
        const finalizar = valor => {
            if (finalizado) return;
            finalizado = true;
            document.removeEventListener("keydown", tecla);
            modal.classList.add("hidden");
            setTimeout(() => modal.remove(), 180);
            resolve(valor);
        };
        modal.querySelector('[data-confirmacao="cancelar"]').addEventListener("click", () => finalizar(false));
        modal.querySelector('[data-confirmacao="confirmar"]').addEventListener("click", () => finalizar(true));
        modal.addEventListener("click", event => { if (event.target === modal) finalizar(false); });
        const tecla = event => {
            if (event.key === "Escape") finalizar(false);
            if (event.key === "Enter") finalizar(true);
        };
        document.addEventListener("keydown", tecla);
        requestAnimationFrame(() => modal.querySelector('[data-confirmacao="confirmar"]')?.focus());
    });
}

async function excluirProdutoAdm(id) {
    const produto = produtos[id];
    if (!produto) return;

    if (!(await mostrarConfirmacaoSite(`Excluir <strong>"${produto.nome}"</strong> permanentemente?`, "Excluir produto?"))) return;

    // A exclusão fica salva no localStorage. Isso impede que um produto
    // escrito diretamente no HTML/código seja recriado ao recarregar a página.
    if (!produtosExcluidos.includes(id)) {
        produtosExcluidos.push(id);
        salvarProdutosExcluidos();
    }

    // Remove o produto das recomendações e grava a limpeza.
    // A função também filtra qualquer recomendação antiga que ainda esteja
    // no localStorage, evitando que o prato volte ao selecionar um humor.
    Object.values(recomendacoes).forEach(grupo => {
        if (!Array.isArray(grupo?.opcoes)) return;
        grupo.opcoes = grupo.opcoes.filter(opcao => opcao?.produto !== id);
    });
    salvarRecomendacoesAdm();

    // Se o produto excluído estava selecionado na sessão atual, limpa o
    // estado para impedir que a tela de recomendação tente reutilizá-lo.
    if (produtoSelecionado === id) {
        produtoSelecionado = null;
        sessionStorage.removeItem("serveup_produto");
        sessionStorage.removeItem("serveup_recomendacao_indice");
    }

    // Remove imediatamente qualquer card desse produto que esteja visível.
    document.querySelectorAll(`.cardapio-item[data-produto-id="${id}"]`).forEach(card => {
        card.remove();
    });

    // Se o usuário estiver em uma recomendação que acabou de ser excluída,
    // a tela é atualizada sem deixar o produto apagado aparecer novamente.
    if (typeof humorSelecionado !== "undefined" && humorSelecionado) {
        const opcoesRestantes = recomendacoes[humorSelecionado]?.opcoes || [];
        if (opcoesRestantes.length === 0 && document.body?.dataset?.page === "recomendacao") {
            mostrarTela(telas.cardapio);
        }
    }

    renderizarGerenciadorProdutos();
    renderizarGerenciadorRecomendacoes();

    if (typeof atualizarCardapio === "function" && typeof campoBusca !== "undefined" && campoBusca) {
        atualizarCardapio();
    }

    atualizarPainelAdm();
    mostrarNotificacao(`"${produto.nome}" foi excluído permanentemente.`);
}

async function restaurarPratosCodigoAdm() {
    const excluidosCodigo = produtosExcluidos.filter(id => PRODUTOS_CODIGO_IDS.includes(id));

    if (!excluidosCodigo.length) {
        mostrarNotificacao("Nenhum prato feito por código está excluído.");
        return;
    }

    if (!(await mostrarConfirmacaoSite(`Restaurar <strong>${excluidosCodigo.length} produto(s)</strong> feitos por código?`, "Restaurar produtos?"))) return;

    produtosExcluidos = produtosExcluidos.filter(id => !PRODUTOS_CODIGO_IDS.includes(id));
    salvarProdutosExcluidos();

    // Recarrega os cards originais que continuam definidos no HTML.
    if (typeof sincronizarProdutosCardapioGerenciador === "function") {
        sincronizarProdutosCardapioGerenciador();
    }
    if (typeof atualizarCardapio === "function") atualizarCardapio();

    renderizarGerenciadorProdutos();
    renderizarGerenciadorRecomendacoes();
    atualizarPainelAdm();
    mostrarNotificacao("Pratos feitos por código restaurados!");
}

if (btnGerenciarAdm) btnGerenciarAdm.addEventListener("click", () => window.location.href = "administrador.html?view=gerenciar");
if (btnRestaurarPratosCodigo) btnRestaurarPratosCodigo.addEventListener("click", restaurarPratosCodigoAdm);
if (btnFecharGerenciarAdm) btnFecharGerenciarAdm.addEventListener("click", fecharGerenciadorAdm);
if (modalGerenciarAdm) {
    modalGerenciarAdm.addEventListener("click", event => {
        if (event.target === modalGerenciarAdm) fecharGerenciadorAdm();
    });
}
if (btnConfirmarAlteracaoProduto) btnConfirmarAlteracaoProduto.addEventListener("click", confirmarAlteracaoProdutoAdm);
if (btnCancelarAlteracaoProduto) btnCancelarAlteracaoProduto.addEventListener("click", fecharEditorProdutoAdm);

if (listaGerenciarProdutos) {
    listaGerenciarProdutos.addEventListener("click", event => {
        const editar = event.target.closest(".adm-btn-editar-produto");
        const excluir = event.target.closest(".adm-btn-excluir-produto");
        if (editar) editarProdutoAdm(editar.dataset.id);
        if (excluir) excluirProdutoAdm(excluir.dataset.id);
    });
}
if (listaRecomendacoesAdm) {
    // Ao trocar a seleção, apenas destrava o botão "Confirmar alteração" daquele humor.
    // Nada é salvo até o administrador clicar em confirmar.
    listaRecomendacoesAdm.addEventListener("change", event => {
        if (!event.target.matches(".adm-recomendacao-select")) return;
        atualizarPreviewRecomendacaoAdm(event.target);
        const grupo = event.target.closest(".adm-humor-box");
        const btnConfirmar = grupo?.querySelector(".adm-btn-confirmar-recomendacao");
        if (btnConfirmar) btnConfirmar.disabled = false;
    });

    listaRecomendacoesAdm.addEventListener("click", event => {
        const btnConfirmar = event.target.closest(".adm-btn-confirmar-recomendacao");
        if (!btnConfirmar) return;

        const grupo = btnConfirmar.closest(".adm-humor-box");
        const selects = grupo ? grupo.querySelectorAll(".adm-recomendacao-select") : [];
        let algumaSelecionada = false;

        selects.forEach(select => {
            if (select.value) {
                algumaSelecionada = true;
                salvarSelecaoRecomendacao(select, { silencioso: true });
            }
        });

        if (algumaSelecionada) {
            btnConfirmar.disabled = true;
            mostrarNotificacao("Sugestões confirmadas e salvas!");
        } else {
            mostrarNotificacao("Selecione ao menos um produto antes de confirmar.");
        }
    });
}

function atualizarPainelAdm() {
    if (!modalPainelAdm) return;

    // O painel deve refletir apenas os produtos que continuam ativos.
    // Produtos excluídos permanecem no cadastro interno para poderem ser
    // restaurados, mas não devem aparecer nas contagens do painel.
    const listaProdutos = Object.values(produtos).filter(
        produto => !produtosExcluidos.includes(produto.id)
    );
    const contagemCategorias = { pratos: 0, bebidas: 0, sobremesas: 0 };

    listaProdutos.forEach(produto => {
        if (contagemCategorias[produto.categoria] !== undefined) {
            contagemCategorias[produto.categoria]++;
        }
    });

    const humores = Object.entries(historicoHumoresAdm);
    humores.sort((a, b) => b[1] - a[1]);

    const nomesHumor = {
        feliz: "Feliz",
        cansado: "Cansado",
        estressante: "Estressado",
        triste: "Triste",
        "nao-dizer": "Não informado"
    };

    const humorMaisEscolhido = humores.length
        ? (nomesHumor[humores[0][0]] || humores[0][0])
        : "Nenhum";

    const totalProdutos = document.getElementById("painelTotalProdutos");
    const totalPedidos = document.getElementById("painelTotalPedidos");
    const produtosAdmEl = document.getElementById("painelProdutosAdm");
    const humorEl = document.getElementById("painelHumorMaisEscolhido");
    const pratosEl = document.getElementById("painelPratos");
    const bebidasEl = document.getElementById("painelBebidas");
    const sobremesasEl = document.getElementById("painelSobremesas");
    const usuarioEl = document.getElementById("painelAdmUsuario");

    if (totalProdutos) totalProdutos.textContent = listaProdutos.length;
    if (totalPedidos) totalPedidos.textContent = totalPedidosAdm;
    if (produtosAdmEl) produtosAdmEl.textContent = produtosAdm.length;
    if (humorEl) humorEl.textContent = humorMaisEscolhido;
    if (pratosEl) pratosEl.textContent = contagemCategorias.pratos;
    if (bebidasEl) bebidasEl.textContent = contagemCategorias.bebidas;
    if (sobremesasEl) sobremesasEl.textContent = contagemCategorias.sobremesas;
    if (usuarioEl) usuarioEl.textContent = `ADM: ${usuarioLogado || "programador"}`;
}

function abrirPainelAdm() {
    if (perfilLogado !== "adm" || !modalPainelAdm) return;
    atualizarPainelAdm();
    modalPainelAdm.classList.remove("hidden");
}

function fecharPainelAdm() {
    if (document.body?.dataset?.page === "administrador") { window.location.href = "cardapio.html"; return; }
    if (modalPainelAdm) modalPainelAdm.classList.add("hidden");
}

if (btnPainelAdm) btnPainelAdm.addEventListener("click", () => window.location.href = "administrador.html?view=painel");
if (document.getElementById("btnAdminDashboard")) document.getElementById("btnAdminDashboard").addEventListener("click", abrirPainelAdm);
if (document.getElementById("btnAdminGerenciar")) document.getElementById("btnAdminGerenciar").addEventListener("click", abrirGerenciadorAdm);
if (document.getElementById("btnAdminAdicionar")) document.getElementById("btnAdminAdicionar").addEventListener("click", abrirModalAdicionarComida);
if (document.getElementById("btnAdminSair")) document.getElementById("btnAdminSair").addEventListener("click", () => { sessionStorage.removeItem("serveup_perfil"); window.location.href = "../index.html"; });
if (document.getElementById("btnVoltarAdminCardapio")) document.getElementById("btnVoltarAdminCardapio").addEventListener("click", () => window.location.href = "cardapio.html");
if (btnFecharPainelAdm) btnFecharPainelAdm.addEventListener("click", fecharPainelAdm);
if (btnAtualizarPainelAdm) btnAtualizarPainelAdm.addEventListener("click", atualizarPainelAdm);
if (modalPainelAdm) {
    modalPainelAdm.addEventListener("click", event => {
        if (event.target === modalPainelAdm) fecharPainelAdm();
    });
}

if (btnSairAdm) {
    btnSairAdm.addEventListener("click", () => {
        perfilLogado = null;
        usuarioLogado = null;
        sessionStorage.removeItem("serveup_perfil");
        // Os campos do formulário de login só existem em login.html.
        if (admUsuario) admUsuario.value = "";
        if (admSenha) admSenha.value = "";
        atualizarAcessoAdmCardapio();
        mostrarNotificacao("Você saiu da área administrativa.");
        mostrarTela(telas.inicial);
    });
}

if (btnAdicionarComida) {
    btnAdicionarComida.addEventListener("click", () => window.location.href = "administrador.html?view=adicionar");
}

if (btnFecharAdicionarComida) {
    btnFecharAdicionarComida.addEventListener("click", fecharModalAdicionarComida);
}

if (modalAdicionarComida) {
    modalAdicionarComida.addEventListener("click", event => {
        if (event.target === modalAdicionarComida) fecharModalAdicionarComida();
    });
}

function lerImagemComoDataURL(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(leitor.error);

        leitor.readAsDataURL(arquivo);
    });
}

function configurarAbasProdutoAdm() {
    document.querySelectorAll(".adm-campos-abas").forEach(container => {
        const botoes = container.querySelectorAll(".adm-campo-aba");
        const paineis = container.querySelectorAll("[data-tab-panel]");
        botoes.forEach(botao => botao.addEventListener("click", () => {
            const alvo = botao.dataset.tabTarget;
            botoes.forEach(b => b.classList.toggle("active", b === botao));
            paineis.forEach(painel => painel.classList.toggle("active", painel.id === alvo));
        }));
    });
}

configurarAbasProdutoAdm();

if (formAdicionarComida) {
    formAdicionarComida.addEventListener("submit", async event => {
        event.preventDefault();

        if (perfilLogado !== "adm") {
            fecharModalAdicionarComida();
            atualizarAcessoAdmCardapio();
            return;
        }

        const nome = novaComidaNome.value.trim();
        const preco = Number(novaComidaPreco.value);
        const descricao = novaComidaDescricao.value.trim();
        const ingredientes = novaComidaIngredientes?.value.trim() || "";
        const categoria = novaComidaCategoria.value;

        if (!nome || !Number.isFinite(preco) || preco <= 0 || !descricao || !ingredientes) {
            erroAdicionarComida.textContent = "Preencha nome, preço, descrição e ingredientes corretamente.";
            return;
        }

        // A imagem do novo prato é escolhida somente pelo seletor de arquivo.
        // Ela é salva como Data URL para continuar disponível neste navegador.
        let imagem = null;
        const arquivoImagem = novaComidaImagemArquivo?.files?.[0];

        if (arquivoImagem) {
            if (!arquivoImagem.type.startsWith("image/")) {
                erroAdicionarComida.textContent = "Escolha um arquivo de imagem válido.";
                return;
            }

            if (arquivoImagem.size > 5 * 1024 * 1024) {
                erroAdicionarComida.textContent = "A imagem deve ter no máximo 5 MB.";
                return;
            }

            try {
                imagem = await lerImagemComoDataURL(arquivoImagem);
            } catch (erro) {
                erroAdicionarComida.textContent = "Não foi possível carregar a imagem.";
                return;
            }
        }

        const idBase = nome.toLowerCase()
            .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        let id = `adm-${idBase || "produto"}`;
        let contador = 2;
        while (produtos[id]) id = `adm-${idBase}-${contador++}`;

        const novoProduto = { id, nome, preco, descricao, ingredientes, imagem, categoria };
        produtos[id] = novoProduto;
        const indiceExcluido = produtosExcluidos.indexOf(id);
        if (indiceExcluido >= 0) produtosExcluidos.splice(indiceExcluido, 1);
        produtosAdm.push(novoProduto);
        localStorage.setItem(PRODUTOS_ADM_KEY, JSON.stringify(produtosAdm));

        adicionarCardsAdmAoCardapio();
        categoriaAtual = categoria;
        botoesCategoria.forEach(botao => botao.classList.toggle("active", botao.dataset.categoria === categoria));
        atualizarCardapio();

        formAdicionarComida.reset();
        fecharModalAdicionarComida();
        mostrarNotificacao(`${categoria === "pratos" ? "Prato" : categoria === "bebidas" ? "Bebida" : categoria === "sobremesas" ? "Sobremesa" : "Item"} adicionado ao cardápio.`);
    });
}


/* Botões dos produtos adicionados pelo ADM também funcionam. */
if (cardapioLista) {
    cardapioLista.addEventListener("click", event => {
        const botaoCarrinho = event.target.closest(".btn-adicionar-carrinho");

        if (botaoCarrinho) {
            event.stopPropagation();

            const id = botaoCarrinho.dataset.produtoId;
            adicionarAoCarrinho(id);

            // Mantém nos produtos adicionados pelo ADM a mesma animação
            // e a mesma mensagem dos produtos fixos do cardápio.
            botaoCarrinho.classList.add("adicionado");
            setTimeout(() => {
                botaoCarrinho.classList.remove("adicionado");
            }, 350);

            const prod = produtos[id];
            mostrarToastCarrinho(
                prod ? prod.nome : "Item",
                prod ? prod.imagem : null
            );
        }
    });
}
/* =========================================================
   TROCAR SUGESTÃO
   ========================================================= */

if (btnTrocarSugestao) {
    btnTrocarSugestao.addEventListener("click", () => {
        // Usa exatamente as opções que podem ser exibidas na tela.
        // Isso evita que produtos excluídos ou configurações antigas do ADM
        // façam o botão parar de funcionar.
        const opcoesValidas = typeof obterOpcoesValidasRecomendacao === "function"
            ? obterOpcoesValidasRecomendacao(humorSelecionado)
            : (recomendacoes[humorSelecionado]?.opcoes || []);

        if (opcoesValidas.length < 2) {
            mostrarNotificacao("Não há outra sugestão para este humor.");
            return;
        }

        const indiceAtual = Math.max(0, opcoesValidas.findIndex(
            opcao => opcao.produto === produtoSelecionado
        ));
        const proximoIndice = (indiceAtual + 1) % opcoesValidas.length;
        mostrarRecomendacao(humorSelecionado, proximoIndice);
        mostrarNotificacao("Sugestão trocada!");
    });
}
 // Lê o parâmetro ?view= da URL e abre o modal certo automaticamente
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  if (view === "gerenciar") abrirGerenciadorAdm();
  else if (view === "painel") abrirPainelAdm();
  else if (view === "adicionar") abrirModalAdicionarComida();
});