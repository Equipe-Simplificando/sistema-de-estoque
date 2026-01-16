const API_BASE = `http://${window.location.hostname}:3000`;
let listaGlobalProjetos = [];
let listaGlobalMateriais = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarPesquisa();
    atualizarMenuAtivo();
    configurarAcoesBotoes();
    configurarAcaoToggle(); 
});

async function carregarDados() {
    const container = document.getElementById("lista-projetos");
    
    try {
        const [resProjetos, resMateriais] = await Promise.all([
            fetch(`${API_BASE}/api/projetos`),
            fetch(`${API_BASE}/api/materiais`)
        ]);
        
        if (!resProjetos.ok || !resMateriais.ok) throw new Error("Erro na resposta da API");

        let projetos = await resProjetos.json();
        listaGlobalMateriais = await resMateriais.json();

        const urlParams = new URLSearchParams(window.location.search);
        const filtroSetor = urlParams.get('setor');

        if (filtroSetor) {
            projetos = projetos.filter(projeto => {
                const termo = filtroSetor.toLowerCase();
                
                if (termo === 'venda') {
                    const valor = projeto.preco ? parseFloat(projeto.preco) : 0;
                    return valor > 0;
                }

                const normalizar = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
                const setorProj = normalizar(projeto.setor);

                if (termo === 'robotica' && setorProj.includes('robotica')) return true;
                if (termo === 'manutencao' && setorProj.includes('manutencao')) return true;
                
                return false;
            });
        }
        
        listaGlobalProjetos = projetos;
        renderizarProjetos(listaGlobalProjetos, listaGlobalMateriais);
        atualizarSugestoes(listaGlobalProjetos);

    } catch (error) {
        console.error("Erro:", error);
        if(container) {
            container.innerHTML = `<p class="msg-status msg-erro">Erro ao carregar dados.</p>`;
        }
    }
}

function renderizarProjetos(projetos, materiais) {
    const container = document.getElementById("lista-projetos");
    if (!container) return;
  
    container.innerHTML = "";
  
    const perfil = localStorage.getItem("perfilUsuario");
    const ehAdmin = perfil === "admin";
  
    if (!projetos || projetos.length === 0) {
      container.innerHTML = `<p class="msg-status">Nenhum projeto encontrado.</p>`;
      return;
    }
  
    const normalizar = (texto) => {
        if (!texto) return "";
        return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    };
  
    projetos.forEach((projeto) => {
      const materiaisDoProjeto = materiais.filter((m) => {
        if (!m.projeto) return false;
        if (String(m.projeto) === String(projeto.id)) return true;
        return normalizar(m.projeto) === normalizar(projeto.nome_projeto);
      });
  
      const precoFormatado = projeto.preco
        ? parseFloat(projeto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : "R$ 0";
  
      let iconHTML = "";
      const setor = projeto.setor ? projeto.setor.toLowerCase() : "";
      if (setor.includes("robótica") || setor.includes("robotica")) {
        iconHTML = `<img src="../../../assets/icons/icon-robotica.svg" alt="Robótica" class="icone-categoria">`;
      } else if (setor.includes("manutenção") || setor.includes("manutencao")) {
        iconHTML = `<img src="../../../assets/icons/icon-manutencao.svg" alt="Manutenção" class="icone-categoria">`;
      }
  
      const details = document.createElement("details");
      details.classList.add("aba-projeto");
  
      const summary = document.createElement("summary");
      summary.classList.add("cabecalho-projeto");
      summary.innerHTML = `
              <div class="cabecalho-conteudo">
                  <div class="grupo-titulo">${iconHTML}<span class="titulo-projeto">${projeto.nome_projeto}</span></div>
                  <span class="preco-projeto">${precoFormatado}</span>
              </div>
              <img src="../../../assets/icons/icon-seta.svg" alt="Abrir" class="icone-seta">
          `;
  
      const divConteudo = document.createElement("div");
      divConteudo.classList.add("conteudo-aba");
  
      const limite = 3;
      const qtdTotal = materiaisDoProjeto.length;
      const materiaisVisiveis = materiaisDoProjeto.slice(0, limite);
      const temMais = qtdTotal > limite;
  
      const gerarLinhasHTML = (listaMats) => {
         return listaMats.length > 0
          ? listaMats.map((mat) => `
                  <tr>
                      <td>${String(mat.id).padStart(3, "0")}</td>
                      <td>${mat.nome_item || "Sem nome"}</td>
                      <td>x${mat.quantidade ?? 0}</td>
                  </tr>`).join("")
          : `<tr><td colspan="3" class="td-vazio">Nenhum material vinculado.</td></tr>`;
      };

      const linhasTabelaInicial = gerarLinhasHTML(materiaisVisiveis);
  
      let htmlVerMais = "";
      if (temMais) {
          htmlVerMais = `
              <div class="container-ver-mais">
                  <span class="link-ver-mais acao-toggle" data-id="${projeto.id}" data-estado="fechado" style="cursor: pointer;">
                      Ver mais
                  </span>
              </div>
          `;
      }
  
      let htmlBotoes = `
              <button type="button" class="botao acao-amarelo acao-editar" data-id="${projeto.id}">EDITAR</button>
          `;
      if (ehAdmin) {
        htmlBotoes += `<button type="button" class="botao botao-vermelho acao-excluir" data-id="${projeto.id}">EXCLUIR</button>`;
      }
  
      divConteudo.innerHTML = `
              <div class="grupo-tabela">
                  <table class="tabela-itens">
                      <thead>
                          <tr>
                              <th class="col-id">ID</th>
                              <th class="col-item">ITEM</th>
                              <th class="col-qtd">QTD</th>
                          </tr>
                      </thead>
                      <tbody id="tbody-${projeto.id}">${linhasTabelaInicial}</tbody>
                  </table>
              </div>
  
              ${htmlVerMais}
  
              <div class="grupo-acoes">
                  ${htmlBotoes}
              </div>
          `;
  
      details.appendChild(summary);
      details.appendChild(divConteudo);
      container.appendChild(details);
    });
}

function configurarAcoesBotoes() {
    const container = document.getElementById("lista-projetos");
    
    container.addEventListener('click', (event) => {
        const botao = event.target.closest('button');

        if (!botao) return;

        if (botao.classList.contains('acao-editar')) {
            const id = botao.dataset.id;
            window.location.href = `../../project-pages/editar-projeto.html?id=${id}`;
        }

        if (botao.classList.contains('acao-excluir')) {
            const id = botao.dataset.id;
            deletarProjeto(id);
        }
    });
}

function configurarAcaoToggle() {
    const container = document.getElementById("lista-projetos");

    container.addEventListener('click', (event) => {
        const gatilho = event.target.closest('.acao-toggle');
        if (!gatilho) return;

        const idProjeto = gatilho.dataset.id;
        const estadoAtual = gatilho.dataset.estado;

        const projetoAlvo = listaGlobalProjetos.find(p => String(p.id) === String(idProjeto));
        if (!projetoAlvo) return;

        const normalizar = (texto) => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

        const todosMateriais = listaGlobalMateriais.filter(m => {
            if (!m.projeto) return false;
            if (String(m.projeto) === String(projetoAlvo.id)) return true;
            return normalizar(m.projeto) === normalizar(projetoAlvo.nome_projeto);
        });

        let materiaisParaExibir;
        let novoTexto;
        let novoEstado;

        if (estadoAtual === 'fechado') {
            materiaisParaExibir = todosMateriais;
            novoTexto = "Ver menos";
            novoEstado = "aberto";
        } else {
            materiaisParaExibir = todosMateriais.slice(0, 3);
            novoTexto = "Ver mais";
            novoEstado = "fechado";
        }

        const linhasHTML = materiaisParaExibir.map((mat) => `
            <tr>
                <td>${String(mat.id).padStart(3, "0")}</td>
                <td>${mat.nome_item || "Sem nome"}</td>
                <td>x${mat.quantidade ?? 0}</td>
            </tr>`).join("");

        const tbodyAlvo = document.getElementById(`tbody-${idProjeto}`);
        if (tbodyAlvo) {
            tbodyAlvo.innerHTML = linhasHTML;
        }

        gatilho.textContent = novoTexto;
        gatilho.dataset.estado = novoEstado;
    });
}

function configurarPesquisa() {
  const inputPesquisa = document.getElementById("pesquisa-projeto");
  if (inputPesquisa) {
    inputPesquisa.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      const listaFiltrada = listaGlobalProjetos.filter((projeto) =>
        String(projeto.nome_projeto).toLowerCase().includes(termo)
      );
      renderizarProjetos(listaFiltrada, listaGlobalMateriais);
    });
  }
}

