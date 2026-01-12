const form = document.getElementById("loginForm");
const loader = document.getElementById("loading");
const msg = document.getElementById("mensagem-erro");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    msg.textContent = "";
    loader.style.display = "block";

    setTimeout(() => {
        if (usuario === "admin" && senha === "admin") {
            localStorage.setItem("perfilUsuario", "admin");
            window.location.href = "../main-pages/home/home-material.html";
        } else if (usuario === "logistico" && senha === "1234") {
            localStorage.setItem("perfilUsuario", "logistico");
            window.location.href = "../main-pages/home/home-material.html";
        } else {
            loader.style.display = "none";
            msg.textContent = "USUÁRIO OU SENHA INCORRETOS!";
        }
    }, 1000);
});