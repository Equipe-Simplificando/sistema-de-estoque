document.addEventListener("DOMContentLoaded", () => {
    // Elementos do DOM
    const form = document.getElementById("formulario");
    const inputPesquisa = document.getElementById("pesquisa-item");
    const btnAdicionar = document.getElementById("btn-adicionar-material");
    const tabelaCorpo = document.getElementById("tabela-corpo");
    const dataListMateriais = document.getElementById("lista-materiais");
    // const btnFechar = document.getElementById("btn-fechar"); // Removido controle manual do botão fechar

    // Campos do formulário
    const idInput = document.getElementById("id-projeto");
    const nomeInput = document.getElementById("item");
    const obsInput = document.getElementById("observacoes");
    const precoInput = document.getElementById("preco");

    let materiaisDisponiveis = [];

    // =========================================================
    // 1. CARREGAR DADOS INICIAIS (URL + SESSION STORAGE)
    // =========================================================
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nome = params.get("nome");
    const setor = params.get("setor");
    const obs = params.get("obs");
    const preco = params.get("preco");

    // Preenche campos básicos
    if(idInput) idInput.value = id || "";
    if(nomeInput) nomeInput.value = nome || "";
    if(obsInput) obsInput.value = (obs === "Sem observações") ? "" : obs;
    
    // Tratamento do preço
    let precoFormatado = preco ? preco.replace("R$", "").trim() : "";
    if(precoInput) precoInput.value = precoFormatado;

    // Seleciona o Radio Button correto
    if (setor) {
        const radio = document.querySelector(`input[name="destino"][value="${setor}"]`);
        if (radio) radio.checked = true;
    }

    // A linha abaixo foi removida para que o botão X leve à Home (conforme definido no HTML)
    // if(btnFechar) { btnFechar.href = ... } 

    // Preenche a tabela com os itens que estavam na memória (SessionStorage)
    const itensSalvos = sessionStorage.getItem('ultimoProjetoMateriais');
    if (itensSalvos && tabelaCorpo) {
        const itens = JSON.parse(itensSalvos);
        itens.forEach(item => {
            adicionarLinhaNaTabela(item.id, item.item, item.qtd);
        });
    }

    // =========================================================
    // 2. CARREGAR LISTA DE MATERIAIS (DO BANCO)
    // =========================================================
    async function carregarMateriais() {
        try {
            const response = await fetch('http://localhost:3000/api/materiais');
            if (!response.ok) throw new Error('Falha ao buscar materiais');
            
            materiaisDisponiveis = await response.json();
            
            dataListMateriais.innerHTML = '';
            materiaisDisponiveis.forEach(material => {
                const option = document.createElement('option');
                option.value = material.nome_item;
                dataListMateriais.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar materiais:", error);
        }
    }
    carregarMateriais();

    // =========================================================
    // 3. FUNÇÕES DA TABELA (ADICIONAR / REMOVER)
    // =========================================================
    
    function adicionarLinhaNaTabela(id, nome, qtd) {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td class="item-id">${id}</td>
            <td class="item-nome">${nome}</td>
            <td class="item-qtd">${qtd}</td>
            <td>
                <button type="button" class="botao-excluir" aria-label="Remover item">
                    <img src="../../assets/icons/icon-excluir.svg" alt="">
                </button>
            </td>
        `;
        tabelaCorpo.appendChild(novaLinha);
    }

    function adicionarMaterialDoInput() {
        const termoPesquisado = inputPesquisa.value.trim();
        if (!termoPesquisado) return;

        const materialEncontrado = materiaisDisponiveis.find(m => 
            m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
        );

        if (materialEncontrado) {
            adicionarLinhaNaTabela(materialEncontrado.id, materialEncontrado.nome_item, "x1");
            inputPesquisa.value = '';
            inputPesquisa.focus();
        } else {
            alert("Material não encontrado no estoque.");
        }
    }

    if (btnAdicionar) btnAdicionar.addEventListener("click", adicionarMaterialDoInput);
    
    if (inputPesquisa) {
        inputPesquisa.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                adicionarMaterialDoInput();
            }
        });
    }

    if (tabelaCorpo) {
        tabelaCorpo.addEventListener("click", (e) => {
            const botaoExcluir = e.target.closest(".botao-excluir");
            if (botaoExcluir) {
                botaoExcluir.closest("tr").remove();
            }
        });
    }

    // =========================================================
    // 4. SALVAR ALTERAÇÕES
    // =========================================================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = idInput.value;
        const nome = nomeInput.value;
        const obs = obsInput.value;
        const preco = precoInput.value;
        const setorInput = document.querySelector('input[name="destino"]:checked');
        const setor = setorInput ? setorInput.value : null;

        if (!nome || !setor) {
            alert("Preencha Nome e Setor.");
            return;
        }

        // Captura os itens atuais da tabela
        const materiaisAtualizados = [];
        document.querySelectorAll('#tabela-corpo tr').forEach(row => {
            materiaisAtualizados.push({
                id: row.querySelector('.item-id').textContent,
                item: row.querySelector('.item-nome').textContent,
                qtd: row.querySelector('.item-qtd').textContent
            });
        });

        try {
            // Atualiza os dados básicos no servidor
            const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, item: nome, destino: setor, observacoes: obs }),
            });

            const result = await response.json();

            if (result.success) {
                // Atualiza a SessionStorage com a nova lista de itens
                sessionStorage.setItem('ultimoProjetoMateriais', JSON.stringify(materiaisAtualizados));

                // Redireciona de volta para a tela de visualização com os dados novos
                const paramsRedir = new URLSearchParams({
                    id: id,
                    nome: nome,
                    setor: setor,
                    obs: obs,
                    preco: preco || "0,00",
                });

                window.location.href = `projeto-cadastrado.html?${paramsRedir.toString()}`;
            } else {
                alert("Erro ao atualizar: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão ao tentar atualizar.");
        }
    });
});