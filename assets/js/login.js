document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const msg = document.getElementById("mensagem");
    const loader = document.getElementById("loading");

    // LIMPA MENSAGEM E GARANTE QUE O LOADER ESTÁ OCULTO
    msg.textContent = "";
    loader.style.display = "none";

    // LOGIN CORRETO
    if (usuario === "admin" && senha === "admin") {

        msg.style.color = "green";
        msg.textContent = "Login realizado com sucesso!";

        // MOSTRA O LOADER
        loader.style.display = "block";

        // AGUARDA 1 SEGUNDO E REDIRECIONA
        setTimeout(() => {
            window.location.href = "pagina-temporaria.html";
        }, 1000);

    } else {
        // LOGIN INCORRETO
        msg.style.color = "red";
        msg.textContent = "Usuário ou senha incorretos!";
        
        // Garante loader oculto no erro
        loader.style.display = "none";
    }
});