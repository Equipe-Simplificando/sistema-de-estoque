const API_BASE = `http://${window.location.hostname}:3000`;
let html5QrCode; // Variável global para o leitor

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    // Elementos do DOM
    const readerDiv = document.getElementById("reader");
    const btnLerQrcode = document.getElementById("btn-ler-qrcode");
    const btnAdicionar = document.getElementById("btn-adicionar-material");
    const inputPesquisa = document.getElementById("pesquisa-item");
    const tabelaCorpo = document.getElementById("tabela-corpo");
    const campoPreco = document.getElementById("preco"); // Referência ao campo preço
    
    let materiaisDisponiveis = [];

    if (!id) {
        alert("ID do projeto não encontrado.");
        window.location.href = "../main-pages/home/home-projeto.html";
        return;
    }

    const inputId = document.getElementById("id-projeto");
    if(inputId) inputId.value = id;

    // --- LOGICA DO CAMPO PREÇO (NOVO) ---
    if (campoPreco) {
        // Evento ao clicar no campo (Foco)
        campoPreco.addEventListener("focus", function() {
            // Se o valor for 0.00 ou 0,00, limpa para o usuário digitar
            if (this.value === "0.00" || this.value === "0,00") {
                this.value = "";
            }
        });

        // Evento ao sair do campo (Blur)
        campoPreco.addEventListener("blur", function() {
            // Se o usuário deixou vazio, volta o 0.00
            if (this.value === "") {
                this.value = "0.00";
            } else {
                // Opcional: Se digitou um número (ex: 5), formata para 5.00 ao sair
                const valorNumerico = parseFloat(this.value.replace(',', '.'));
                if (!isNaN(valorNumerico)) {
                    this.value = valorNumerico.toFixed(2);
                }
            }
        });
    }
    // ------------------------------------

    // 1. Carrega materiais para preencher o datalist e usar na busca/qr
    await carregarMateriaisGlobais();

    // 2. Busca dados do projeto atual
    try {
        const response = await fetch(`${API_BASE}/api/projetos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar projeto");
        
        const projeto = await response.json();

        document.getElementById("item").value = projeto.nome_projeto || "";
        document.getElementById("observacoes").value = projeto.observacoes || "";
        
        // Ajuste no carregamento do preço: garante formato 0.00
        if(campoPreco) {
            const precoBanco = parseFloat(projeto.preco);
            // Se tiver preço válido, formata. Se não, coloca "0.00"
            campoPreco.value = !isNaN(precoBanco) ? precoBanco.toFixed(2) : "0.00";
        }

        if (projeto.setor) {
            const radio = document.querySelector(`input[name="destino"][value="${projeto.setor.toLowerCase()}"]`);
            if (radio) radio.checked = true;
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar dados do projeto. Verifique o console.");
    }

    // 3. Busca os materiais JÁ vinculados ao projeto e preenche a tabela
    try {
        const resMateriais = await fetch(`${API_BASE}/api/materiais/projeto/${id}`);
        if(resMateriais.ok) {
            const materiais = await resMateriais.json();
            renderizarTabela(materiais);
        }
    } catch (error) {
        console.error("Erro ao carregar itens do projeto:", error);
    }

    // --- LÓGICA DE ADICIONAR ITEM (COMPARTILHADA) ---
    
    function tentarAdicionarMaterial(materialEncontrado) {
        if (!materialEncontrado) {
            alert("Material não encontrado no estoque.");
            return false;
        }

        const idsNaTabela = Array.from(document.querySelectorAll('.item-id'))
                                    .map(td => td.textContent);
        
        if(idsNaTabela.includes(String(materialEncontrado.id))){
            alert(`O item "${materialEncontrado.nome_item}" já está na lista.`);
            return false;
        }

        adicionarLinhaNaTabela(
            materialEncontrado.nome_item, 
            materialEncontrado.quantidade, 
            materialEncontrado.id
        );
        return true;
    }

    // --- LÓGICA DO INPUT DE TEXTO ---

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

    // --- LÓGICA DO LEITOR DE QR CODE ---

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
        
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(err => {
            console.error("Erro câmera traseira, tentando frontal", err);
            html5QrCode.start({ facingMode: "user" }, config, onScanSuccess);
        });
    }

    function pararLeitor() {
        html5QrCode.stop().then(() => {
            readerDiv.classList.remove("ativo");
        }).catch(err => console.error("Erro ao parar câmera", err));
    }

    function onScanSuccess(decodedText, decodedResult) {
        const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);

        if (!idLimpo) {
            console.warn("QR Code lido mas sem ID numérico válido:", decodedText);
            return;
        }

        const materialEncontrado = materiaisDisponiveis.find(m => parseInt(m.id) === idLimpo);

        if (materialEncontrado) {
            const sucesso = tentarAdicionarMaterial(materialEncontrado);
            if (sucesso) {
                alert(`Item adicionado via QR: ${materialEncontrado.nome_item}`);
                pararLeitor(); 
            }
        } else {
            alert(`ID ${idLimpo} escaneado, mas item não encontrado no banco de dados.`);
        }
    }

    // --- OUTRAS FUNÇÕES ---

    if (tabelaCorpo) {
        tabelaCorpo.addEventListener("click", (e) => {
            const botaoExcluir = e.target.closest(".botao-excluir");
            if (botaoExcluir) {
                botaoExcluir.closest("tr").remove();
            }
        });
    }

    const form = document.getElementById("formulario");
    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (readerDiv.classList.contains("ativo")) {
                await html5QrCode.stop().catch(err => console.log(err));
            }

            const radioSelecionado = document.querySelector('input[name="destino"]:checked');
            const setorValor = radioSelecionado ? radioSelecionado.value : "";

            const materiaisParaSalvar = [];
            document.querySelectorAll('#tabela-corpo tr').forEach(row => {
                const idMat = row.querySelector('.item-id').textContent;
                if(idMat) materiaisParaSalvar.push(parseInt(idMat));
            });

            const dados = {
                id: id,
                item: document.getElementById("item").value,
                destino: setorValor,
                observacoes: document.getElementById("observacoes").value,
                preco: document.getElementById("preco").value,
                materiais: materiaisParaSalvar 
            };

            try {
                const response = await fetch(`${API_BASE}/api/atualizar-projeto`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert("Projeto atualizado com sucesso!");
                    window.location.href = "../main-pages/home/home-projeto.html";
                } else {
                    alert("Erro ao atualizar projeto.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro de conexão.");
            }
        });
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
            console.error("Erro ao carregar sugestões:", error);
        }
    }

    function renderizarTabela(listaMateriais) {
        const tbody = document.getElementById("tabela-corpo");
        if(!tbody) return;
        
        tbody.innerHTML = ""; 
    
        if(listaMateriais.length === 0) return;
    
        listaMateriais.forEach(material => {
            const qtdReal = (material.quantidade !== undefined && material.quantidade !== null) 
                            ? material.quantidade 
                            : 0;
            
            adicionarLinhaNaTabela(material.nome_item, qtdReal, material.id);
        });
    }

    function adicionarLinhaNaTabela(nome, qtd, id) {
        const tbody = document.getElementById("tabela-corpo");
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
        tbody.appendChild(tr);
    }
});