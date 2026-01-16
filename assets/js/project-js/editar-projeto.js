const API_BASE = `http://${window.location.hostname}:3000`;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    let materiaisDisponiveis = [];

    if (!id) {
        alert("ID do projeto não encontrado.");
        window.location.href = "../main-pages/home/home-projeto.html";
        return;
    }

    const inputId = document.getElementById("id-projeto");
    if(inputId) inputId.value = id;

    await carregarMateriaisGlobais();

    try {
        const response = await fetch(`${API_BASE}/api/projetos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar projeto");
        
        const projeto = await response.json();

        document.getElementById("item").value = projeto.nome_projeto || "";
        document.getElementById("observacoes").value = projeto.observacoes || "";
        
        const campoPreco = document.getElementById("preco");
        if(campoPreco) {
            campoPreco.value = projeto.preco ? projeto.preco : "";
        }

        if (projeto.setor) {
            const radio = document.querySelector(`input[name="destino"][value="${projeto.setor.toLowerCase()}"]`);
            if (radio) radio.checked = true;
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar dados do projeto. Verifique o console.");
    }

    try {
        const resMateriais = await fetch(`${API_BASE}/api/materiais/projeto/${id}`);
        if(resMateriais.ok) {
            const materiais = await resMateriais.json();
            renderizarTabela(materiais);
        }
    } catch (error) {
        console.error("Erro ao carregar itens do projeto:", error);
    }

    const btnAdicionar = document.getElementById("btn-adicionar-material");
    const inputPesquisa = document.getElementById("pesquisa-item");

    if(btnAdicionar && inputPesquisa) {
        const adicionarItem = () => {
            const termoPesquisado = inputPesquisa.value.trim();
            if(!termoPesquisado) return;

            const materialEncontrado = materiaisDisponiveis.find(m => 
                m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
            );

            if (materialEncontrado) {
                const idsNaTabela = Array.from(document.querySelectorAll('.item-id'))
                                         .map(td => td.textContent);
                if(idsNaTabela.includes(String(materialEncontrado.id))){
                    alert("Este item já está na lista.");
                    inputPesquisa.value = "";
                    return;
                }

                adicionarLinhaNaTabela(
                    materialEncontrado.nome_item, 
                    materialEncontrado.quantidade, 
                    materialEncontrado.id
                );
                
                inputPesquisa.value = ""; 
                inputPesquisa.focus();
            } else {
                alert("Material não encontrado no estoque.");
            }
        };

        btnAdicionar.addEventListener("click", adicionarItem);
        inputPesquisa.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                adicionarItem();
            }
        });
    }

    const tabelaCorpo = document.getElementById("tabela-corpo");
    if (tabelaCorpo) {
        tabelaCorpo.addEventListener("click", (e) => {
            const botaoExcluir = e.target.closest(".botao-excluir");
            if (botaoExcluir) {
                botaoExcluir.closest("tr").remove();
            }
        });
    }

    const perfil = localStorage.getItem("perfilUsuario");
    if (perfil === "admin") {
        const grupoAcoes = document.querySelector(".grupo-acoes");
        
        if (!document.getElementById("btn-excluir-dinamico")) {
            const btnExcluir = document.createElement("button");
            btnExcluir.id = "btn-excluir-dinamico";
            btnExcluir.type = "button";
            btnExcluir.textContent = "EXCLUIR PROJETO";
            btnExcluir.className = "botao";
            btnExcluir.style.backgroundColor = "#d32f2f"; 
            btnExcluir.style.boxShadow = "inset 0 -4px 0 1px #b71c1c";
            btnExcluir.style.marginTop = "1rem";
            
            btnExcluir.onclick = async function() {
                if (confirm("ATENÇÃO: Excluir este projeto irá desvincular todos os materiais associados a ele. Continuar?")) {
                    try {
                        const res = await fetch(`${API_BASE}/api/deletar-projeto/${id}`, { method: 'DELETE' });
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

    const form = document.getElementById("formulario");
    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const radioSelecionado = document.querySelector('input[name="destino"]:checked');
            const setorValor = radioSelecionado ? radioSelecionado.value : "";

            const materiaisParaSalvar = [];
            document.querySelectorAll('#tabela-corpo tr').forEach(row => {
                const idMat = row.querySelector('.item-id').textContent;
                if(idMat) materiaisParaSalvar.push(parseInt(idMat));
            });

            const dados = {
                id: id,
                item: document.getElementById("item").value,
                destino: setorValor,
                observacoes: document.getElementById("observacoes").value,
                preco: document.getElementById("preco").value,
                materiais: materiaisParaSalvar 
            };

            try {
                const response = await fetch(`${API_BASE}/api/atualizar-projeto`, {
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

    async function carregarMateriaisGlobais() {
        try {
            const response = await fetch(`${API_BASE}/api/materiais`);
            if (!response.ok) throw new Error("Erro ao buscar lista de materiais");
    
            materiaisDisponiveis = await response.json();
            const datalist = document.getElementById("lista-materiais");
    
            if (datalist) {
                datalist.innerHTML = ""; 
                const nomesUnicos = new Set(materiaisDisponiveis.map(m => m.nome_item));
                nomesUnicos.forEach(nome => {
                    const option = document.createElement("option");
                    option.value = nome;
                    datalist.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar sugestões:", error);
        }
    }

    function renderizarTabela(listaMateriais) {
        const tbody = document.getElementById("tabela-corpo");
        if(!tbody) return;
        
        tbody.innerHTML = ""; 
    
        if(listaMateriais.length === 0) return;
    
        listaMateriais.forEach(material => {
            const qtdReal = (material.quantidade !== undefined && material.quantidade !== null) 
                            ? material.quantidade 
                            : 0;
            
            adicionarLinhaNaTabela(material.nome_item, qtdReal, material.id);
        });
    }

    function adicionarLinhaNaTabela(nome, qtd, id) {
        const tbody = document.getElementById("tabela-corpo");
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td class="item-id">${id}</td>
            <td class="item-nome">${nome}</td>
            <td class="item-qtd">x${qtd}</td>
            <td>
                <button type="button" class="botao-excluir" aria-label="Remover item">
                    <img src="../../assets/icons/icon-excluir.svg" alt="Excluir">
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    }
});