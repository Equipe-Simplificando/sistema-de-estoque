const API_BASE = `http://${window.location.hostname}:3000`;

window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const nome = params.get("nome");
  const setor = params.get("setor");
  const obs = params.get("obs");

  document.getElementById("exibir-nome").textContent = nome || "Erro";
  document.getElementById("exibir-setor").textContent = setor || "-";
  document.getElementById("exibir-obs").textContent = obs || "-";

  const btnEditar = document.getElementById("btn-editar-novamente");

  btnEditar.onclick = function () {
    if (id) {
      const editParams = new URLSearchParams({
        id: id,
        nome: nome,
        setor: setor,
        obs: obs,
      });

      window.location.href = `editar-projeto.html?${editParams.toString()}`;
    } else {
      alert("Erro: ID do projeto perdido. Não é possível editar.");
    }
  };
};