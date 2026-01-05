const form = document.getElementById("loginForm");
const loader = document.getElementById("loading");
const msg = document.getElementById("mensagem-erro");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    msg.textContent = "";
    loader.style.display = "none";

    // LÓGICA DE PERFIL
    if (usuario === "admin" && senha === "admin") {
        loader.style.display = "block"; 
        // Salva que é admin
        localStorage.setItem("perfilUsuario", "admin");

        setTimeout(() => {
            window.location.href = "../main-pages/home/home-material.html";
        }, 1000);

    } else if (usuario === "logistico" && senha === "1234") {
        loader.style.display = "block";
        // Salva que é logistico
        localStorage.setItem("perfilUsuario", "logistico");

        setTimeout(() => {
            window.location.href = "../main-pages/home/home-material.html";
        }, 1000);

    } else {
        msg.textContent = "USUÁRIO OU SENHA INCORRETOS!";
    }
});