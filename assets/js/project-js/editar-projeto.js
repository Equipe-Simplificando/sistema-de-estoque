window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    document.getElementById("projeto-id").value = id;
    document.getElementById("item").value = params.get("nome") || "";
    document.getElementById("observacoes").value =
      params.get("obs") && params.get("obs") !== "-" ? params.get("obs") : "";

    const setor = params.get("setor");
    if (setor === "Robótica")
      document.getElementById("robotica").checked = true;
    if (setor === "Manutenção")
      document.getElementById("manutencao").checked = true;
  } else {
    alert("Erro: Projeto não encontrado.");
    history.back();
  }
};

document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("projeto-id").value;
  const nome = document.getElementById("item").value;
  const obs = document.getElementById("observacoes").value;
  const setor = document.querySelector('input[name="destino"]:checked')?.value;

  try {
    const response = await fetch(
      "http://localhost:3000/api/atualizar-projeto",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          item: nome,
          destino: setor,
          observacoes: obs,
        }),
      }
    );
    const result = await response.json();

    if (result.success) {
      // --- REDIRECIONA PARA A TELA DE "PROJETO EDITADO" ---
      const params = new URLSearchParams({
        id: id,
        nome: nome,
        setor: setor,
        obs: obs || "-",
      });
      window.location.href = `projeto-editado.html?${params.toString()}`;
    } else {
      alert("Erro: " + result.error);
    }
  } catch (err) {
    alert("Erro de conexão.");
  }
});
