document.addEventListener("DOMContentLoaded", () => {
    carregarMateriais();
});

async function carregarMateriais() {
    const tbody = document.querySelector(".tabela-itens tbody");
    
    try {
        const response = await fetch('http://localhost:3000/api/materiais');
        
        // Verifica se o servidor retornou erro (ex: 500 ou 404)
        if (!response.ok) {
            const erroServer = await response.json();
            throw new Error(erroServer.error || "Erro interno do servidor");
        }

        const materiais = await response.json();
        
        tbody.innerHTML = ""; // Limpa conteúdo estático

        if (!materiais || materiais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">Nenhum item cadastrado.</td></tr>`;
            return;
        }

        materiais.forEach(material => {
            const tr = document.createElement("tr");

            // Lógica do Ícone
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
        console.error("Erro detalhado:", error);
        // Agora mostra o erro específico na tela para ajudar a debugar
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color: red; padding:1rem;">
                    <strong>Erro:</strong> ${error.message}<br>
                    <small>Verifique se o servidor está rodando na porta 3000 e se o banco foi atualizado.</small>
                </td>
            </tr>`;
    }
}