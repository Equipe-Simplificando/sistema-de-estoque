window.onload = function () {
  // Recupera os parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = params.get("nome");
  const setor = params.get("setor");
  const obs = params.get("obs");
  const preco = params.get("preco"); // Recupera o preço

  // Preenche os elementos HTML usando os IDs corretos
  if (document.getElementById("nome")) {
      document.getElementById("nome").textContent = nome;
  }
  
  if (document.getElementById("setor")) {
      document.getElementById("setor").textContent = setor;
  }
  
  if (document.getElementById("obs")) {
      document.getElementById("obs").textContent = obs;
  }

  // Lógica para exibir o preço
  if (document.getElementById("preco")) {
      document.getElementById("preco").textContent = preco ? `R$ ${preco}` : "R$ 0,00";
  }

  // Configuração do botão de editar
  const btnEditar = document.getElementById("btn-editar");
  if (btnEditar) {
    btnEditar.onclick = function () {
      if (id) {
        // Passa todas as informações atuais (incluindo preço) para a tela de edição
        const editParams = new URLSearchParams({ id, nome, setor, obs, preco });
        window.location.href = `editar-projeto.html?${editParams.toString()}`;
      }
    };
  }
};