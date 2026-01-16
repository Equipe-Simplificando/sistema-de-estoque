window.incrementarQtd = function() {
    const input = document.getElementById("quantidade");
    let val = parseInt(input.value) || 0;
    input.value = val + 1;
}

window.decrementarQtd = function() {
    const input = document.getElementById("quantidade");
    let val = parseInt(input.value) || 0;
    if (val > 1) {
        input.value = val - 1;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Pega o ID da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID não encontrado!");
        window.location.href = "../main-pages/home/home-material.html";
        return;
    }

    // Preenche o input hidden com o ID para garantir
    const inputId = document.getElementById("material-id");
    if(inputId) inputId.value = id;

    // LÓGICA DO INPUT DE ARQUIVO (VISUAL)
    // Faz o nome do arquivo aparecer ao lado da câmera quando selecionado
    const inputArquivo = document.getElementById('arquivo');
    const spanNome = document.getElementById('nome-arquivo');

    if (inputArquivo && spanNome) {
        inputArquivo.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                spanNome.textContent = this.files[0].name;
                spanNome.style.color = "var(--cor-texto-escuro)";
            } else {
                spanNome.textContent = "";
            }
        });
    }

    // ORDEM DE CARREGAMENTO ---
    await carregarListaDeProjetos();
    await carregarDadosDoMaterial(id);
    
    // Configura o botão excluir após carregar a página
    configurarBotaoExcluir(id);

    async function carregarListaDeProjetos() {
        try {
            const res = await fetch("http://localhost:3000/api/projetos");
            const projetos = await res.json();
            const select = document.getElementById("projeto");
            
            // Limpa e reseta
            select.innerHTML = '<option value="" selected disabled hidden>Selecione...</option>';
            
            // Adiciona opção vazia/nenhum
            const optionVazia = document.createElement("option");
            optionVazia.value = "";
            optionVazia.textContent = "Sem projeto vinculado";
            select.appendChild(optionVazia);
    
            projetos.forEach(proj => {
                const option = document.createElement("option");
                // Importante: Verifique se seu backend espera o ID ou o NOME.
                // Aqui estou usando o nome_projeto como valor, igual ao cadastro.
                option.value = proj.nome_projeto; 
                option.textContent = proj.nome_projeto;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
        }
    }

    async function carregarDadosDoMaterial(id) {
        try {
            const response = await fetch("http://localhost:3000/api/materiais");
            const materiais = await response.json();
            const material = materiais.find((m) => m.id == id);
    
            if (material) {
                // Preenche campos de texto
                document.getElementById("item").value = material.nome_item;
                document.getElementById("quantidade").value = material.quantidade || 1;
                document.getElementById("observacoes").value = material.observacoes || "";
                
                // Preenche Radio Button (Destino)
                if (material.destino) {
                    const destinoVal = material.destino.toLowerCase();
                    const radio = document.querySelector(`input[name="destino"][value="${destinoVal}"]`);
                    if (radio) radio.checked = true;
                }
    
                // Preenche Select (Projeto)
                const selectProjeto = document.getElementById("projeto");
                if (material.projeto) {
                    selectProjeto.value = material.projeto;
                }

                // PREVIEW DO ARQUIVO ATUAL ---
                const previewContainer = document.getElementById('preview-container');
                
                if (material.arquivo_nome) {
                    previewContainer.innerHTML = ''; // Limpa o "Verificando..."
                    
                    // Mostra nome do arquivo salvo
                    const nomeDiv = document.createElement('div');
                    nomeDiv.style.marginBottom = "8px";
                    nomeDiv.innerHTML = `<strong>Arquivo salvo:</strong> <span style="color:#666">${material.arquivo_nome}</span>`;
                    previewContainer.appendChild(nomeDiv);
    
                    // Se for imagem, mostra a foto
                    if (material.arquivo_tipo && material.arquivo_tipo.startsWith('image/')) {
                        const img = document.createElement('img');
                        // timestamp (?t=...) força o navegador a baixar a imagem nova se ela mudou
                        img.src = `http://localhost:3000/api/materiais/arquivo/${id}?t=${Date.now()}`;
                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "200px";
                        img.style.borderRadius = "var(--radius)";
                        img.style.border = "1px solid #ccc";
                        img.alt = "Pré-visualização";
                        previewContainer.appendChild(img);
                    } else {
                        // Se for outro tipo de arquivo
                        const aviso = document.createElement('small');
                        aviso.textContent = "(Visualização indisponível para este formato)";
                        previewContainer.appendChild(aviso);
                    }
                } else {
                    previewContainer.innerHTML = '<span style="color: #888;">Nenhum arquivo anexado anteriormente.</span>';
                }
    
            } else {
                alert("Material não encontrado.");
                window.location.href = "../main-pages/home/home-material.html";
            }
        } catch (error) {
            console.error("Erro ao buscar material:", error);
            alert("Erro ao carregar dados do material.");
        }
    }

    function configurarBotaoExcluir(id) {
        // Seleciona o botão VERMELHO que já existe no HTML
        const btnExcluir = document.querySelector('.botao-vermelho');
        const perfil = localStorage.getItem("perfilUsuario");

        if (btnExcluir) {
            if (perfil === "admin") {
                // Se for admin, adiciona o evento de clique
                btnExcluir.onclick = async function() {
                    const confirmacao = confirm("ATENÇÃO: Tem certeza que deseja excluir este material?");
                    
                    if (confirmacao) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/deletar/${id}`, { method: 'DELETE' });
                            
                            if (res.ok) {
                                alert("Material excluído com sucesso!");
                                window.location.href = "../main-pages/home/home-material.html";
                            } else {
                                alert("Erro ao excluir o material.");
                            }
                        } catch (e) {
                            console.error(e);
                            alert("Erro de conexão com o servidor.");
                        }
                    }
                };
            } else {
                // Se NÃO for admin, esconde o botão da tela
                btnExcluir.style.display = 'none';
            }
        }
    }

    const form = document.getElementById("formulario");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("id", id);
        formData.append("item", document.getElementById("item").value);
        formData.append("quantidade", document.getElementById("quantidade").value);
        
        const destinoSelecionado = document.querySelector('input[name="destino"]:checked');
        formData.append("destino", destinoSelecionado ? destinoSelecionado.value : "");
        
        formData.append("projeto", document.getElementById("projeto").value);
        formData.append("observacoes", document.getElementById("observacoes").value);

        // Só anexa o arquivo se o usuário selecionou um NOVO
        const arquivoInput = document.getElementById("arquivo");
        if (arquivoInput.files.length > 0) {
            formData.append("arquivo", arquivoInput.files[0]);
        }

        try {
            const response = await fetch("http://localhost:3000/api/atualizar", {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                alert("Material atualizado com sucesso!");
                window.location.href = "../main-pages/home/home-material.html";
            } else {
                const erro = await response.json();
                alert("Erro ao atualizar: " + (erro.error || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});