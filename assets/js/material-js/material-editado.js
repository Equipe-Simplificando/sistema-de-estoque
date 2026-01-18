const API_BASE = `http://${window.location.hostname}:3000`; 

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // Tenta pegar o nome do projeto se vier pela URL (otimização)
    const projetoUrl = params.get("projeto");

    if (!id) {
        alert("ID não identificado.");
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

        // --- 1. PREENCHIMENTO DOS DADOS ---
        const idVisual = "#" + String(material.id).padStart(4, '0');
        document.getElementById("view_id").innerText = idVisual;

        document.getElementById("view_nome").innerText = material.nome_item || "Sem nome";

        if (material.destino) {
            document.getElementById("view_destino").innerText = 
                material.destino.charAt(0).toUpperCase() + material.destino.slice(1);
        } else {
            document.getElementById("view_destino").innerText = "-";
        }

        // Lógica Inteligente do Projeto (URL ou Busca no Banco)
        const viewProjeto = document.getElementById("view_projeto");
        viewProjeto.innerText = "-"; // Padrão

        if (projetoUrl && projetoUrl !== "undefined" && projetoUrl !== "null") {
            // Se veio na URL, usa direto
            viewProjeto.innerText = projetoUrl;
        } 
        else if (material.projeto) {
            // Se não, busca no banco pelo ID
            try {
                const resProj = await fetch(`${API_BASE}/api/projetos/${material.projeto}`);
                if (resProj.ok) {
                    const dadosProj = await resProj.json();
                    viewProjeto.innerText = dadosProj.nome_projeto || "-";
                }
            } catch (err) {
                console.error("Erro ao buscar projeto:", err);
            }
        }

        document.getElementById("view_obs").innerText = 
            (material.observacoes && material.observacoes !== "") ? material.observacoes : "Sem observações.";

        // --- 2. IMAGEM ---
        const containerImagem = document.getElementById("view_imagem");
        
        if (material.arquivo_nome && material.arquivo_tipo && material.arquivo_tipo.startsWith('image/')) {
            containerImagem.innerHTML = ''; 
            
            const img = document.createElement('img');
            img.src = `${API_BASE}/api/materiais/arquivo/${id}?t=${Date.now()}`;
            img.style.maxWidth = "100%";
            img.style.borderRadius = "var(--radius)";
            img.alt = "Imagem do material";
            
            containerImagem.appendChild(img);
        } 

        // --- 3. QR CODE ---
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

        // --- 4. LÓGICA DO POP-UP DE IMPRESSÃO ---
        // (Funciona se você tiver colocado o HTML do Exemplo 3 e um botão com classe .botao-imprimir)
        const btnReimprimir = document.querySelector(".botao-imprimir");
        const popup = document.querySelector(".popup-overlay");

        if (btnReimprimir && popup) {
            const btnVoltarPopup = popup.querySelector(".acao-voltar");
            const btnConfirmarPopup = popup.querySelector(".acao-confirmar");
            
            const popNome = document.getElementById("pop-nome-material");
            const popId = document.getElementById("pop-id-material");

            btnReimprimir.addEventListener("click", () => {
                // Preenche o pop-up com os dados da tela
                if(popNome) popNome.innerText = document.getElementById("view_nome").innerText;
                if(popId) popId.innerText = document.getElementById("view_id").innerText;
                
                popup.classList.add("ativo");
            });

            if (btnVoltarPopup) {
                btnVoltarPopup.addEventListener("click", () => {
                    popup.classList.remove("ativo");
                });
            }

            if (btnConfirmarPopup) {
                btnConfirmarPopup.addEventListener("click", () => {
                    popup.classList.remove("ativo");
                    setTimeout(() => {
                        window.print();
                    }, 300);
                });
            }
        }

        // --- 5. BOTÕES DE AÇÃO ---
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
                    if (confirm("ATENÇÃO: Tem certeza que deseja DELETAR este material permanentemente?")) {
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
        alert("Erro de conexão com o servidor.");
    }
});