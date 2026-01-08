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

        // Filtro de Setor via URL
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
        renderizarProjetos(listaGlobalProjetos, listaGlobalMateriais);
        atualizarSugestoes(listaGlobalProjetos);

    } catch (error) {
        console.error("Erro:", error);
        if(container) {
            container.innerHTML = `<p style="text-align:center; color:red;">Erro ao carregar dados.</p>`;
        }
    }
}

function renderizarProjetos(projetos, materiais) {
    const container = document.getElementById("lista-projetos");
    if(!container) return;
    
    container.innerHTML = "";

    // VERIFICA PERFIL
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
            const matProj = normalizar(m.projeto);
            const nomeProj = normalizar(projeto.nome_projeto);
            return matProj === nomeProj;
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

        let linhasTabela = "";
        if (materiaisDoProjeto.length > 0) {
            linhasTabela = materiaisDoProjeto.map(mat => {
                const idFormatado = String(mat.id).padStart(3, '0');
                
                // CORREÇÃO: Verifica se quantidade existe, permitindo o valor 0
                const qtd = (mat.quantidade !== undefined && mat.quantidade !== null) 
                            ? mat.quantidade 
                            : 0;

                const nomeItem = mat.nome_item || "Item sem nome";
                return `<tr><td>${idFormatado}</td><td>${nomeItem}</td><td>x${qtd}</td></tr>`;
            }).join("");
        } else {
            linhasTabela = `<tr><td colspan="3" style="text-align:center; color: #777;">Nenhum material vinculado.</td></tr>`;
        }

        // Lógica do Botão Excluir (Só aparece se admin)
        let botaoExcluirProj = "";
        if (ehAdmin) {
            botaoExcluirProj = `
                <button type="button" class="botao" 
                    style="background-color: #d32f2f; margin-left: 10px;" 
                    onclick="deletarProjeto(${projeto.id})">
                    EXCLUIR
                </button>
            `;
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
                    <tbody>${linhasTabela}</tbody>
                </table>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
                <button type="button" class="botao" onclick="editarProjeto(${projeto.id})">
                    EDITAR
                </button>
                ${botaoExcluirProj}
            </div>
        `;

        details.appendChild(summary);
        details.appendChild(divConteudo);
        container.appendChild(details);
    });
}

// Funções Auxiliares
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');
    let idAtivo = 'menu-home'; 
    if (setor === 'robotica') idAtivo = 'menu-robotica';
    if (setor === 'manutencao') idAtivo = 'menu-manutencao';

    const elementoAtivo = document.getElementById(idAtivo);
    document.querySelectorAll('.item-menu').forEach(el => el.classList.remove('ativo'));
    
    // Reseta icones se necessário (simplificado)
    const homeIcon = document.querySelector('#menu-home img');
    if(homeIcon) homeIcon.src = "../../../assets/icons/icon-home.svg";

    if (elementoAtivo) {
        elementoAtivo.classList.add('ativo');
        if (idAtivo === 'menu-home' && homeIcon) {
            homeIcon.src = "../../../assets/icons/icon-home-ativo.svg";
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

async function deletarProjeto(id) {
    if(!confirm("Tem certeza? Isso excluirá o projeto permanentemente.")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/deletar-projeto/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Projeto excluído!");
            location.reload();
        } else {
            alert("Erro ao excluir. Verifique se a rota de exclusão de projetos existe no servidor.");
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
}