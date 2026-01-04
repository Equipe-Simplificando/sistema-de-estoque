document.addEventListener("DOMContentLoaded", () => {
    carregarMateriais();
});

async function carregarMateriais() {
    try {
        const response = await fetch('http://localhost:3000/api/materiais');
        const materiais = await response.json();
        
        const tbody = document.querySelector(".tabela-itens tbody");
        tbody.innerHTML = ""; // Limpa as linhas estáticas

        materiais.forEach(material => {
            const tr = document.createElement("tr");

            // Lógica do Ícone baseada no Destino
            let iconPath = "../../../assets/icons/icon-manutencao.svg"; // Padrão
            let altText = "Ícone Manutenção";

            // Normaliza o texto para evitar erros com maiúsculas/minúsculas
            const destino = material.destino ? material.destino.toLowerCase() : "";

            if (destino.includes("robótica") || destino.includes("robotica")) {
                iconPath = "../../../assets/icons/icon-robotica.svg";
                altText = "Ícone Robótica";
            }

            // Formata o ID (ex: 23-001, aqui usarei o ID do banco formatado com zeros)
            // Se quiser manter o padrão "23-XXX", pode concatenar strings
            const idFormatado = String(material.id).padStart(3, '0');

            tr.innerHTML = `
                <td>
                    <button type="button" class="icone-setor" aria-label="Item de ${material.destino}">
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
        console.error("Erro ao carregar materiais:", error);
        const tbody = document.querySelector(".tabela-itens tbody");
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">Erro de conexão com o servidor.</td></tr>`;
    }
}