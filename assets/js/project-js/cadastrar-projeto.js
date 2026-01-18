const API_BASE = `http://${window.location.hostname}:3000`;

let listaMateriaisSelecionados = [];
let estadoOrdenacao = {
  coluna: "id",
  direcao: "asc",
};
let html5QrCode;

window.ordenarPor = function (coluna) {
  if (estadoOrdenacao.coluna === coluna) {
    estadoOrdenacao.direcao =
      estadoOrdenacao.direcao === "asc" ? "desc" : "asc";
  } else {
    estadoOrdenacao.coluna = coluna;
    estadoOrdenacao.direcao = "asc";
  }
  ordenarLista();
  renderizarTabelaSelecionada();
};

function ordenarLista() {
  const coluna = estadoOrdenacao.coluna;
  listaMateriaisSelecionados.sort((a, b) => {
    let valorA = a[coluna];
    let valorB = b[coluna];
    if (coluna === "id" || coluna === "quantidade") {
      valorA = Number(valorA) || 0;
      valorB = Number(valorB) || 0;
    } else {
      valorA = (valorA || "").toString().toLowerCase();
      valorB = (valorB || "").toString().toLowerCase();
    }
    if (valorA < valorB) return estadoOrdenacao.direcao === "asc" ? -1 : 1;
    if (valorA > valorB) return estadoOrdenacao.direcao === "asc" ? 1 : -1;
    return 0;
  });
}

