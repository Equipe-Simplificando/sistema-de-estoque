document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID do projeto não encontrado.");
        window.location.href = "../main-pages/home/home-projeto.html";
        return;
    }

    const inputId = document.getElementById("id-projeto");
    if(inputId) inputId.value = id;

    // 1. CARREGAR DADOS DO PROJETO
    try {
        const response = await fetch(`http://localhost:3000/api/projetos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar projeto");
        
        const projeto = await response.json();

        // Preenche Nome e Observações
        document.getElementById("item").value = projeto.nome_projeto || "";
        document.getElementById("observacoes").value = projeto.observacoes || "";
        
        // Preenche Preço
        const campoPreco = document.getElementById("preco");
        if(campoPreco) {
            campoPreco.value = projeto.preco ? projeto.preco : "";
        }

        // Preenche Radio Button (Setor)
        if (projeto.setor) {
            const radio = document.querySelector(`input[name="destino"][value="${projeto.setor.toLowerCase()}"]`);
            if (radio) radio.checked = true;
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar dados do projeto. Verifique o console.");
    }

    // 2. CARREGAR ITENS (MATERIAIS) DO PROJETO
    try {
        const resMateriais = await fetch(`http://localhost:3000/api/materiais/projeto/${id}`);
        if(resMateriais.ok) {
            const materiais = await resMateriais.json();
            renderizarTabela(materiais);
        }
    } catch (error) {
        console.error("Erro ao carregar itens do projeto:", error);
    }

    // --- LÓGICA DO BOTÃO EXCLUIR (ADMIN) ---
    const perfil = localStorage.getItem("perfilUsuario");
    if (perfil === "admin") {
        const grupoAcoes = document.querySelector(".grupo-acoes");
        
        if (!document.getElementById("btn-excluir-dinamico")) {
            const btnExcluir = document.createElement("button");
            btnExcluir.id = "btn-excluir-dinamico";
            btnExcluir.type = "button";
            btnExcluir.textContent = "EXCLUIR PROJETO";
            btnExcluir.className = "botao";
            btnExcluir.style.backgroundColor = "#d32f2f"; // Vermelho
            btnExcluir.style.boxShadow = "inset 0 -4px 0 1px #b71c1c";
            btnExcluir.style.marginTop = "1rem";
            
            btnExcluir.onclick = async function() {
                if (confirm("ATENÇÃO: Excluir este projeto irá desvincular todos os materiais associados a ele. Continuar?")) {
                    try {
                        const res = await fetch(`http://localhost:3000/api/deletar-projeto/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert("Projeto excluído com sucesso!");
                            window.location.href = "../main-pages/home/home-projeto.html";
                        } else {
                            alert("Erro ao excluir projeto.");
                        }
                    } catch (e) {
                        console.error(e);
                        alert("Erro de conexão.");
                    }
                }
            };

            if(grupoAcoes) {
                grupoAcoes.appendChild(btnExcluir);
            }
        }
    }

    // --- EVENTO DE SALVAR (UPDATE) ---
    const form = document.getElementById("formulario");
    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const radioSelecionado = document.querySelector('input[name="destino"]:checked');
            const setorValor = radioSelecionado ? radioSelecionado.value : "";

            const dados = {
                id: id,
                item: document.getElementById("item").value,
                destino: setorValor,
                observacoes: document.getElementById("observacoes").value,
                preco: document.getElementById("preco").value
            };

            try {
                const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert("Projeto atualizado com sucesso!");
                    window.location.href = "../main-pages/home/home-projeto.html";
                } else {
                    alert("Erro ao atualizar projeto.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro de conexão.");
            }
        });
    }
});

// Função auxiliar para preencher a tabela HTML
function renderizarTabela(listaMateriais) {
    const tbody = document.getElementById("tabela-corpo");
    if(!tbody) return;
    
    tbody.innerHTML = ""; 

    if(listaMateriais.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 1rem;'>Nenhum item vinculado a este projeto.</td></tr>";
        return;
    }

    listaMateriais.forEach(material => {
        // CORREÇÃO: Tratamento para mostrar a quantidade real (incluindo 0)
        const qtdReal = (material.quantidade !== undefined && material.quantidade !== null) 
                        ? material.quantidade 
                        : 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${material.id}</td>
            <td>${material.nome_item}</td>
            <td>x${qtdReal}</td>
            <td></td>
        `;
        tbody.appendChild(tr);
    });
}