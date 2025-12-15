window.onload = function () {
  // 1. Pega os dados que vieram pela URL (após o salvamento)
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = params.get("nome");
  const setor = params.get("setor");
  const obs = params.get("obs");

  // 2. Preenche a tela de confirmação
  document.getElementById("exibir-nome").textContent = nome || "Erro";
  document.getElementById("exibir-setor").textContent = setor || "-";
  document.getElementById("exibir-obs").textContent = obs || "-";

  // 3. Configura o botão "Editar Novamente"
  const btnEditar = document.getElementById("btn-editar-novamente");

  btnEditar.onclick = function () {
    if (id) {
      // Monta os parâmetros novamente para enviar de volta ao formulário de edição
      const editParams = new URLSearchParams({
        id: id,
        nome: nome,
        setor: setor,
        obs: obs,
      });

      // Redireciona para a página de edição (editar-projeto.html)
      window.location.href = `editar-projeto.html?${editParams.toString()}`;
    } else {
      alert("Erro: ID do projeto perdido. Não é possível editar.");
    }
  };
};
