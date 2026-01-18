const hostname = window.location.hostname || 'localhost';
const API_BASE = `http://${hostname}:3000`;
let html5QrCode;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    const readerDiv = document.getElementById("reader");
    const btnLerQrcode = document.getElementById("btn-ler-qrcode");
    const btnAdicionar = document.getElementById("btn-adicionar-material");
    const inputPesquisa = document.getElementById("pesquisa-item");
    const tabelaCorpo = document.getElementById("tabela-corpo");
    const campoPreco = document.getElementById("preco");
    const btnDeletar = document.getElementById("btn-deletar");
    const form = document.getElementById("formulario");
    const inputId = document.getElementById("id-projeto");

    let materiaisDisponiveis = [];

    if (!id) {
        alert("ID do projeto não encontrado na URL.");
        window.location.href = "../main-pages/home/home-projeto.html";
        return;
    }

    if(inputId) inputId.value = id;

    await carregarMateriaisGlobais();
    await carregarDadosDoProjeto();
    await carregarMateriaisDoProjeto();

    async function carregarDadosDoProjeto() {
        try {
            const response = await fetch(`${API_BASE}/api/projetos/${id}`);
            if (!response.ok) throw new Error("Erro ao buscar projeto");
            
            const projeto = await response.json();

            document.getElementById("item").value = projeto.nome_projeto || "";
            document.getElementById("observacoes").value = projeto.observacoes || "";
            
            if(campoPreco) {
                const precoBanco = parseFloat(projeto.preco);
                campoPreco.value = !isNaN(precoBanco) ? precoBanco.toFixed(2) : "0.00";
            }

            if (projeto.setor) {
                const radio = document.querySelector(`input[name="destino"][value="${projeto.setor.toLowerCase()}"]`);
                if (radio) radio.checked = true;
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar dados do projeto.");
        }
    }

    async function carregarMateriaisDoProjeto() {
        try {
            const resMateriais = await fetch(`${API_BASE}/api/materiais/projeto/${id}`);
            if(resMateriais.ok) {
                const materiais = await resMateriais.json();
                renderizarTabela(materiais);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (readerDiv && readerDiv.classList.contains("ativo")) {
                try {
                    await html5QrCode.stop();
                } catch(err) { console.log(err); }
            }

            try {
                const radioSelecionado = document.querySelector('input[name="destino"]:checked');
                if (!radioSelecionado) {
                    alert("Selecione um Setor (Robótica ou Manutenção).");
                    return;
                }

                const setorValor = radioSelecionado.value;
                const nomeValor = document.getElementById("item").value;
                const obsValor = document.getElementById("observacoes").value;
                const precoValor = document.getElementById("preco").value;

                const materiaisParaSalvar = [];
                const materiaisVisualizacao = [];

                document.querySelectorAll('#tabela-corpo tr').forEach(row => {
                    const idMat = row.querySelector('.item-id').textContent;
                    const nomeMat = row.querySelector('.item-nome').textContent;
                    const qtdMat = row.querySelector('.item-qtd').textContent;

                    if(idMat) {
                        materiaisParaSalvar.push(parseInt(idMat));
                        materiaisVisualizacao.push({
                            id: idMat,
                            item: nomeMat,
                            qtd: qtdMat
                        });
                    }
                });

                const dados = {
                    id: id,
                    item: nomeValor,
                    destino: setorValor,
                    observacoes: obsValor,
                    preco: precoValor,
                    materiais: materiaisParaSalvar 
                };

                const response = await fetch(`${API_BASE}/api/atualizar-projeto`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    sessionStorage.setItem('ultimoProjetoMateriais', JSON.stringify(materiaisVisualizacao));

                    const paramsRedirecionamento = new URLSearchParams({
                        id: id,
                        nome: nomeValor,
                        setor: setorValor,
                        obs: obsValor,
                        preco: precoValor || "0.00"
                    });

                    alert("Projeto atualizado com sucesso!");
                    window.location.href = `projeto-editado.html?${paramsRedirecionamento.toString()}`;
                } else {
                    const errorText = await response.text();
                    alert("Erro ao atualizar projeto: " + errorText);
                }

            } catch (error) {
                console.error(error);
                alert("Erro de conexão.");
            }
        });
    }

    if (btnDeletar) {
        btnDeletar.addEventListener("click", async () => {
            if (confirm("Tem certeza que deseja deletar este projeto permanentemente?")) {
                try {
                    const response = await fetch(`${API_BASE}/api/deletar-projeto/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        alert("Projeto deletado com sucesso!");
                        window.location.href = "../main-pages/home/home-projeto.html";
                    } else {
                        alert("Erro ao deletar projeto.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Erro de conexão.");
                }
            }
        });
    }

    if (tabelaCorpo) {
        tabelaCorpo.addEventListener("click", (e) => {
            const botaoExcluir = e.target.closest(".botao-excluir");
            if (botaoExcluir) {
                e.preventDefault();
                botaoExcluir.closest("tr").remove();
            }
        });
    }

    if (campoPreco) {
        campoPreco.addEventListener("focus", function() {
            if (this.value === "0.00" || this.value === "0,00") this.value = "";
        });
        campoPreco.addEventListener("blur", function() {
            if (this.value === "") {
                this.value = "0.00";
            } else {
                let valor = this.value.replace(',', '.');
                let valorFloat = parseFloat(valor);
                if (!isNaN(valorFloat)) this.value = valorFloat.toFixed(2);
                else this.value = "0.00";
            }
        });
    }

    function tentarAdicionarMaterial(materialEncontrado) {
        if (!materialEncontrado) {
            alert("Material não encontrado no estoque.");
            return false;
        }
        const idsNaTabela = Array.from(document.querySelectorAll('.item-id')).map(td => td.textContent);
        if(idsNaTabela.includes(String(materialEncontrado.id))){
            alert(`O item "${materialEncontrado.nome_item}" já está na lista.`);
            return false;
        }
        adicionarLinhaNaTabela(materialEncontrado.nome_item, materialEncontrado.quantidade, materialEncontrado.id);
        return true;
    }

    if(btnAdicionar && inputPesquisa) {
        const acaoBotaoAdicionar = () => {
            const termoPesquisado = inputPesquisa.value.trim();
            if(!termoPesquisado) return;
            const materialEncontrado = materiaisDisponiveis.find(m => 
                m.nome_item.toLowerCase() === termoPesquisado.toLowerCase()
            );
            const adicionou = tentarAdicionarMaterial(materialEncontrado);
            if (adicionou || materialEncontrado) {
                inputPesquisa.value = ""; 
                inputPesquisa.focus();
            }
        };
        btnAdicionar.addEventListener("click", acaoBotaoAdicionar);
        inputPesquisa.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                acaoBotaoAdicionar();
            }
        });
    }

    if (btnLerQrcode) {
        html5QrCode = new Html5Qrcode("reader");
        btnLerQrcode.addEventListener("click", () => {
            if (readerDiv.classList.contains("ativo")) pararLeitor();
            else iniciarLeitor();
        });
    }

    function iniciarLeitor() {
        readerDiv.classList.add("ativo");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(err => {
            console.error(err);
            html5QrCode.start({ facingMode: "user" }, config, onScanSuccess);
        });
    }

    function pararLeitor() {
        html5QrCode.stop().then(() => {
            readerDiv.classList.remove("ativo");
        }).catch(err => console.error(err));
    }

    function onScanSuccess(decodedText, decodedResult) {
        const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);
        if (!idLimpo) return;
        const materialEncontrado = materiaisDisponiveis.find(m => parseInt(m.id) === idLimpo);
        if (materialEncontrado) {
            const sucesso = tentarAdicionarMaterial(materialEncontrado);
            if (sucesso) {
                alert(`Item adicionado via QR: ${materialEncontrado.nome_item}`);
                pararLeitor(); 
            }
        } else {
            alert(`ID ${idLimpo} não encontrado.`);
        }
    }

    async function carregarMateriaisGlobais() {
        try {
            const response = await fetch(`${API_BASE}/api/materiais`);
            if (!response.ok) throw new Error("Erro ao buscar lista de materiais");
            materiaisDisponiveis = await response.json();
            const datalist = document.getElementById("lista-materiais");
            if (datalist) {
                datalist.innerHTML = ""; 
                const nomesUnicos = new Set(materiaisDisponiveis.map(m => m.nome_item));
                nomesUnicos.forEach(nome => {
                    const option = document.createElement("option");
                    option.value = nome;
                    datalist.appendChild(option);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderizarTabela(listaMateriais) {
        if(!tabelaCorpo) return;
        tabelaCorpo.innerHTML = ""; 
        if(listaMateriais.length === 0) return;
        listaMateriais.forEach(material => {
            const qtdReal = (material.quantidade !== undefined && material.quantidade !== null) ? material.quantidade : 0;
            adicionarLinhaNaTabela(material.nome_item, qtdReal, material.id);
        });
    }

    function adicionarLinhaNaTabela(nome, qtd, id) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="item-id">${id}</td>
            <td class="item-nome">${nome}</td>
            <td class="item-qtd">x${qtd}</td>
            <td>
                <button type="button" class="botao-excluir" aria-label="Remover item">
                    <img src="../../assets/icons/icon-excluir.svg" alt="Excluir">
                </button>
            </td>
        `;
        tabelaCorpo.appendChild(tr);
    }
});