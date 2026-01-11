// Variáveis globais
let listaGlobalProjetos = [];
let listaGlobalMateriais = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarPesquisa();
    atualizarMenuAtivo();
});

async function carregarDados() {
    const container = document.getElementById("lista-projetos");
    
    try {
        const [resProjetos, resMateriais] = await Promise.all([
            fetch('http://localhost:3000/api/projetos'),
            fetch('http://localhost:3000/api/materiais')
        ]);
        
        if (!resProjetos.ok || !resMateriais.ok) throw new Error("Erro na resposta da API");

        let projetos = await resProjetos.json();
        listaGlobalMateriais = await resMateriais.json();

        // --- LÓGICA DE FILTRO VIA URL (?setor=...) ---
        const urlParams = new URLSearchParams(window.location.search);
        const filtroSetor = urlParams.get('setor');

        if (filtroSetor) {
            projetos = projetos.filter(projeto => {
                const termo = filtroSetor.toLowerCase();
                
                // 1. REGRA PARA VENDA: Ignora o setor e mostra tudo que tem preço
                if (termo === 'venda') {
                    const valor = projeto.preco ? parseFloat(projeto.preco) : 0;
                    return valor > 0;
                }

                // 2. REGRA PARA SETORES (Robótica/Manutenção)
                const normalizar = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                const setorProj = normalizar(projeto.setor);

                if (termo === 'robotica' && setorProj.includes('robotica')) return true;
                if (termo === 'manutencao' && setorProj.includes('manutencao')) return true;
                
                return false;
            });
        }
        
        listaGlobalProjetos = projetos;
        renderizarProjetos(listaGlobalProjetos, listaGlobalMateriais);
        atualizarSugestoes(listaGlobalProjetos);

    } catch (error) {
        console.error("Erro:", error);
        if(container) {
            container.innerHTML = `<p style="text-align:center; color:red;">Erro ao carregar dados.</p>`;
        }
    }
}

// --- FUNÇÃO DE MENU ATIVO (COM CAMINHOS MANUAIS) ---
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');
    
    let idAtivo = 'menu-home'; 
    if (setor === 'robotica') idAtivo = 'menu-robotica';
    else if (setor === 'manutencao') idAtivo = 'menu-manutencao';
    else if (setor === 'venda') idAtivo = 'menu-venda';

    // Mapeamento manual dos caminhos das imagens
    const iconesAtivos = {
        'menu-home': '../../../assets/icons/icon-home-ativo.svg',
        'menu-robotica': '../../../assets/icons/icon-robotica-ativo.svg',
        'menu-manutencao': '../../../assets/icons/icon-manutencao-ativo.svg',
        'menu-venda': '../../../assets/icons/icon-venda-ativo.svg'
    };

    const iconesPadrao = {
        'menu-home': '../../../assets/icons/icon-home.svg',
        'menu-robotica': '../../../assets/icons/icon-robotica.svg',
        'menu-manutencao': '../../../assets/icons/icon-manutencao.svg',
        'menu-venda': '../../../assets/icons/icon-venda.svg'
    };

    // Reseta todos os menus
    document.querySelectorAll('.item-menu').forEach(el => {
        el.classList.remove('ativo');
        const img = el.querySelector('img');
        if (img && iconesPadrao[el.id]) {
            img.src = iconesPadrao[el.id];
        }
    });

    // Ativa o selecionado
    const elementoAtivo = document.getElementById(idAtivo);
    if (elementoAtivo) {
        elementoAtivo.classList.add('ativo');
        const img = elementoAtivo.querySelector('img');
        if (img) {
            img.src = iconesAtivos[idAtivo];
        }
    }
}

// --- RENDERIZAÇÃO E OUTRAS FUNÇÕES (MANTIDAS) ---
function renderizarProjetos(projetos, materiais) {
    const container = document.getElementById("lista-projetos");
    if(!container) return;
    container.innerHTML = "";

    const perfil = localStorage.getItem("perfilUsuario");
    const ehAdmin = (perfil === "admin");

    if (!projetos || projetos.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:1rem; color: #666;">Nenhum projeto encontrado.</p>`;
        return;
    }

    const normalizar = (texto) => {
        if (!texto) return "";
        return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    };

    projetos.forEach(projeto => {
        const materiaisDoProjeto = materiais.filter(m => {
            if (!m.projeto) return false;
            if (String(m.projeto) === String(projeto.id)) return true;
            return normalizar(m.projeto) === normalizar(projeto.nome_projeto);
        });

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

        const linhasTabela = materiaisDoProjeto.length > 0 
            ? materiaisDoProjeto.map(mat => `
                <tr>
                    <td>${String(mat.id).padStart(3, '0')}</td>
                    <td>${mat.nome_item || "Sem nome"}</td>
                    <td>x${mat.quantidade ?? 0}</td>
                </tr>`).join("")
            : `<tr><td colspan="3" style="text-align:center; color: #777;">Nenhum material vinculado.</td></tr>`;

        let botaoExcluirProj = ehAdmin ? `<button type="button" class="botao" style="background-color: #d32f2f; margin-left: 10px;" onclick="deletarProjeto(${projeto.id})">EXCLUIR</button>` : "";

        divConteudo.innerHTML = `
            <div class="grupo-tabela">
                <table class="tabela-itens">
                    <thead><tr><th style="width: 20%;">ID</th><th style="width: 60%;">ITEM</th><th style="width: 20%;">QTD</th></tr></thead>
                    <tbody>${linhasTabela}</tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
                <button type="button" class="botao" onclick="editarProjeto(${projeto.id})">EDITAR</button>
                ${botaoExcluirProj}
            </div>
        `;

        details.appendChild(summary);
        details.appendChild(divConteudo);
        container.appendChild(details);
    });
}

// Funções de pesquisa, sugestões e deletar permanecem iguais...
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

async function deletarProjeto(id) {
    if(!confirm("Tem certeza?")) return;
    try {
        const response = await fetch(`http://localhost:3000/api/deletar-projeto/${id}`, { method: 'DELETE' });
        if (response.ok) { location.reload(); }
    } catch (e) { console.error(e); }
}