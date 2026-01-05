window.onload = function () {
  // =========================================================
  // 1. RECUPERAR DADOS BÁSICOS DA URL
  // =========================================================
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = params.get("nome");
  const setor = params.get("setor");
  const obs = params.get("obs");
  const preco = params.get("preco");

  // Preenche os elementos HTML
  if (document.getElementById("nome")) {
      document.getElementById("nome").textContent = nome || "--";
  }
  
  if (document.getElementById("setor")) {
      // Formata: 'robotica' -> 'Robótica' (apenas visual)
      let setorFormatado = setor;
      if (setor === 'robotica') setorFormatado = 'Robótica';
      if (setor === 'manutencao') setorFormatado = 'Manutenção';
      document.getElementById("setor").textContent = setorFormatado || "--";
  }
  
  if (document.getElementById("obs")) {
      document.getElementById("obs").textContent = obs || "Sem observações";
  }

  if (document.getElementById("preco")) {
      document.getElementById("preco").textContent = preco ? `R$ ${preco}` : "R$ 0,00";
  }

  // =========================================================
  // 2. RECUPERAR E PREENCHER A TABELA DE MATERIAIS
  // =========================================================
  const tbody = document.getElementById("tabela-materiais-leitura");
  const itensSalvos = sessionStorage.getItem('ultimoProjetoMateriais');

  if (tbody) {
      tbody.innerHTML = ""; // Limpa qualquer conteúdo existente

      if (itensSalvos) {
          const itens = JSON.parse(itensSalvos);

          if (itens.length > 0) {
              itens.forEach(material => {
                  const tr = document.createElement('tr');
                  
                  // Cria as células APENAS para ID, ITEM e QTD (sem lixeira)
                  tr.innerHTML = `
                      <td>${material.id}</td>
                      <td>${material.item}</td>
                      <td>${material.qtd}</td>
                  `;
                  
                  tbody.appendChild(tr);
              });
          } else {
              tbody.innerHTML = '<tr><td colspan="3">Nenhum item adicionado.</td></tr>';
          }
      } else {
          tbody.innerHTML = '<tr><td colspan="3">Nenhum item adicionado.</td></tr>';
      }
  }

  // =========================================================
  // 3. CONFIGURAÇÃO DO BOTÃO EDITAR
  // =========================================================
  const btnEditar = document.getElementById("btn-editar");
  if (btnEditar) {
    btnEditar.onclick = function () {
      if (id) {
        const editParams = new URLSearchParams({ id, nome, setor, obs, preco });
        window.location.href = `editar-projeto.html?${editParams.toString()}`;
      } else {
        alert("ID do projeto não encontrado para edição.");
      }
    };
  }
};