function atualizarSugestoes(projetos) {
  const datalist = document.getElementById("sugestoes-projetos");
  if (datalist) {
    datalist.innerHTML = "";
    const nomesUnicos = new Set(projetos.map((p) => p.nome_projeto));
    nomesUnicos.forEach((nome) => {
      const option = document.createElement("option");
      option.value = nome;
      datalist.appendChild(option);
    });
  }
}

async function deletarProjeto(id) {
  if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
  try {
    const response = await fetch(
      `${API_BASE}/api/deletar-projeto/${id}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      location.reload();
    }
  } catch (e) {
    console.error(e);
  }
}

function atualizarMenuAtivo() {
  const urlParams = new URLSearchParams(window.location.search);
  const setor = urlParams.get("setor");

  let idAtivo = "menu-home";
  if (setor === "robotica") idAtivo = "menu-robotica";
  else if (setor === "manutencao") idAtivo = "menu-manutencao";
  else if (setor === "venda") idAtivo = "menu-venda";

  const iconesAtivos = {
    "menu-home": "../../../assets/icons/icon-home-ativo.svg",
    "menu-robotica": "../../../assets/icons/icon-robotica-ativo.svg",
    "menu-manutencao": "../../../assets/icons/icon-manutencao-ativo.svg",
    "menu-venda": "../../../assets/icons/icon-venda-ativo.svg",
  };

  const iconesPadrao = {
    "menu-home": "../../../assets/icons/icon-home.svg",
    "menu-robotica": "../../../assets/icons/icon-robotica.svg",
    "menu-manutencao": "../../../assets/icons/icon-manutencao.svg",
    "menu-venda": "../../../assets/icons/icon-venda.svg",
  };

  document.querySelectorAll(".item-menu").forEach((el) => {
    el.classList.remove("ativo");
    const img = el.querySelector("img");
    if (img && iconesPadrao[el.id]) {
      img.src = iconesPadrao[el.id];
    }
  });

  const elementoAtivo = document.getElementById(idAtivo);
  if (elementoAtivo) {
    elementoAtivo.classList.add("ativo");
    const img = elementoAtivo.querySelector("img");
    if (img) {
      img.src = iconesAtivos[idAtivo];
    }
  }
}