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

    if (usuario === "admin" && senha === "admin") {
        loader.style.display = "block"; // mostra loader

        setTimeout(() => {
            window.location.href = "pagina-temporaria.html";
        }, 1000);
    } else {
        msg.textContent = "USUÁRIO OU SENHA INCORRETOS!";
    }
});
