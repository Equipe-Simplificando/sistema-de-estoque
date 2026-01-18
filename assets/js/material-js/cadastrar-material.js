const API_BASE = `http://${window.location.hostname}:3000`; 

async function carregarProjetos() {
  try {
    const response = await fetch(`${API_BASE}/api/projetos`);
    const projetos = await response.json();
    const selectProjeto = document.getElementById("projeto");

    if (selectProjeto) {
      // Opção vazia para permitir salvar sem projeto
      selectProjeto.innerHTML = '<option value="" selected disabled hidden></option>';
      
      projetos.forEach((proj) => {
        const option = document.createElement("option");
        option.value = proj.id; // ID para o banco
        option.textContent = proj.nome_projeto;
        selectProjeto.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Erro ao carregar projetos:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarProjetos();

  const inputArquivo = document.getElementById("arquivo");
  const spanNome = document.getElementById("nome-arquivo");

  if (inputArquivo && spanNome) {
    inputArquivo.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        spanNome.textContent = this.files[0].name;
        spanNome.style.color = "var(--cor-texto-escuro)";
      } else {
        spanNome.textContent = "";
      }
    });
  }

  const formulario = document.getElementById("formulario");
  if (formulario) {
    formulario.addEventListener("submit", enviarFormulario);
  }
});

async function enviarFormulario(e) {
  e.preventDefault();

  const destinoSelecionado = document.querySelector('input[name="destino"]:checked');
  const selectProjeto = document.getElementById("projeto");
  
  // Validação APENAS do Destino (Projeto agora é opcional)
  if (!destinoSelecionado) {
    alert("Por favor, selecione o Destino (Setor).");
    return;
  }

  const formData = new FormData();
  formData.append("item", document.getElementById("item").value);
  formData.append("quantidade", document.getElementById("quantidade").value);
  formData.append("destino", destinoSelecionado.value);
  
  // Se tiver valor selecionado, envia o ID. Se não, envia vazio ou null.
  formData.append("projeto", selectProjeto.value || ""); 
  
  formData.append("observacoes", document.getElementById("observacoes").value);

  const arquivoInput = document.getElementById("arquivo");
  if (arquivoInput.files[0]) {
    formData.append("arquivo", arquivoInput.files[0]);
  }

  try {
    const response = await fetch(`${API_BASE}/api/cadastrar`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Define o texto do projeto para a etiqueta (Visual)
      let nomeProjetoTexto = "-";
      // Se tiver algo selecionado que não seja vazio
      if (selectProjeto.value) {
          nomeProjetoTexto = selectProjeto.options[selectProjeto.selectedIndex].text;
      }

      const idFormatado = String(result.id).padStart(4, "0");
      
      const params = new URLSearchParams({
        id: idFormatado,
        nome: document.getElementById("item").value,
        destino: destinoSelecionado.value,
        projeto: nomeProjetoTexto, // Manda o nome ou "-"
        obs: document.getElementById("observacoes").value || "-",
        cod: "MAT-" + idFormatado,
      });

      window.location.href = `etiqueta-gerada.html?${params.toString()}`;
    } else {
      console.error("Erro do servidor:", result);
      alert("Erro ao cadastrar: " + (result.error || "Erro desconhecido."));
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
    alert("Erro de conexão. Verifique se o servidor está rodando.");
  }
}

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