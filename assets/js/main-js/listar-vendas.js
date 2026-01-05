document.addEventListener("DOMContentLoaded", () => {
    carregarVendas();
    configurarPesquisa();
});

async function carregarVendas() {
    const tabela = document.querySelector(".tabela-itens tbody");
    if (!tabela) return;

    // Limpa a tabela antes de carregar
    tabela.innerHTML = "";

    try {
        const response = await fetch('http://localhost:3000/api/projetos');
        
        if (!response.ok) throw new Error("Erro na resposta da API");

        const projetos = await response.json();

        // FILTRO: Apenas projetos com preço numérico válido e maior que zero
        const vendas = projetos.filter(p => {
            const preco = parseFloat(p.preco);
            return !isNaN(preco) && preco > 0;
        });

        if (vendas.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 1rem;">Nenhum projeto à venda.</td></tr>`;
            return;
        }

        vendas.forEach(projeto => {
            const tr = document.createElement("tr");
            
            // Formata ID (ex: 001, 002)
            const idFormatado = String(projeto.id).padStart(3, '0');
            
            // Formata Preço (R$ 1.000,00)
            const precoFormatado = parseFloat(projeto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            tr.innerHTML = `
                <td>${idFormatado}</td>
                <td>${projeto.nome_projeto}</td>
                <td>x1</td> 
                <td>${precoFormatado}</td>
            `;
            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red; padding: 1rem;">Erro de conexão com o servidor.</td></tr>`;
    }
}

// Configuração simples da barra de pesquisa para filtrar na tela
function configurarPesquisa() {
    const inputPesquisa = document.getElementById("pesquisa-item");
    if(inputPesquisa) {
        inputPesquisa.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();
            const linhas = document.querySelectorAll(".tabela-itens tbody tr");
            
            linhas.forEach(linha => {
                const texto = linha.innerText.toLowerCase();
                linha.style.display = texto.includes(termo) ? "" : "none";
            });
        });
    }
}