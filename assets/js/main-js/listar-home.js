document.addEventListener("DOMContentLoaded", () => {
    carregarMateriais();
    atualizarMenuAtivo();
});

// --- Função para Gerenciar a Aparência do Menu ---
function atualizarMenuAtivo() {
    const urlParams = new URLSearchParams(window.location.search);
    const setor = urlParams.get('setor');

    // Remove a classe 'ativo' e reseta ícones de todos os itens
    const menus = [
        { id: 'menu-home', icon: 'icon-home.svg', activeIcon: 'icon-home-ativo.svg' },
        { id: 'menu-robotica', icon: 'icon-robotica.svg', activeIcon: 'icon-robotica.svg' }, // Se tiver ícone verde, mude aqui
        { id: 'menu-manutencao', icon: 'icon-manutencao.svg', activeIcon: 'icon-manutencao.svg' }
    ];

    // Remove status ativo anterior
    document.querySelectorAll('.item-menu').forEach(el => el.classList.remove('ativo'));
    
    // Reseta imagens para o padrão (preto/cinza)
    // Nota: Como você não enviou os ícones "ativos" (verdes) de robotica/manutenção,
    // o código abaixo foca em adicionar a classe CSS '.ativo' que você pode estilizar.
    
    let idAtivo = 'menu-home'; // Padrão
    if (setor === 'robotica') idAtivo = 'menu-robotica';
    if (setor === 'manutencao') idAtivo = 'menu-manutencao';

    const elementoAtivo = document.getElementById(idAtivo);
    if (elementoAtivo) {
        elementoAtivo.classList.add('ativo');
        
        // Troca o ícone da Home se ela for a ativa
        if (idAtivo === 'menu-home') {
            const img = elementoAtivo.querySelector('img');
            if (img) img.src = "../../../assets/icons/icon-home-ativo.svg";
        }
    }
}

// --- Função de Carregamento e Filtragem ---
async function carregarMateriais() {
    const tbody = document.querySelector(".tabela-itens tbody");
    
    try {
        const response = await fetch('http://localhost:3000/api/materiais');
        
        if (!response.ok) {
            throw new Error("Erro ao conectar com servidor");
        }

        let materiais = await response.json();
        
        // 1. LER O FILTRO DA URL
        const urlParams = new URLSearchParams(window.location.search);
        const filtroSetor = urlParams.get('setor'); // retorna 'robotica' ou 'manutencao' ou null

        // 2. APLICAR O FILTRO SE HOUVER
        if (filtroSetor) {
            materiais = materiais.filter(material => {
                // Normaliza para evitar problemas com maiúsculas ou acentos
                const destino = material.destino ? material.destino.toLowerCase() : "";
                const termo = filtroSetor.toLowerCase();
                
                // Verifica se o destino contém o termo (ex: "robótica" contém "robotica" se tratarmos acentos, 
                // mas aqui faremos uma verificação simples de string)
                
                // Mapeamento simples para garantir acertos
                if (termo === 'robotica' && (destino.includes('robótica') || destino.includes('robotica'))) return true;
                if (termo === 'manutencao' && (destino.includes('manutenção') || destino.includes('manutencao'))) return true;
                
                return false;
            });
        }

        tbody.innerHTML = ""; 

        if (!materiais || materiais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">Nenhum item encontrado para este filtro.</td></tr>`;
            return;
        }

        materiais.forEach(material => {
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

    } catch (error) {
        console.error("Erro:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erro na conexão.</td></tr>`;
    }
}