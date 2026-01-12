document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID não encontrado!");
        window.location.href = "../main-pages/home/home-material.html";
        return;
    }

    // A. ORDEM DE CARREGAMENTO CORRIGIDA: 
    // Primeiro carrega a lista de projetos para preencher o <select>
    await carregarListaDeProjetos();

    // B. Depois carrega os dados do material para preencher os campos (e selecionar o projeto correto)
    await carregarDadosDoMaterial(id);


    // --- FUNÇÕES AUXILIARES ---

    async function carregarListaDeProjetos() {
        try {
            const resProj = await fetch("http://localhost:3000/api/projetos");
            const projetos = await resProj.json();
            const select = document.getElementById("projeto");
            
            // Limpa e adiciona opção padrão
            select.innerHTML = '<option value="" selected>Sem projeto vinculado</option>';
    
            projetos.forEach(proj => {
                const option = document.createElement("option");
                option.value = proj.id; 
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
                document.getElementById("item").value = material.nome_item;
                document.getElementById("quantidade").value = material.quantidade || 1;
                
                // Marca o radio button correto
                if (material.destino) {
                    const radio = document.querySelector(`input[name="destino"][value="${material.destino.toLowerCase()}"]`);
                    if (radio) radio.checked = true;
                }
    
                // Preenche projeto e observações
                // NOTA: Como a lista de projetos já foi carregada no passo A, definir o value aqui funcionará.
                const selectProjeto = document.getElementById("projeto");
                if (material.projeto) {
                    selectProjeto.value = material.projeto;
                } else {
                    selectProjeto.value = "";
                }

                document.getElementById("observacoes").value = material.observacoes || "";
                
                // Preview do arquivo
                const previewContainer = document.getElementById('preview-container');
                if (material.arquivo_nome) {
                    previewContainer.innerHTML = '';
                    
                    const nomeArquivo = document.createElement('div');
                    nomeArquivo.className = 'nome-arquivo';
                    nomeArquivo.textContent = `Arquivo atual: ${material.arquivo_nome}`;
                    previewContainer.appendChild(nomeArquivo);
    
                    if (material.arquivo_tipo && material.arquivo_tipo.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = `http://localhost:3000/api/materiais/arquivo/${id}`;
                        img.className = 'imagem-preview-db';
                        previewContainer.appendChild(img);
                    }
                } else {
                    previewContainer.innerHTML = '<span class="aviso-preview">Nenhum arquivo anexado.</span>';
                }
    
            } else {
                alert("Material não encontrado.");
                window.location.href = "../main-pages/home/home-material.html";
            }
        } catch (error) {
            console.error("Erro ao buscar material:", error);
        }
    }

    // --- LÓGICA DO BOTÃO EXCLUIR (ADMIN) ---
    const perfil = localStorage.getItem("perfilUsuario");
    if (perfil === "admin") {
        const containerBotoes = document.getElementById("container-botoes");
        if (containerBotoes) {
            const btnExcluir = document.createElement("button");
            btnExcluir.type = "button";
            btnExcluir.textContent = "EXCLUIR";
            btnExcluir.className = "botao botao-excluir"; 
            
            btnExcluir.onclick = async function() {
                if (confirm("Tem certeza que deseja excluir este material?")) {
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
            containerBotoes.appendChild(btnExcluir);
        }
    }

    // --- EVENTO DE SALVAR (SUBMIT) ---
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
                alert("Erro ao atualizar.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});