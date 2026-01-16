// FUNÇÃO PARA CARREGAR PROJETOS 
async function carregarProjetos() {
  try {
    const response = await fetch("http://localhost:3000/api/projetos");
    const projetos = await response.json();
    const selectProjeto = document.getElementById("projeto");

    // Limpa e reseta o select
    if (selectProjeto) {
      selectProjeto.innerHTML =
        '<option value="" selected disabled hidden></option>';
      projetos.forEach((proj) => {
        const option = document.createElement("option");
        option.value = proj.nome_projeto;
        option.textContent = proj.nome_projeto;
        selectProjeto.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Erro ao carregar projetos:", err);
  }
}

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  // Carrega os projetos no select
  carregarProjetos();

  // Lógica para mostrar o nome do arquivo selecionado (CORREÇÃO DO PROBLEMA)
  const inputArquivo = document.getElementById("arquivo");
  const spanNome = document.getElementById("nome-arquivo");

  if (inputArquivo && spanNome) {
    inputArquivo.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        // Pega o nome e exibe no span
        spanNome.textContent = this.files[0].name;
        spanNome.style.color = "var(--cor-texto-escuro)";
      } else {
        // Se cancelar a seleção, limpa o texto
        spanNome.textContent = "";
      }
    });
  }

  // 3. Configura o envio do formulário
  const formulario = document.getElementById("formulario");
  if (formulario) {
    formulario.addEventListener("submit", enviarFormulario);
  }
});

// LÓGICA DE ENVIO DO FORMULÁRIO (CADASTRO) ---
async function enviarFormulario(e) {
  e.preventDefault();

  // Criar um objeto FormData para enviar arquivos + texto
  const formData = new FormData();

  // Adicionar campos de texto
  formData.append("item", document.getElementById("item").value);

  // Pega a quantidade do input
  formData.append("quantidade", document.getElementById("quantidade").value);

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
}

// FUNÇÕES DE CONTROLE DE QUANTIDADE
function incrementarQtd() {
  const input = document.getElementById("quantidade");
  let val = parseInt(input.value) || 0;
  input.value = val + 1;
}

function decrementarQtd() {
  const input = document.getElementById("quantidade");
  let val = parseInt(input.value) || 0;
  if (val > 1) {
    input.value = val - 1;
  }
}
