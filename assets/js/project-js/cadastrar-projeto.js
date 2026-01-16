const API_BASE = `http://${window.location.hostname}:3000`;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const inputPesquisa = document.getElementById("pesquisa-item");
  const btnAdicionar = document.getElementById("btn-adicionar-material");
  const tabelaCorpo = document.getElementById("tabela-corpo");
  const dataListMateriais = document.getElementById("lista-materiais");

  let materiaisDisponiveis = [];

  async function carregarMateriais() {
    try {
      const response = await fetch(`${API_BASE}/api/materiais`);
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

  function adicionarMaterialNaTabela() {
    const termoPesquisado = inputPesquisa.value.trim();
    if (!termoPesquisado) return;

    const materialEncontrado = materiaisDisponiveis.find(m => 
      m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
    );

    if (materialEncontrado) {
      const novaLinha = document.createElement('tr');
      
      const qtdReal = (materialEncontrado.quantidade !== undefined && materialEncontrado.quantidade !== null) 
                      ? materialEncontrado.quantidade 
                      : 0;

      novaLinha.innerHTML = `
        <td class="item-id">${materialEncontrado.id}</td>
        <td class="item-nome">${materialEncontrado.nome_item}</td>
        <td class="item-qtd">x${qtdReal}</td>
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

  if (tabelaCorpo) {
    tabelaCorpo.addEventListener("click", (e) => {
      const botaoExcluir = e.target.closest(".botao-excluir");
      if (botaoExcluir) botaoExcluir.closest("tr").remove();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("item").value;
    const obs = document.getElementById("observacoes").value;
    const preco = document.getElementById("preco").value;
    const setorInput = document.querySelector('input[name="destino"]:checked');
    const setor = setorInput ? setorInput.value : null;

    if (!nome || !setor) {
      alert("Preencha Nome e Setor.");
      return;
    }

    const materiaisParaSalvar = [];
    const materiaisVisualizacao = [];

    document.querySelectorAll('#tabela-corpo tr').forEach(row => {
        const id = row.querySelector('.item-id').textContent;
        const nomeItem = row.querySelector('.item-nome').textContent;
        const qtd = row.querySelector('.item-qtd').textContent;

        materiaisParaSalvar.push(parseInt(id)); 
        materiaisVisualizacao.push({ id, item: nomeItem, qtd });
    });

    try {
      const response = await fetch(`${API_BASE}/api/cadastrar-projeto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            item: nome, 
            destino: setor, 
            observacoes: obs, 
            preco: preco,
            materiais: materiaisParaSalvar 
        }),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem('ultimoProjetoMateriais', JSON.stringify(materiaisVisualizacao));

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