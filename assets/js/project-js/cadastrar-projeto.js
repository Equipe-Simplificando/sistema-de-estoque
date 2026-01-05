document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const inputPesquisa = document.getElementById("pesquisa-item");
  const btnAdicionar = document.getElementById("btn-adicionar-material");
  const tabelaCorpo = document.getElementById("tabela-corpo");
  const dataListMateriais = document.getElementById("lista-materiais");

  let materiaisDisponiveis = [];

  // 1. CARREGAR MATERIAIS
  async function carregarMateriais() {
    try {
      const response = await fetch('http://localhost:3000/api/materiais');
      if (!response.ok) throw new Error('Falha ao buscar materiais');
      
      materiaisDisponiveis = await response.json();
      
      dataListMateriais.innerHTML = '';
      materiaisDisponiveis.forEach(material => {
        const option = document.createElement('option');
        option.value = material.nome_item;
        dataListMateriais.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    }
  }
  carregarMateriais();

  // 2. ADICIONAR NA TABELA
  function adicionarMaterialNaTabela() {
    const termoPesquisado = inputPesquisa.value.trim();
    if (!termoPesquisado) return;

    const materialEncontrado = materiaisDisponiveis.find(m => 
      m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
    );

    if (materialEncontrado) {
      const novaLinha = document.createElement('tr');
      // Adicionamos atributos data- para facilitar a captura depois
      novaLinha.innerHTML = `
        <td class="item-id">${materialEncontrado.id}</td>
        <td class="item-nome">${materialEncontrado.nome_item}</td>
        <td class="item-qtd">x1</td>
        <td>
            <button type="button" class="botao-excluir" aria-label="Remover item">
                <img src="../../assets/icons/icon-excluir.svg" alt="">
            </button>
        </td>
      `;
      tabelaCorpo.appendChild(novaLinha);
      inputPesquisa.value = '';
      inputPesquisa.focus();
    } else {
      alert("Material não encontrado no estoque.");
    }
  }

  if (btnAdicionar) btnAdicionar.addEventListener("click", adicionarMaterialNaTabela);
  if (inputPesquisa) {
    inputPesquisa.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        adicionarMaterialNaTabela();
      }
    });
  }

  // 3. EXCLUIR DA TABELA
  if (tabelaCorpo) {
    tabelaCorpo.addEventListener("click", (e) => {
      const botaoExcluir = e.target.closest(".botao-excluir");
      if (botaoExcluir) botaoExcluir.closest("tr").remove();
    });
  }

  // 4. SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("item").value;
    const obs = document.getElementById("observacoes").value;
    const preco = document.getElementById("preco").value; // Captura o preço
    const setorInput = document.querySelector('input[name="destino"]:checked');
    const setor = setorInput ? setorInput.value : null;

    if (!nome || !setor) {
      alert("Preencha Nome e Setor.");
      return;
    }

    // --- CAPTURA DOS MATERIAIS DA TABELA ---
    const materiaisList = [];
    document.querySelectorAll('#tabela-corpo tr').forEach(row => {
        materiaisList.push({
            id: row.querySelector('.item-id').textContent,
            item: row.querySelector('.item-nome').textContent,
            qtd: row.querySelector('.item-qtd').textContent
        });
    });

    try {
      const response = await fetch("http://localhost:3000/api/cadastrar-projeto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia o preço junto com os outros dados
        body: JSON.stringify({ 
            item: nome, 
            destino: setor, 
            observacoes: obs, 
            preco: preco 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Salva os materiais na Sessão para a próxima página ler
        sessionStorage.setItem('ultimoProjetoMateriais', JSON.stringify(materiaisList));

        const params = new URLSearchParams({
          id: result.id,
          nome: nome,
          setor: setor,
          obs: obs,
          preco: preco || "0,00",
        });

        window.location.href = `projeto-cadastrado.html?${params.toString()}`;
      } else {
        alert("Erro: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    }
  });
});