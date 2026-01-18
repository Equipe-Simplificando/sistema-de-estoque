const API_BASE = `http://${window.location.hostname}:3000`;

let listaMateriais = [];
let estadoOrdenacao = {
    coluna: "id",
    direcao: "asc",
};

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
            // Tenta pegar a quantidade: pode vir como 'quantidade' (API) ou 'qtd' (Session)
            const qtdExibir = material.qtd || `x${material.quantidade || 0}`;
            const itemExibir = material.item || material.nome_item;

            tr.innerHTML = `
                <td>${material.id}</td>
                <td>${itemExibir}</td>
                <td>${qtdExibir}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum item vinculado.</td></tr>';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nome = params.get("nome");
    const setor = params.get("setor");
    const obs = params.get("obs");
    const preco = params.get("preco");

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

    // Tenta carregar da sessão primeiro (se veio do submit do form)
    const itensSalvos = sessionStorage.getItem('ultimoProjetoMateriais');
    
    if (itensSalvos) {
        try {
            listaMateriais = JSON.parse(itensSalvos);
            ordenarLista(); 
            renderizarTabela();
        } catch (e) {
            console.error(e);
        }
    } else if (id) {
        // Fallback: Se não tem na sessão, busca do banco atualizado
        try {
            const res = await fetch(`${API_BASE}/api/materiais/projeto/${id}`);
            if (res.ok) {
                listaMateriais = await res.json();
                renderizarTabela();
            }
        } catch (error) {
            console.error("Erro ao buscar materiais:", error);
        }
    } else {
        renderizarTabela();
    }

    const btnEditar = document.getElementById("btn-editar");
    if (btnEditar) {
        btnEditar.onclick = function () {
            if (id) {
                window.location.href = `editar-projeto.html?id=${id}`;
            } else {
                alert("ID do projeto não encontrado.");
            }
        };
    }

    const btnDeletar = document.getElementById("btn-deletar");
    if (btnDeletar) {
        btnDeletar.addEventListener("click", async () => {
            if (!id) return;
            
            if (confirm("Tem certeza que deseja deletar este projeto?")) {
                try {
                    const response = await fetch(`${API_BASE}/api/deletar-projeto/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        alert("Projeto deletado com sucesso!");
                        window.location.href = "../main-pages/home/home-projeto.html";
                    } else {
                        alert("Erro ao deletar projeto.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Erro de conexão.");
                }
            }
        });
    }
});