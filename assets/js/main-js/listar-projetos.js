// Variável global para armazenar os dados originais
let listaGlobalProjetos = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProjetos();
    configurarPesquisa(); 
});

// --- Configura a Pesquisa Dinâmica ---
function configurarPesquisa() {
    const inputPesquisa = document.getElementById("pesquisa-projeto");
    
    if(inputPesquisa) {
        inputPesquisa.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();

            // Filtra a lista global baseada no que foi digitado
            const listaFiltrada = listaGlobalProjetos.filter(projeto => 
                projeto.nome_projeto.toLowerCase().includes(termo)
            );

            renderizarTabela(listaFiltrada);
        });
    }
}

// --- Preenche o Datalist com sugestões ---
function atualizarSugestoes(projetos) {
    const datalist = document.getElementById("sugestoes-projetos");
    if(datalist) {
        datalist.innerHTML = ""; // Limpa anteriores
        const nomesUnicos = new Set(projetos.map(p => p.nome_projeto));
        nomesUnicos.forEach(nome => {
            const option = document.createElement("option");
            option.value = nome;
            datalist.appendChild(option);
        });
    }
}

// --- Função Principal de Carregamento ---
async function carregarProjetos() {
    try {
        const response = await fetch('http://localhost:3000/api/projetos');
        
        if (!response.ok) throw new Error("Erro ao conectar com servidor");

        let projetos = await response.json();
        
        // Salva na variável global para a pesquisa usar depois
        listaGlobalProjetos = projetos;

        // Atualiza a tabela e as sugestões
        renderizarTabela(projetos);
        atualizarSugestoes(projetos);

    } catch (error) {
        console.error("Erro:", error);
        const tbody = document.querySelector(".tabela-itens tbody");
        if(tbody) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: red;">Erro na conexão.</td></tr>`;
        }
    }
}

// --- Renderização da Tabela ---
function renderizarTabela(listaProjetos) {
    const tbody = document.querySelector(".tabela-itens tbody");
    if(!tbody) return;
    
    tbody.innerHTML = ""; 

    if (!listaProjetos || listaProjetos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem;">Nenhum projeto encontrado.</td></tr>`;
        return;
    }

    listaProjetos.forEach(projeto => {
        const tr = document.createElement("tr");
        tr.classList.add("linha-clicavel");
        
        tr.addEventListener("click", () => {
            // Redireciona para a edição do projeto
            window.location.href = `../../project-pages/editar-projeto.html?id=${projeto.id}`;
        });

        // Define o ícone com base no setor (destino)
        let iconPath = "../../../assets/icons/icon-manutencao.svg"; 
        let altText = "Ícone Manutenção";
        const setor = projeto.setor ? projeto.setor.toLowerCase() : "";

        if (setor.includes("robótica") || setor.includes("robotica")) {
            iconPath = "../../../assets/icons/icon-robotica.svg";
            altText = "Ícone Robótica";
        }

        const idFormatado = String(projeto.id).padStart(3, '0');

        tr.innerHTML = `
            <td>
                <div class="icone-setor">
                    <img src="${iconPath}" alt="${altText}">
                </div>
            </td>
            <td>${idFormatado}</td>
            <td>${projeto.nome_projeto}</td>
        `;

        tbody.appendChild(tr);
    });
}