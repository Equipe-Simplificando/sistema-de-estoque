document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID não encontrado!");
        window.location.href = "../main-pages/home/home-material.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/materiais");
        const materiais = await response.json();
        const material = materiais.find((m) => m.id == id);

        if (!material) {
            alert("Material não encontrado.");
            window.location.href = "../main-pages/home/home-material.html";
            return;
        }

        const idVisual = "#" + String(material.id).padStart(4, '0');
        document.getElementById("view_id").textContent = idVisual;

        document.getElementById("view_item").textContent = material.nome_item || "-";
        
        const destino = material.destino ? material.destino.charAt(0).toUpperCase() + material.destino.slice(1) : "-";
        document.getElementById("view_destino").textContent = destino;
        
        document.getElementById("view_quantidade").textContent = material.quantidade || "0";
        document.getElementById("view_projeto").textContent = material.projeto || "-";
        document.getElementById("view_obs").textContent = material.observacoes || "Sem observações.";

        const containerImagem = document.getElementById("view_imagem");
        
        if (material.arquivo_nome && material.arquivo_tipo && material.arquivo_tipo.startsWith('image/')) {
            containerImagem.innerHTML = ''; 
            
            const img = document.createElement('img');
            img.src = `http://localhost:3000/api/materiais/arquivo/${material.id}?t=${Date.now()}`;
            img.alt = "Imagem do material";
            
            containerImagem.appendChild(img);
        }

        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        
        const conteudoQR = material.cod || `MAT-${String(material.id).padStart(4, '0')}`;

        new QRCode(qrContainer, {
            text: conteudoQR,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        const btnEditar = document.getElementById("btn-editar");
        if (btnEditar) {
            btnEditar.onclick = () => {
                window.location.href = `editar-material.html?id=${id}`;
            };
        }

        const btnExcluir = document.querySelector(".botao-vermelho");
        const perfilUsuario = localStorage.getItem("perfilUsuario");

        if (btnExcluir) {
            if (perfilUsuario === "admin") {
                btnExcluir.onclick = async () => {
                    if (confirm("Tem certeza que deseja EXCLUIR este material permanentemente?")) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/deletar/${id}`, { method: 'DELETE' });
                            if (res.ok) {
                                alert("Material excluído com sucesso!");
                                window.location.href = "../main-pages/home/home-material.html";
                            } else {
                                const erro = await res.json();
                                alert("Erro ao excluir: " + (erro.error || "Erro desconhecido"));
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Erro de conexão.");
                        }
                    }
                };
            } else {
                btnExcluir.style.display = "none";
            }
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados.");
    }
});