// Variáveis globais para armazenar os dados e permitir filtragem
let listaGlobalProjetos = [];
let listaGlobalMateriais = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarPesquisa();
    atualizarMenuAtivo();
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

        let projetos = await resProjetos.json();
        listaGlobalMateriais = await resMateriais.json();

        // 1. APLICAR FILTRO DE URL (Setor)
        const urlParams = new URLSearchParams(window.location.search);
        const filtroSetor = urlParams.get('setor');

        if (filtroSetor) {
            projetos = projetos.filter(projeto => {
                const setorProj = projeto.setor ? projeto.setor.toLowerCase() : "";
                const termo = filtroSetor.toLowerCase();
                const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                if (termo === 'robotica' && normalizar(setorProj).includes('robotica')) return true;
                if (termo === 'manutencao' && normalizar(setorProj).includes('manutencao')) return true;
                return false;
            });
        }
        
        listaGlobalProjetos = projetos;
        
        // Debug
        console.log("Projetos Carregados:", listaGlobalProjetos);
        console.log("Materiais Carregados:", listaGlobalMateriais);

        renderizarProjetos(listaGlobalProjetos, listaGlobalMateriais);
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

// --- Renderiza os Cards de Projeto (LÓGICA CORRIGIDA) ---
function renderizarProjetos(projetos, materiais) {
    const container = document.getElementById("lista-projetos");
    if(!container) return;
    
    container.innerHTML = "";

    if (!projetos || projetos.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:1rem; color: #666;">Nenhum projeto encontrado.</p>`;
        return;
    }

    const normalizar = (texto) => {
        if (!texto) return "";
        return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    };

    projetos.forEach(projeto => {
        
        // --- FILTRO DE MATERIAIS ROBUSTO ---
        // Verifica se o material pertence ao projeto (pelo ID ou pelo Nome)
        const materiaisDoProjeto = materiais.filter(m => {
            if (!m.projeto) return false;

            // 1. Tenta comparar por ID (Converte para String para garantir)
            if (String(m.projeto) === String(projeto.id)) return true;

            // 2. Tenta comparar por Nome (Caso antigo ou salvo como texto)
            const matProj = normalizar(m.projeto);
            const nomeProj = normalizar(projeto.nome_projeto);
            return matProj === nomeProj;
        });

        // Formatação de Preço
        const precoFormatado = projeto.preco 
            ? parseFloat(projeto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
            : 'R$ 0,00';

        const details = document.createElement("details");
        details.classList.add("aba-projeto");

        const summary = document.createElement("summary");
        summary.classList.add("cabecalho-projeto");
        
        summary.innerHTML = `
            <div style="display: flex; justify-content: space-between; width: 90%; align-items: center;">
                <span class="titulo-projeto">${projeto.nome_projeto}</span>
                <span style="font-weight: bold; color: #2E7D32; font-size: 0.9em;">${precoFormatado}</span>
            </div>
            <img src="../../../assets/icons/icon-seta.svg" alt="Abrir" class="icone-seta">
        `;

        const divConteudo = document.createElement("div");
        divConteudo.classList.add("conteudo-aba");

        // Gera as linhas da tabela
        let linhasTabela = "";
        if (materiaisDoProjeto.length > 0) {
            linhasTabela = materiaisDoProjeto.map(mat => {
                const idFormatado = String(mat.id).padStart(3, '0');
                const qtd = mat.quantidade ? mat.quantidade : 1;
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
            linhasTabela = `<tr><td colspan="3" style="text-align:center; padding: 15px; color: #777;">Nenhum material vinculado.</td></tr>`;
        }

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

        details.appendChild(summary);
        details.appendChild(divConteudo);
        container.appendChild(details);
    });
}

// --- Menu e Pesquisa ---
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');
    let idAtivo = 'menu-home'; 
    if (setor === 'robotica') idAtivo = 'menu-robotica';
    if (setor === 'manutencao') idAtivo = 'menu-manutencao';

    const elementoAtivo = document.getElementById(idAtivo);
    document.querySelectorAll('.item-menu').forEach(el => el.classList.remove('ativo'));
    const homeIcon = document.querySelector('#menu-home img');
    if(homeIcon) homeIcon.src = "../../../assets/icons/icon-home.svg";

    if (elementoAtivo) {
        elementoAtivo.classList.add('ativo');
        if (idAtivo === 'menu-home') {
            const img = elementoAtivo.querySelector('img');
            if (img) img.src = "../../../assets/icons/icon-home-ativo.svg";
        }
    }
}

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

function editarProjeto(id) {
    window.location.href = `../../project-pages/editar-projeto.html?id=${id}`;
}