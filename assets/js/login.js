const form = document.getElementById("loginForm");
const loader = document.getElementById("loading");
const msg = document.getElementById("mensagem-erro");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    msg.textContent = "";
    loader.style.display = "none";

    if ((usuario === "admin" && senha === "admin") || 
        (usuario === "logistico" && senha === "1234")) {
        
        loader.style.display = "block"; 

        setTimeout(() => {
            // CORREÇÃO AQUI:
            // Sobe um nível (../) para sair de 'auth' e entrar em 'main-pages'
            window.location.href = "../main-pages/home/home-material.html";
        }, 1000);
    } else {
        msg.textContent = "USUÁRIO OU SENHA INCORRETOS!";
    }
});