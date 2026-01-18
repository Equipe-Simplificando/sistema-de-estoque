const API_BASE = `http://${window.location.hostname}:3000`;

async function carregarProjetos() {
    try {
        const response = await fetch(`${API_BASE}/api/projetos`);
        const projetos = await response.json();
        const selectProjeto = document.getElementById("projeto");

        if (selectProjeto) {
            selectProjeto.innerHTML = '<option value="" selected disabled hidden></option>';
            projetos.forEach((proj) => {
                const option = document.createElement("option");
                option.value = proj.id;
                option.textContent = proj.nome_projeto;
                selectProjeto.appendChild(option);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarProjetos();

    const inputArquivo = document.getElementById("arquivo");
    const spanNome = document.getElementById("nome-arquivo");

    if (inputArquivo && spanNome) {
        inputArquivo.addEventListener("change", function () {
            if (this.files && this.files.length > 0) {
                spanNome.textContent = this.files[0].name;
                spanNome.style.color = "var(--cor-texto-escuro)";
            } else {
                spanNome.textContent = "";
            }
        });
    }

    const formulario = document.getElementById("formulario");
    if (formulario) {
        formulario.addEventListener("submit", enviarFormulario);
    }

    const btnFechar = document.querySelector(".botao-fechar");
    const popup = document.querySelector(".popup-overlay");

    if (btnFechar && popup) {
        const btnVoltarPopup = popup.querySelector(".acao-voltar");
        const btnConfirmarPopup = popup.querySelector(".acao-confirmar");

        btnFechar.addEventListener("click", (e) => {
            e.preventDefault();
            popup.classList.add("ativo");
        });

        if (btnVoltarPopup) {
            btnVoltarPopup.addEventListener("click", () => {
                popup.classList.remove("ativo");
            });
        }

        if (btnConfirmarPopup) {
            btnConfirmarPopup.addEventListener("click", () => {
                window.location.href = "../main-pages/home/home-material.html";
            });
        }
    }
});

async function enviarFormulario(e) {
    e.preventDefault();

    const destinoSelecionado = document.querySelector('input[name="destino"]:checked');
    const selectProjeto = document.getElementById("projeto");

    if (!destinoSelecionado) {
        alert("Por favor, selecione o Destino (Setor).");
        return;
    }

    const formData = new FormData();
    formData.append("item", document.getElementById("item").value);
    formData.append("quantidade", document.getElementById("quantidade").value);
    formData.append("destino", destinoSelecionado.value);
    formData.append("projeto", selectProjeto.value || "");
    formData.append("observacoes", document.getElementById("observacoes").value);

    const arquivoInput = document.getElementById("arquivo");
    if (arquivoInput.files[0]) {
        formData.append("arquivo", arquivoInput.files[0]);
    }

    try {
        const response = await fetch(`${API_BASE}/api/cadastrar`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            let nomeProjetoTexto = "-";
            if (selectProjeto.value) {
                nomeProjetoTexto = selectProjeto.options[selectProjeto.selectedIndex].text;
            }

            const idFormatado = String(result.id).padStart(4, "0");

            const params = new URLSearchParams({
                id: idFormatado,
                nome: document.getElementById("item").value,
                destino: destinoSelecionado.value,
                projeto: nomeProjetoTexto,
                obs: document.getElementById("observacoes").value || "-",
                cod: "MAT-" + idFormatado,
            });

            window.location.href = `etiqueta-gerada.html?${params.toString()}`;
        } else {
            alert("Erro ao cadastrar: " + (result.error || "Erro desconhecido."));
        }
    } catch (err) {
        alert("Erro de conexão. Verifique se o servidor está rodando.");
    }
}

function incrementarQtd() {
    const input = document.getElementById("quantidade");
    let val = parseInt(input.value) || 0;
    input.value = val + 1;
}

function decrementarQtd() {
    const input = document.getElementById("quantidade");
    let val = parseInt(input.value) || 0;
    if (val > 1) {
        input.value = val - 1;
    }
}