function renderizarTabelaSelecionada() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  tabelaCorpo.innerHTML = "";

  listaMateriaisSelecionados.forEach((material, index) => {
    const novaLinha = document.createElement("tr");
    novaLinha.dataset.index = index;
    const qtdReal =
      material.quantidade !== undefined && material.quantidade !== null
        ? material.quantidade
        : 0;

    novaLinha.innerHTML = `
      <td class="item-id">${material.id}</td>
      <td class="item-nome">${material.nome_item}</td>
      <td class="item-qtd">x${qtdReal}</td>
      <td>
          <button type="button" class="botao-excluir" aria-label="Remover item">
              <img src="../../assets/icons/icon-excluir.svg" alt="">
          </button>
      </td>
    `;
    tabelaCorpo.appendChild(novaLinha);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const inputPesquisa = document.getElementById("pesquisa-item");
  const btnAdicionar = document.getElementById("btn-adicionar-material");
  const tabelaCorpo = document.getElementById("tabela-corpo");
  const dataListMateriais = document.getElementById("lista-materiais");
  const campoPreco = document.getElementById("preco");

  const btnLerQrcode = document.getElementById("btn-ler-qrcode");
  const readerDiv = document.getElementById("reader");

  const btnFecharCabecalho = document.querySelector(".botao-fechar");
  const popup = document.querySelector(".popup-overlay");

  if (btnFecharCabecalho && popup) {
      const btnVoltarPopup = popup.querySelector(".acao-voltar");
      const btnConfirmarPopup = popup.querySelector(".acao-confirmar");

      btnFecharCabecalho.addEventListener("click", (e) => {
          e.preventDefault();
          popup.classList.add("ativo");
      });

      if (btnVoltarPopup) {
          btnVoltarPopup.addEventListener("click", (e) => {
              e.preventDefault();
              popup.classList.remove("ativo");
          });
      }

      if (btnConfirmarPopup) {
          btnConfirmarPopup.addEventListener("click", (e) => {
              e.preventDefault();
              window.location.href = "../main-pages/home/home-projeto.html";
          });
      }
  }

  let materiaisDisponiveis = [];

  if (campoPreco) {
      campoPreco.addEventListener("focus", function() {
          if (this.value === "0.00" || this.value === "0,00") {
              this.value = "";
          }
      });

      campoPreco.addEventListener("blur", function() {
          if (this.value === "") {
              this.value = "0.00";
          } else {
              let valor = this.value.replace(',', '.');
              let valorFloat = parseFloat(valor);

              if (!isNaN(valorFloat)) {
                  this.value = valorFloat.toFixed(2);
              } else {
                  this.value = "0.00";
              }
          }
      });
  }

  async function carregarMateriais() {
    try {
      const response = await fetch(`${API_BASE}/api/materiais`);
      if (!response.ok) throw new Error("Falha ao buscar materiais");

      materiaisDisponiveis = await response.json();

      dataListMateriais.innerHTML = "";
      materiaisDisponiveis.forEach((material) => {
        const option = document.createElement("option");
        option.value = material.nome_item;
        dataListMateriais.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    }
  }
  carregarMateriais();

  function adicionarItemAoArray(materialEncontrado) {
    listaMateriaisSelecionados.push(materialEncontrado);
    ordenarLista();
    renderizarTabelaSelecionada();
  }

  function adicionarViaInput() {
    const termoPesquisado = inputPesquisa.value.trim();
    if (!termoPesquisado) return;

    const materialEncontrado = materiaisDisponiveis.find(
      (m) => m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
    );

    if (materialEncontrado) {
      adicionarItemAoArray(materialEncontrado);
      inputPesquisa.value = "";
      inputPesquisa.focus();
    } else {
      alert("Material não encontrado no estoque.");
    }
  }

  if (btnLerQrcode) {
    html5QrCode = new Html5Qrcode("reader");

    btnLerQrcode.addEventListener("click", () => {
      if (readerDiv.classList.contains("ativo")) {
        pararLeitor();
      } else {
        iniciarLeitor();
      }
    });
  }

  function iniciarLeitor() {
    readerDiv.classList.add("ativo");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode
      .start({ facingMode: "environment" }, config, onScanSuccess)
      .catch((err) => {
        console.error("Erro câmera traseira, tentando frontal", err);
        html5QrCode.start({ facingMode: "user" }, config, onScanSuccess);
      });
  }

  function pararLeitor() {
    html5QrCode
      .stop()
      .then(() => {
        readerDiv.classList.remove("ativo");
        console.log("Câmera parada.");
      })
      .catch((err) => console.error("Erro ao parar câmera", err));
  }

  function onScanSuccess(decodedText, decodedResult) {
    const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);

    if (!idLimpo) {
      alert("QR Code inválido: " + decodedText);
      return;
    }

    const materialEncontrado = materiaisDisponiveis.find(
      (m) => parseInt(m.id) === idLimpo
    );

    if (materialEncontrado) {
      adicionarItemAoArray(materialEncontrado);
      pararLeitor();
    } else {
      alert(`ID ${idLimpo} não encontrado.`);
    }
  }

  if (btnAdicionar) btnAdicionar.addEventListener("click", adicionarViaInput);

  if (inputPesquisa) {
    inputPesquisa.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        adicionarViaInput();
      }
    });
  }

  if (tabelaCorpo) {
    tabelaCorpo.addEventListener("click", (e) => {
      const botaoExcluir = e.target.closest(".botao-excluir");
      if (botaoExcluir) {
        const row = botaoExcluir.closest("tr");
        const index = row.dataset.index;
        listaMateriaisSelecionados.splice(index, 1);
        renderizarTabelaSelecionada();
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("item").value;
    const obs = document.getElementById("observacoes").value;
    const preco = document.getElementById("preco").value;
    const setorInput = document.querySelector('input[name="destino"]:checked');
    const setor = setorInput ? setorInput.value : null;

    if (!nome || !setor) {
      alert("Preencha Nome e Setor.");
      return;
    }

    if (readerDiv.classList.contains("ativo")) {
      await html5QrCode.stop().catch((err) => console.log(err));
    }

    const materiaisParaSalvar = listaMateriaisSelecionados.map((m) =>
      parseInt(m.id)
    );
    
    const materiaisVisualizacao = listaMateriaisSelecionados.map((m) => ({
      id: m.id,
      item: m.nome_item,
      qtd: `x${m.quantidade || 0}`,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/cadastrar-projeto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: nome,
          destino: setor,
          observacoes: obs,
          preco: preco,
          materiais: materiaisParaSalvar,
        }),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem(
          "ultimoProjetoMateriais",
          JSON.stringify(materiaisVisualizacao)
        );

        const params = new URLSearchParams({
          id: result.id,
          nome: nome,
          setor: setor,
          obs: obs,
          preco: preco || "0.00",
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
});