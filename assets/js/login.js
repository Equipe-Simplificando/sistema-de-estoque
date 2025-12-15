const form = document.getElementById("loginForm");
const loader = document.getElementById("loading");
const msg = document.getElementById("mensagem-erro");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Limpa mensagem e esconde loader
    msg.textContent = "";
    loader.style.display = "none";

    // LÓGICA DE VALIDAÇÃO ALTERADA AQUI
    // Verifica se é Admin (senha: admin) OU se é Logistico (senha: logistico)
    if ((usuario === "admin" && senha === "admin") || 
        (usuario === "logistico" && senha === "1234")) {
        
        loader.style.display = "block"; // mostra loader

        // Redireciona para a mesma página temporária
        setTimeout(() => {
            window.location.href = "pagina-temporaria.html";
        }, 1000);
    } else {
        msg.textContent = "USUÁRIO OU SENHA INCORRETOS!";
    }
});