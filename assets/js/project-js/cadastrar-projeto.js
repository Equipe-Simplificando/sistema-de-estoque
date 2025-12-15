document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();
  // Agora estes seletores encontrarão os elementos corretos
  const nome = document.getElementById("item").value;
  const obs = document.getElementById("observacoes").value;
  const setor = document.querySelector('input[name="destino"]:checked')?.value;

  try {
    const response = await fetch(
      "http://localhost:3000/api/cadastrar-projeto",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: nome, destino: setor, observacoes: obs }),
      }
    );
    const result = await response.json();

    if (result.success) {
      const params = new URLSearchParams({
        id: result.id,
        nome: nome,
        setor: setor || "-",
        obs: obs || "-",
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
