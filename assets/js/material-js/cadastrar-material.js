// --- FUNÇÃO PARA CARREGAR PROJETOS ---
async function carregarProjetos() {
  try {
    const response = await fetch("http://localhost:3000/api/projetos");
    const projetos = await response.json();
    const selectProjeto = document.getElementById("projeto");
    selectProjeto.innerHTML =
      '<option value="" selected disabled hidden></option>';
    projetos.forEach((proj) => {
      const option = document.createElement("option");
      option.value = proj.nome_projeto;
      option.textContent = proj.nome_projeto;
      selectProjeto.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar projetos:", err);
  }
}

window.onload = carregarProjetos;

// --- LÓGICA DE CADASTRO ATUALIZADA PARA ENVIAR ARQUIVO ---
document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Criar um objeto FormData para enviar arquivos + texto
  const formData = new FormData();

  // Adicionar campos de texto
  formData.append("item", document.getElementById("item").value);

  const destinoSelecionado = document.querySelector(
    'input[name="destino"]:checked'
  );
  formData.append(
    "destino",
    destinoSelecionado ? destinoSelecionado.value : ""
  );

  formData.append("projeto", document.getElementById("projeto").value);
  formData.append("observacoes", document.getElementById("observacoes").value);

  // Adicionar o arquivo se houver
  const arquivoInput = document.getElementById("arquivo");
  if (arquivoInput.files[0]) {
    formData.append("arquivo", arquivoInput.files[0]);
  }

  try {
    // Fetch agora envia o FormData diretamente
    // NÃO definimos 'Content-Type': 'application/json' manualmente,
    // o navegador faz isso automaticamente para multipart/form-data
    const response = await fetch("http://localhost:3000/api/cadastrar", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      const idFormatado = String(result.id).padStart(4, "0");
      const params = new URLSearchParams({
        id: idFormatado,
        nome: document.getElementById("item").value,
        destino: destinoSelecionado ? destinoSelecionado.value : "",
        projeto: document.getElementById("projeto").value || "-",
        obs: document.getElementById("observacoes").value || "-",
        cod: "MAT-" + idFormatado,
      });

      window.location.href = `etiqueta-gerada.html?${params.toString()}`;
    } else {
      alert("Erro ao cadastrar: " + (result.error || "Erro desconhecido"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão. Verifique se o servidor está rodando.");
  }
});
