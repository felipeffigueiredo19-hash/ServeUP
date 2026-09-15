/* =========================================================
   Formatação de preço e login exclusivo do administrador.
   ========================================================= */

function formatarPreco(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   ABRIR LOGIN DO ADM
   ========================================================= */

if (btnAbrirLoginAdm) {

    if (perfilLogado === "adm") {
        btnAbrirLoginAdm.textContent = "PAINEL";
    }

    btnAbrirLoginAdm.addEventListener("click", () => {

        if (perfilLogado === "adm") {
            mostrarTela(telas.cardapio);
            return;
        }

        mostrarTela(telas.login);

    });

}

if (btnVoltarLogin) {

    btnVoltarLogin.addEventListener("click", () => {

        mostrarTela(telas.inicial);

    });

}


/* =========================================================
   LOGIN EXCLUSIVO DO ADM
   ========================================================= */

if (formLoginAdm) {

    formLoginAdm.addEventListener("submit", event => {

        event.preventDefault();

        const usuario = admUsuario.value.trim();
        const senha = admSenha.value;

        if (
            usuario !== CREDENCIAIS_ADM.usuario ||
            senha !== CREDENCIAIS_ADM.senha
        ) {
            admErro.textContent = "Usuário ou senha de ADM inválidos.";
            return;
        }

        usuarioLogado = usuario;
        perfilLogado = "adm";
        sessionStorage.setItem("serveup_perfil", "adm");
        admErro.textContent = "";

        mostrarNotificacao("Login de ADM realizado com sucesso.");
        atualizarAcessoAdmCardapio();

        setTimeout(() => {
            window.location.href = "cardapio.html";
        }, 1200);

    });

}
