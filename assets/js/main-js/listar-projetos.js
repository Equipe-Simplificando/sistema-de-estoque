// Variáveis globais para armazenar os dados e permitir filtragem
let listaGlobalProjetos = [];
let listaGlobalMateriais = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarPesquisa(); 
});

// --- Função Principal: Busca Projetos e Materiais do Servidor ---
async function carregarDados() {
    const container = document.getElementById("lista-projetos");
    
    try {
        // Busca as duas listas simultaneamente
        const [resProjetos, resMateriais] = await Promise.all([
            fetch('http://localhost:3000/api/projetos'),
            fetch('http://localhost:3000/api/materiais')
        ]);
        
        if (!resProjetos.ok || !resMateriais.ok) {
            throw new Error("Erro na resposta da API");
        }

        listaGlobalProjetos = await resProjetos.json();
        listaGlobalMateriais = await resMateriais.json();
        
        // Renderiza a lista na tela
        renderizarProjetos(listaGlobalProjetos, listaGlobalMateriais);
        
        // Atualiza as sugestões da barra de pesquisa
        atualizarSugestoes(listaGlobalProjetos);

    } catch (error) {
        console.error("Erro:", error);
        if(container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 20px; color: red;">
                    <p>Erro ao carregar dados.</p>
                    <small>Verifique se o servidor está rodando.</small>
                </div>
            `;
        }
    }
}

// --- Renderiza os Cards de Projeto (Estilo Acordeão) ---
function renderizarProjetos(projetos, materiais) {
    const container = document.getElementById("lista-projetos");
    if(!container) return;
    
    container.innerHTML = ""; // Limpa o conteúdo atual

    if (!projetos || projetos.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:1rem; color: #666;">Nenhum projeto encontrado.</p>`;
        return;
    }

    projetos.forEach(projeto => {
        // Filtra os materiais comparando o texto de forma SEGURA
        const materiaisDoProjeto = materiais.filter(m => {
            // Verifica se as propriedades existem
            if (!m.projeto || !projeto.nome_projeto) return false;
            
            // Converte para String forçadamente para evitar erros com números e remove espaços
            const pMat = String(m.projeto).trim().toLowerCase();
            const pProj = String(projeto.nome_projeto).trim().toLowerCase();
            
            return pMat === pProj;
        });

        // Cria o elemento <details> (O Card)
        const details = document.createElement("details");
        details.classList.add("aba-projeto");

        // Cria o cabeçalho do card (Summary)
        const summary = document.createElement("summary");
        summary.classList.add("cabecalho-projeto");
        
        summary.innerHTML = `
            <span class="titulo-projeto">${projeto.nome_projeto}</span>
            <img src="../../../assets/icons/icon-seta.svg" alt="Abrir" class="icone-seta">
        `;

        // Cria o conteúdo interno (Tabela de Materiais + Botão Editar)
        const divConteudo = document.createElement("div");
        divConteudo.classList.add("conteudo-aba");

        // Gera as linhas da tabela
        let linhasTabela = "";
        if (materiaisDoProjeto.length > 0) {
            linhasTabela = materiaisDoProjeto.map(mat => {
                const idFormatado = String(mat.id).padStart(3, '0');
                const qtd = mat.quantidade ? mat.quantidade : 1;
                // Garante que se nome_item for null, não quebre (usa fallback)
                const nomeItem = mat.nome_item || "Item sem nome";
                
                return `
                <tr>
                    <td>${idFormatado}</td>
                    <td>${nomeItem}</td>
                    <td>x${qtd}</td>
                </tr>
                `;
            }).join("");
        } else {
            linhasTabela = `<tr><td colspan="3" style="text-align:center; padding: 15px; color: #777;">Nenhum material cadastrado neste projeto.</td></tr>`;
        }

        // Monta o HTML interno do card
        divConteudo.innerHTML = `
            <div class="grupo-tabela">
                <table class="tabela-itens">
                    <thead>
                        <tr>
                            <th scope="col" style="width: 20%;">ID</th>
                            <th scope="col" style="width: 60%;">ITEM</th>
                            <th scope="col" style="width: 20%;">QTD</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabela}
                    </tbody>
                </table>
            </div>
            
            <button type="button" class="botao" onclick="editarProjeto(${projeto.id})">
                EDITAR
            </button>
        `;

        // Adiciona as partes ao card e o card ao container
        details.appendChild(summary);
        details.appendChild(divConteudo);
        container.appendChild(details);
    });
}

// --- Funcionalidade de Pesquisa ---
function configurarPesquisa() {
    const inputPesquisa = document.getElementById("pesquisa-projeto");
    
    if(inputPesquisa) {
        inputPesquisa.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();

            const listaFiltrada = listaGlobalProjetos.filter(projeto => 
                String(projeto.nome_projeto).toLowerCase().includes(termo)
            );

            renderizarProjetos(listaFiltrada, listaGlobalMateriais);
        });
    }
}

// --- Sugestões ---
function atualizarSugestoes(projetos) {
    const datalist = document.getElementById("sugestoes-projetos");
    if(datalist) {
        datalist.innerHTML = ""; 
        const nomesUnicos = new Set(projetos.map(p => p.nome_projeto));
        nomesUnicos.forEach(nome => {
            const option = document.createElement("option");
            option.value = nome;
            datalist.appendChild(option);
        });
    }
}

// --- Redirecionamento ---
function editarProjeto(id) {
    window.location.href = `../../project-pages/editar-projeto.html?id=${id}`;
}