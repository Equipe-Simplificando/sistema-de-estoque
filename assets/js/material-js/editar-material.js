const params = new URLSearchParams(window.location.search);
const idMaterial = params.get("id");

if (!idMaterial) {
  alert("ID do material não encontrado!");
  window.location.href = "listar-materiais.html";
}

async function carregarDados() {
  try {
    // 1. Carregar Projetos
    const respProj = await fetch("http://localhost:3000/api/projetos");
    const projetos = await respProj.json();
    const selectProjeto = document.getElementById("projeto");
    selectProjeto.innerHTML =
      '<option value="" selected disabled hidden></option>';
    projetos.forEach((proj) => {
      const option = document.createElement("option");
      option.value = proj.nome_projeto;
      option.textContent = proj.nome_projeto;
      selectProjeto.appendChild(option);
    });

    // 2. Carregar Dados do Material
    const respMat = await fetch("http://localhost:3000/api/materiais");
    const materiais = await respMat.json();
    const material = materiais.find((m) => m.id == idMaterial);

    if (material) {
      document.getElementById("material-id").value = material.id;
      document.getElementById("item").value = material.nome_item;
      
      // --- Carregar a quantidade ---
      document.getElementById("quantidade").value = material.quantidade || 1;
      // ----------------------------

      document.getElementById("observacoes").value = material.observacoes || "";
      if (material.projeto) selectProjeto.value = material.projeto;
      if (material.destino === "robotica")
        document.getElementById("robotica").checked = true;
      else if (material.destino === "manutencao")
        document.getElementById("manutencao").checked = true;

      // --- LOGICA DE EXIBIÇÃO DA IMAGEM ---
      const previewContainer = document.getElementById("preview-container");

      if (material.arquivo_nome) {
        // Verifica se é uma imagem pelo MIME Type (ex: image/png, image/jpeg)
        const isImage = material.arquivo_tipo && material.arquivo_tipo.startsWith("image/");

        if (isImage) {
            // URL da rota que serve o arquivo (definida no server.js)
            const imageUrl = `http://localhost:3000/api/materiais/arquivo/${material.id}`;
            
            previewContainer.innerHTML = `
                <img src="${imageUrl}" alt="Imagem do Material" class="imagem-preview-db">
                <span class="nome-arquivo">${material.arquivo_nome}</span>
            `;
        } else {
            // Se não for imagem (ex: PDF, texto), mostra ícone genérico
            previewContainer.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="../../assets/icons/icon-pesquisa.svg" alt="Arquivo" style="width: 20px; opacity: 0.6;">
                    <span class="nome-arquivo">${material.arquivo_nome}</span>
                </div>
            `;
        }
      } else {
        previewContainer.innerHTML =
          '<span class="aviso-preview">Nenhum arquivo salvo.</span>';
      }
      // -----------------------------------------------------
    } else {
      alert("Material não encontrado.");
    }
  } catch (err) {
    console.error("Erro:", err);
    alert("Erro ao carregar dados.");
  }
}

window.onload = carregarDados;

document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("id", document.getElementById("material-id").value);
  formData.append("item", document.getElementById("item").value);
  
  // --- Enviar a quantidade ---
  formData.append("quantidade", document.getElementById("quantidade").value);
  // -------------------------

  const destino = document.querySelector('input[name="destino"]:checked');
  formData.append("destino", destino ? destino.value : "");
  formData.append("projeto", document.getElementById("projeto").value);
  formData.append("observacoes", document.getElementById("observacoes").value);

  const arquivoInput = document.getElementById("arquivo");
  if (arquivoInput.files[0]) {
    formData.append("arquivo", arquivoInput.files[0]);
  }

  try {
    const response = await fetch("http://localhost:3000/api/atualizar", {
      method: "PUT",
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      alert("Material atualizado com sucesso!");
      // Redireciona para a home ou lista, conforme sua preferência
      window.location.href = "../main-pages/home/home-material.html";
    } else {
      alert("Erro: " + (result.error || "Desconhecido"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor.");
  }
});