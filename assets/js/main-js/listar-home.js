// Variável global para armazenar os dados originais
let listaGlobalMateriais = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarMateriais();
    atualizarMenuAtivo();
    configurarPesquisa(); // Inicia o escutador do campo de pesquisa
});

// --- Configura a Pesquisa Dinâmica ---
function configurarPesquisa() {
    const inputPesquisa = document.getElementById("pesquisa-item");
    
    inputPesquisa.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();

        // Filtra a lista global baseada no que foi digitado
        const listaFiltrada = listaGlobalMateriais.filter(material => 
            material.nome_item.toLowerCase().includes(termo)
        );

        renderizarTabela(listaFiltrada);
    });
}

// --- Preenche o Datalist com sugestões ---
function atualizarSugestoes(materiais) {
    const datalist = document.getElementById("sugestoes-itens");
    datalist.innerHTML = ""; // Limpa anteriores

    // Cria um Set para evitar nomes duplicados nas sugestões
    const nomesUnicos = new Set(materiais.map(m => m.nome_item));

    nomesUnicos.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        datalist.appendChild(option);
    });
}

// --- Função Principal de Carregamento ---
async function carregarMateriais() {
    try {
        const response = await fetch('http://localhost:3000/api/materiais');
        
        if (!response.ok) throw new Error("Erro ao conectar com servidor");

        let materiais = await response.json();
        
        // 1. APLICAR FILTRO DE URL (Setor)
        const urlParams = new URLSearchParams(window.location.search);
        const filtroSetor = urlParams.get('setor');

        if (filtroSetor) {
            materiais = materiais.filter(material => {
                const destino = material.destino ? material.destino.toLowerCase() : "";
                const termo = filtroSetor.toLowerCase();
                
                if (termo === 'robotica' && (destino.includes('robótica') || destino.includes('robotica'))) return true;
                if (termo === 'manutencao' && (destino.includes('manutenção') || destino.includes('manutencao'))) return true;
                return false;
            });
        }

        // Salva na variável global para a pesquisa usar depois
        listaGlobalMateriais = materiais;

        // Atualiza a tabela e as sugestões
        renderizarTabela(materiais);
        atualizarSugestoes(materiais);

    } catch (error) {
        console.error("Erro:", error);
        document.querySelector(".tabela-itens tbody").innerHTML = 
            `<tr><td colspan="4" style="text-align:center; color: red;">Erro na conexão.</td></tr>`;
    }
}

// --- Renderização da Tabela (Separada para ser reutilizada) ---
function renderizarTabela(listaMateriais) {
    const tbody = document.querySelector(".tabela-itens tbody");
    tbody.innerHTML = ""; 

    if (!listaMateriais || listaMateriais.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">Nenhum item encontrado.</td></tr>`;
        return;
    }

    listaMateriais.forEach(material => {
        const tr = document.createElement("tr");

        let iconPath = "../../../assets/icons/icon-manutencao.svg"; 
        let altText = "Ícone Manutenção";
        const destino = material.destino ? material.destino.toLowerCase() : "";

        if (destino.includes("robótica") || destino.includes("robotica")) {
            iconPath = "../../../assets/icons/icon-robotica.svg";
            altText = "Ícone Robótica";
        }

        const idFormatado = String(material.id).padStart(3, '0');

        tr.innerHTML = `
            <td>
                <button type="button" class="icone-setor" style="cursor: default;">
                    <img src="${iconPath}" alt="${altText}">
                </button>
            </td>
            <td>${idFormatado}</td>
            <td>${material.nome_item}</td>
            <td>x${material.quantidade || 1}</td>
        `;

        tbody.appendChild(tr);
    });
}

// --- Menu Ativo (Código mantido da versão anterior) ---
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');
    let idAtivo = 'menu-home'; 
    if (setor === 'robotica') idAtivo = 'menu-robotica';
    if (setor === 'manutencao') idAtivo = 'menu-manutencao';

    const elementoAtivo = document.getElementById(idAtivo);
    if (elementoAtivo) {
        elementoAtivo.classList.add('ativo');
        if (idAtivo === 'menu-home') {
            const img = elementoAtivo.querySelector('img');
            if (img) img.src = "../../../assets/icons/icon-home-ativo.svg";
        }
    }
}