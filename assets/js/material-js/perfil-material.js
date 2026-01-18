const API_BASE = `http://${window.location.hostname}:3000`;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const projetoUrl = params.get("projeto");

    if (!id) {
        alert("ID não encontrado!");
        window.location.href = "../main-pages/home/home-material.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/materiais`);
        const materiais = await response.json();
        const material = materiais.find((m) => m.id == id);

        if (!material) {
            alert("Material não encontrado.");
            window.location.href = "../main-pages/home/home-material.html";
            return;
        }

        let nomeProjeto = "-";
        
        if (projetoUrl && projetoUrl !== "undefined" && projetoUrl !== "null" && projetoUrl !== "-") {
            nomeProjeto = projetoUrl;
        } 
        else if (material.projeto) {
            try {
                const resProj = await fetch(`${API_BASE}/api/projetos/${material.projeto}`);
                if (resProj.ok) {
                    const dadosProjeto = await resProj.json();
                    nomeProjeto = dadosProjeto.nome_projeto || "-";
                }
            } catch (err) {}
        }

        const idVisual = "#" + String(material.id).padStart(4, '0');
        document.getElementById("view_id").innerText = idVisual;

        const nome = material.nome_item;
        document.getElementById("view_item").innerText = nome || "-";

        const destino = material.destino;
        if (destino) {
            document.getElementById("view_destino").innerText =
                destino.charAt(0).toUpperCase() + destino.slice(1);
        } else {
            document.getElementById("view_destino").innerText = "-";
        }

        document.getElementById("view_quantidade").innerText = material.quantidade || "0";

        document.getElementById("view_projeto").innerText = nomeProjeto;

        const obs = material.observacoes;
        document.getElementById("view_obs").innerText =
            (obs && obs !== "null" && obs !== "") ? obs : "Sem observações.";

        const containerImagem = document.getElementById("view_imagem");
        if (material.arquivo_nome && material.arquivo_tipo && material.arquivo_tipo.startsWith('image/')) {
            containerImagem.innerHTML = '';
            const img = document.createElement('img');
            img.src = `${API_BASE}/api/materiais/arquivo/${material.id}?t=${Date.now()}`;
            img.alt = "Imagem do material";
            containerImagem.appendChild(img);
        }

        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        const codigoParaQRCode = material.cod || `MAT-${String(material.id).padStart(4, '0')}`;

        new QRCode(qrContainer, {
            text: codigoParaQRCode,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });

        const btnEditar = document.getElementById("btn-editar");
        if (btnEditar) {
            btnEditar.addEventListener("click", () => {
                window.location.href = `editar-material.html?id=${id}`;
            });
        }

        const btnDeletar = document.querySelector(".botao-vermelho");
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

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados.");
    }
});