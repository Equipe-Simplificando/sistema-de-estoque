const API_BASE = `http://${window.location.hostname}:3000`;

let listaMateriais = [];
let estadoOrdenacao = {
    coluna: "id",
    direcao: "asc",
};

// --- FUNÇÕES DE TABELA ---
window.ordenarPor = function (coluna) {
    if (estadoOrdenacao.coluna === coluna) {
        estadoOrdenacao.direcao = estadoOrdenacao.direcao === "asc" ? "desc" : "asc";
    } else {
        estadoOrdenacao.coluna = coluna;
        estadoOrdenacao.direcao = "asc";
    }
    ordenarLista();
    renderizarTabela();
};

function ordenarLista() {
    const coluna = estadoOrdenacao.coluna;
    listaMateriais.sort((a, b) => {
        let valorA = a[coluna];
        let valorB = b[coluna];

        if (coluna === "id") {
            valorA = Number(valorA) || 0;
            valorB = Number(valorB) || 0;
        } else if (coluna === "qtd") {
             valorA = parseInt(String(valorA).replace('x', '')) || 0;
             valorB = parseInt(String(valorB).replace('x', '')) || 0;
        } else {
            valorA = (valorA || "").toString().toLowerCase();
            valorB = (valorB || "").toString().toLowerCase();
        }

        if (valorA < valorB) return estadoOrdenacao.direcao === "asc" ? -1 : 1;
        if (valorA > valorB) return estadoOrdenacao.direcao === "asc" ? 1 : -1;
        return 0;
    });
}

function renderizarTabela() {
    const tbody = document.getElementById("tabela-corpo");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (listaMateriais.length > 0) {
        listaMateriais.forEach(material => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${material.id}</td>
                <td>${material.item}</td>
                <td>${material.qtd}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum item adicionado.</td></tr>';
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    // Pega dados da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id"); // O ID VEM DAQUI
    const nome = params.get("nome");
    const setor = params.get("setor");
    const obs = params.get("obs");
    const preco = params.get("preco");

    console.log("ID do Projeto carregado:", id); // LOG DE DEPURAÇÃO

    // Preenche a tela
    const elNome = document.getElementById("view_nome");
    const elSetor = document.getElementById("view_setor");
    const elObs = document.getElementById("view_obs");
    const elPreco = document.getElementById("view_preco");

    if (elNome) elNome.textContent = nome || "--";
    
    if (elSetor) {
        let setorFormatado = setor;
        if (setor === 'robotica') setorFormatado = 'Robótica';
        if (setor === 'manutencao') setorFormatado = 'Manutenção';
        elSetor.textContent = setorFormatado || "--";
    }

    if (elObs) elObs.textContent = obs || "-";

    if (elPreco) {
        elPreco.textContent = preco ? `R$ ${preco}` : "R$ 0,00";
    }

    // Carrega tabela da sessão
    const itensSalvos = sessionStorage.getItem('ultimoProjetoMateriais');
    if (itensSalvos) {
        try {
            listaMateriais = JSON.parse(itensSalvos);
            ordenarLista(); 
            renderizarTabela();
        } catch (e) {
            console.error(e);
        }
    } else {
        renderizarTabela();
    }

    // --- LÓGICA DO BOTÃO EDITAR ---
    const btnEditar = document.getElementById("btn-editar");
    if (btnEditar) {
        btnEditar.onclick = function () {
            if (id) {
                window.location.href = `editar-projeto.html?id=${id}`;
            } else {
                alert("Erro: ID do projeto não encontrado na URL.");
            }
        };
    }

    // --- LÓGICA DO BOTÃO DELETAR (CORRIGIDA) ---
    const btnDeletar = document.getElementById("btn-deletar");
    
    if (btnDeletar) {
        // Remove qualquer listener antigo (boa prática se estiver usando frameworks, mas ok aqui)
        btnDeletar.replaceWith(btnDeletar.cloneNode(true));
        
        // Pega a nova referência após o replace
        const novoBtnDeletar = document.getElementById("btn-deletar");

        novoBtnDeletar.addEventListener("click", async () => {
            console.log("Clicou em deletar. ID:", id); // LOG DE DEPURAÇÃO

            if (!id) {
                alert("Erro: Não é possível deletar. ID do projeto indefinido.");
                return;
            }
            
            if (confirm("Tem certeza que deseja deletar este projeto permanentemente?")) {
                try {
                    const response = await fetch(`${API_BASE}/api/deletar-projeto/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log("Status da resposta:", response.status); // LOG DE DEPURAÇÃO

                    if (response.ok) {
                        alert("Projeto deletado com sucesso!");
                        // Limpa a sessão para não carregar lixo depois
                        sessionStorage.removeItem('ultimoProjetoMateriais');
                        window.location.href = "../main-pages/home/home-projeto.html";
                    } else {
                        const errorData = await response.json(); // Tenta ler erro do back
                        alert("Erro ao deletar: " + (errorData.error || response.statusText));
                    }
                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro de conexão ao tentar deletar.");
                }
            }
        });
    } else {
        console.error("Botão de deletar não encontrado no HTML!");
    }
});