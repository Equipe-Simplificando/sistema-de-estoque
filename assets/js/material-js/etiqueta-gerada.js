const API_BASE = `http://${window.location.hostname}:3000`; 

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nome = params.get("nome");
    const destino = params.get("destino");
    const projeto = params.get("projeto");
    const obs = params.get("obs");
    const codigoParaQRCode = params.get("cod") || id || "ERRO";

    // Formatação visual do ID
    if (id) {
        const idVisual = id.includes("-") ? id : "#" + String(id).padStart(4, '0');
        document.getElementById("view_id").innerText = idVisual;
    }

    if (nome) document.getElementById("view_nome").innerText = nome;

    if (destino) {
        document.getElementById("view_destino").innerText =
            destino.charAt(0).toUpperCase() + destino.slice(1);
    } else {
        document.getElementById("view_destino").innerText = "-";
    }

    document.getElementById("view_projeto").innerText =
        (projeto && projeto !== "null" && projeto !== "") ? projeto : "-";

    document.getElementById("view_obs").innerText =
        (obs && obs !== "null" && obs !== "") ? obs : "Sem observações.";

    // Geração do QR Code
    if (codigoParaQRCode) {
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = ""; 

        new QRCode(qrContainer, {
            text: codigoParaQRCode,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    }

    // --- LÓGICA DO POP-UP DE IMPRESSÃO ---
    const btnReimprimir = document.getElementById("btn-acao-imprimir");
    const popup = document.querySelector(".popup-overlay");

    if (btnReimprimir && popup) {
        const btnVoltarPopup = popup.querySelector(".acao-voltar");
        const btnConfirmarPopup = popup.querySelector(".acao-confirmar");
        
        // Elementos de texto dentro do pop-up
        const popNome = document.getElementById("pop-nome-material");
        const popId = document.getElementById("pop-id-material");

        // 1. Abrir Pop-up e Preencher dados
        btnReimprimir.addEventListener("click", () => {
            // Pega o que está na tela no momento
            popNome.innerText = document.getElementById("view_nome").innerText;
            popId.innerText = document.getElementById("view_id").innerText;
            
            popup.classList.add("ativo");
        });

        // 2. Voltar (Fechar)
        if (btnVoltarPopup) {
            btnVoltarPopup.addEventListener("click", () => {
                popup.classList.remove("ativo");
            });
        }

        // 3. Confirmar (Imprimir)
        if (btnConfirmarPopup) {
            btnConfirmarPopup.addEventListener("click", () => {
                popup.classList.remove("ativo");
                setTimeout(() => {
                    window.print();
                }, 300); // Pequeno delay para garantir que o modal sumiu visualmente antes de imprimir
            });
        }
    }
    // -------------------------------------

    // Botão Editar
    const btnEditar = document.getElementById("btn-editar");
    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const paramsEdit = new URLSearchParams({
                id: id,
                nome: nome,
                destino: destino,
                projeto: projeto,
                obs: obs,
            });
            window.location.href = `editar-material.html?${paramsEdit.toString()}`;
        });
    }

    // Lógica de Exclusão
    const btnDeletar = document.querySelector(".botao-vermelho"); // Botão original da página (DELETAR)
    const perfilUsuario = localStorage.getItem("perfilUsuario");

    if (btnDeletar) {
        if (perfilUsuario === "admin") {
            btnDeletar.onclick = async () => {
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir este material?")) {
                    try {
                        const res = await fetch(`${API_BASE}/api/deletar/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert("Material excluído com sucesso!");
                            window.location.href = "../main-pages/home/home-material.html";
                        } else {
                            const erro = await res.json();
                            alert("Erro ao excluir: " + (erro.error || "Erro desconhecido"));
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Erro de conexão com o servidor.");
                    }
                }
            };
        } else {
            btnDeletar.style.display = "none";
        }
    }
});