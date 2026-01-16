// Variável global para armazenar os dados originais
let listaGlobalMateriais = [];

// Variável para controlar o estado da ordenação
let estadoOrdenacao = {
    coluna: null,
    direcao: 'asc' // 'asc' para crescente, 'desc' para decrescente
};

document.addEventListener("DOMContentLoaded", () => {
    carregarMateriais();
    atualizarMenuAtivo();
    configurarPesquisa(); // Inicia o escutador do campo de pesquisa
});

// --- Função de Ordenação ---
function ordenarPor(coluna) {
    // Se clicar na mesma coluna, inverte a direção. Se for outra, começa como ascendente.
    if (estadoOrdenacao.coluna === coluna) {
        estadoOrdenacao.direcao = estadoOrdenacao.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        estadoOrdenacao.coluna = coluna;
        estadoOrdenacao.direcao = 'asc';
    }

    // Ordena a lista global
    listaGlobalMateriais.sort((a, b) => {
        let valorA = a[coluna];
        let valorB = b[coluna];

        // Tratamento específico para números e textos
        if (coluna === 'id' || coluna === 'quantidade') {
            valorA = Number(valorA) || 0;
            valorB = Number(valorB) || 0;
        } else {
            // Para texto (case insensitive)
            valorA = (valorA || '').toString().toLowerCase();
            valorB = (valorB || '').toString().toLowerCase();
        }

        if (valorA < valorB) {
            return estadoOrdenacao.direcao === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
            return estadoOrdenacao.direcao === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Reaplica o filtro de pesquisa atual para manter a consistência visual
    const inputPesquisa = document.getElementById("pesquisa-item");
    const termo = inputPesquisa.value.toLowerCase();
    
    // Se houver termo pesquisado, filtra a lista já ordenada
    const listaParaExibir = listaGlobalMateriais.filter(material => 
        material.nome_item.toLowerCase().includes(termo)
    );

    renderizarTabela(listaParaExibir);
}

// --- Configura a Pesquisa Dinâmica ---
function configurarPesquisa() {
    const inputPesquisa = document.getElementById("pesquisa-item");
    
    inputPesquisa.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();

        // Filtra a lista global (que pode estar ordenada) baseada no que foi digitado
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

// --- Renderização da Tabela (Atualizada com Clique) ---
function renderizarTabela(listaMateriais) {
    const tbody = document.querySelector(".tabela-itens tbody");
    tbody.innerHTML = ""; 

    if (!listaMateriais || listaMateriais.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">Nenhum item encontrado.</td></tr>`;
        return;
    }

    listaMateriais.forEach(material => {
        const tr = document.createElement("tr");
        tr.classList.add("linha-clicavel");

        tr.addEventListener("click", () => {
            window.location.href = `../../material-pages/editar-material.html?id=${material.id}`;
        });

        let iconHTML = ""; 
        const destino = material.destino ? material.destino.toLowerCase() : "";

        if (destino.includes("robótica") || destino.includes("robotica")) {
            iconHTML = `
                <img src="../../../assets/icons/icon-robotica.svg" alt="Ícone Robótica">
            `;
        } else if (destino.includes("manutenção") || destino.includes("manutencao")) {
            iconHTML = `
                <img src="../../../assets/icons/icon-manutencao.svg" alt="Ícone Manutenção">
            `;
        }

        const idFormatado = String(material.id).padStart(3, '0');

        const qtdExibida =
            material.quantidade !== undefined && material.quantidade !== null
                ? material.quantidade
                : 0;

        tr.innerHTML = `
            <td>
                <div class="icone-setor">
                    ${iconHTML}
                </div>
            </td>
            <td>${idFormatado}</td>
            <td>${material.nome_item}</td>
            <td>x${qtdExibida}</td>
        `;

        tbody.appendChild(tr);
    });
}


// --- Menu Ativo ---
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');
    
    let idAtivo = 'menu-home'; // Valor padrão

    // 1. Lógica para definir qual ID deve ser destacado
    if (setor === 'robotica') {
        idAtivo = 'menu-robotica';
    } else if (setor === 'manutencao') {
        idAtivo = 'menu-manutencao';
    } else if (setor === 'venda') {
        idAtivo = 'menu-venda';
    } else {
        idAtivo = 'menu-home';
    }

    // 2. Mapeamento direto dos caminhos das imagens ativas
    const caminhosIcones = {
        'menu-home': '../../../assets/icons/icon-home-ativo.svg',
        'menu-robotica': '../../../assets/icons/icon-robotica-ativo.svg',
        'menu-manutencao': '../../../assets/icons/icon-manutencao-ativo.svg',
        'menu-venda': '../../../assets/icons/icon-venda-ativo.svg'
    };

    // 3. Aplica as mudanças no HTML
    const elementoAtivo = document.getElementById(idAtivo);
    
    if (elementoAtivo) {
        // Adiciona a classe CSS de destaque
        elementoAtivo.classList.add('ativo');
        
        // Busca a imagem dentro do link e troca o src pelo caminho manual
        const img = elementoAtivo.querySelector('img');
        if (img) {
            img.src = caminhosIcones[idAtivo];
        }
    }
}