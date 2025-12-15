window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = params.get("nome");
  const setor = params.get("setor");
  const obs = params.get("obs");

  document.getElementById("exibir-nome").textContent = nome;
  document.getElementById("exibir-setor").textContent = setor;
  document.getElementById("exibir-obs").textContent = obs;

  document.getElementById("btn-editar").onclick = function () {
    if (id) {
      const editParams = new URLSearchParams({ id, nome, setor, obs });
      window.location.href = `editar-projeto.html?${editParams.toString()}`;
    }
  };
};
