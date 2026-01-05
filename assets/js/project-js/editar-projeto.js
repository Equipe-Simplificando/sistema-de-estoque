document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos do DOM ---
    const form = document.getElementById("formulario");
    const inputPesquisa = document.getElementById("pesquisa-item");
    const btnAdicionar = document.getElementById("btn-adicionar-material");
    const tabelaCorpo = document.getElementById("tabela-corpo");
    const dataListMateriais = document.getElementById("lista-materiais");

    // --- Campos do formulário ---
    const idInput = document.getElementById("id-projeto");
    const nomeInput = document.getElementById("item");
    const obsInput = document.getElementById("observacoes");
    const precoInput = document.getElementById("preco");

    let materiaisDisponiveis = []; // Todos os materiais do sistema (para o datalist)

    // =========================================================
    // 1. INICIALIZAÇÃO: PEGAR ID DA URL E CARREGAR DADOS
    // =========================================================
    const params = new URLSearchParams(window.location.search);
    const idProjeto = params.get("id");

    if (idProjeto) {
        carregarDadosDoProjeto(idProjeto);
    } else {
        alert("ID do projeto não fornecido.");
        window.location.href = "../main-pages/home/home-projeto.html";
    }

    // Carrega a lista geral de materiais para o autocomplete (datalist)
    carregarListaGeralMateriais();


    // =========================================================
    // 2. FUNÇÃO: BUSCAR DADOS DO PROJETO E SEUS MATERIAIS
    // =========================================================
    async function carregarDadosDoProjeto(id) {
        try {
            // A. Busca dados do Projeto
            const resProjeto = await fetch(`http://localhost:3000/api/projetos/${id}`);
            if (!resProjeto.ok) throw new Error("Erro ao buscar projeto");
            const projeto = await resProjeto.json();

            // Preenche o formulário
            if (idInput) idInput.value = projeto.id;
            if (nomeInput) nomeInput.value = projeto.nome_projeto;
            if (obsInput) obsInput.value = projeto.observacoes || "";
            // Nota: O campo 'preco' não existe no banco, então virá vazio.
            if (precoInput && projeto.preco) precoInput.value = projeto.preco;

            // Marca o Radio Button do Setor
            if (projeto.setor) {
                const radio = document.querySelector(`input[name="destino"][value="${projeto.setor}"]`);
                if (radio) radio.checked = true;
            }

            // B. Busca materiais vinculados a este projeto (pelo Nome do Projeto)
            carregarMateriaisVinculados(projeto.nome_projeto);

        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao carregar dados do projeto. Verifique o console.");
        }
    }

    async function carregarMateriaisVinculados(nomeDoProjeto) {
        try {
            const resMateriais = await fetch('http://localhost:3000/api/materiais');
            const todosMateriais = await resMateriais.json();

            // Filtra materiais onde o campo 'projeto' é igual ao nome deste projeto
            // Normaliza (minusculo e trim) para evitar erros de digitação
            const nomeProjNorm = String(nomeDoProjeto).trim().toLowerCase();

            const materiaisDoProjeto = todosMateriais.filter(m => {
                if (!m.projeto) return false;
                return String(m.projeto).trim().toLowerCase() === nomeProjNorm;
            });

            // Limpa e preenche a tabela
            tabelaCorpo.innerHTML = "";
            if (materiaisDoProjeto.length > 0) {
                materiaisDoProjeto.forEach(mat => {
                    const qtd = mat.quantidade ? mat.quantidade : 1;
                    adicionarLinhaNaTabela(mat.id, mat.nome_item, `x${qtd}`);
                });
            } else {
               // Opcional: Mostrar mensagem de "Nenhum item" na tabela
            }

        } catch (error) {
            console.error("Erro ao carregar materiais do projeto:", error);
        }
    }

    // =========================================================
    // 3. CARREGAR DATALIST (AUTOCOMPLETE)
    // =========================================================
    async function carregarListaGeralMateriais() {
        try {
            const response = await fetch('http://localhost:3000/api/materiais');
            materiaisDisponiveis = await response.json();
            
            dataListMateriais.innerHTML = '';
            // Cria lista única de nomes para não repetir no dropdown
            const nomesUnicos = new Set(materiaisDisponiveis.map(m => m.nome_item));
            
            nomesUnicos.forEach(nome => {
                const option = document.createElement('option');
                option.value = nome;
                dataListMateriais.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar lista geral:", error);
        }
    }

    // =========================================================
    // 4. MANIPULAÇÃO DA TABELA (FRONTEND)
    // =========================================================
    function adicionarLinhaNaTabela(id, nome, qtd) {
        const novaLinha = document.createElement('tr');
        // Formata ID para ter 3 digitos (ex: 005)
        const idFormatado = String(id).padStart(3, '0');

        novaLinha.innerHTML = `
            <td class="item-id">${idFormatado}</td>
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
        const termo = inputPesquisa.value.trim();
        if (!termo) return;

        // Procura o material completo na lista carregada
        const materialEncontrado = materiaisDisponiveis.find(m => 
            m.nome_item.toLowerCase() === termo.toLowerCase()
        );

        if (materialEncontrado) {
            adicionarLinhaNaTabela(materialEncontrado.id, materialEncontrado.nome_item, "x1");
            inputPesquisa.value = '';
            inputPesquisa.focus();
        } else {
            alert("Material não encontrado no estoque geral. Verifique o nome.");
        }
    }

    // Eventos de clique e enter
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
                // Apenas remove da visualização. A lógica de banco para desvincular
                // deve ser implementada no backend se desejado.
                botaoExcluir.closest("tr").remove();
            }
        });
    }

    // =========================================================
    // 5. SALVAR ALTERAÇÕES (SUBMIT)
    // =========================================================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = idInput.value;
        const nome = nomeInput.value;
        const obs = obsInput.value;
        
        const setorInput = document.querySelector('input[name="destino"]:checked');
        const setor = setorInput ? setorInput.value : null;

        if (!nome || !setor) {
            alert("Preencha Nome e Setor.");
            return;
        }

        try {
            // Atualiza dados do Projeto
            const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, item: nome, destino: setor, observacoes: obs }),
            });

            const result = await response.json();

            if (result.success) {
                alert("Projeto atualizado com sucesso!");
                
                // Redireciona para a tela de visualização do cadastro
                const paramsRedir = new URLSearchParams({
                    id: id,
                    nome: nome,
                    setor: setor,
                    obs: obs || "Sem observações",
                    preco: "0,00" // Como não salvamos preço, enviamos padrão
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