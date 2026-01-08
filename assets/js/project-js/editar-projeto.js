document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID do projeto não encontrado.");
        window.location.href = "../../main-pages/home/home-projeto.html";
        return;
    }

    // Input hidden para armazenar o ID se necessário, mas já temos na variável 'id'
    const inputId = document.getElementById("id-projeto");
    if(inputId) inputId.value = id;

    try {
        const response = await fetch(`http://localhost:3000/api/projetos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar projeto");
        
        const projeto = await response.json();

        // Preenche Nome e Observações
        document.getElementById("item").value = projeto.nome_projeto || "";
        document.getElementById("observacoes").value = projeto.observacoes || "";
        
        // Preenche Preço (se existir)
        const campoPreco = document.getElementById("preco");
        if(campoPreco) {
            campoPreco.value = projeto.preco ? projeto.preco : "";
        }

        // CORREÇÃO: Preenche Radio Button (Setor)
        // O HTML usa name="destino" com values "robotica" e "manutencao"
        if (projeto.setor) {
            const radio = document.querySelector(`input[name="destino"][value="${projeto.setor.toLowerCase()}"]`);
            if (radio) radio.checked = true;
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar dados do projeto. Verifique o console.");
    }

    // --- LÓGICA DO BOTÃO EXCLUIR (ADMIN) ---
    const perfil = localStorage.getItem("perfilUsuario");
    if (perfil === "admin") {
        const form = document.querySelector(".formulario");
        const grupoAcoes = document.querySelector(".grupo-acoes");
        
        // Cria o botão de excluir se ainda não existir
        if (!document.getElementById("btn-excluir-dinamico")) {
            const btnExcluir = document.createElement("button");
            btnExcluir.id = "btn-excluir-dinamico";
            btnExcluir.type = "button";
            btnExcluir.textContent = "EXCLUIR PROJETO";
            btnExcluir.className = "botao"; // Mesma classe do botão salvar
            btnExcluir.style.backgroundColor = "#d32f2f"; // Vermelho
            btnExcluir.style.boxShadow = "inset 0 -4px 0 1px #b71c1c"; // Sombra vermelha escura
            btnExcluir.style.marginTop = "1rem";
            
            btnExcluir.onclick = async function() {
                if (confirm("ATENÇÃO: Excluir este projeto irá desvincular todos os materiais associados a ele. Continuar?")) {
                    try {
                        const res = await fetch(`http://localhost:3000/api/deletar-projeto/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert("Projeto excluído com sucesso!");
                            window.location.href = "../../main-pages/home/home-projeto.html";
                        } else {
                            alert("Erro ao excluir projeto.");
                        }
                    } catch (e) {
                        console.error(e);
                        alert("Erro de conexão.");
                    }
                }
            };

            // Adiciona abaixo do botão salvar
            if(grupoAcoes) {
                grupoAcoes.appendChild(btnExcluir);
            }
        }
    }
    // ---------------------------------------

    const form = document.getElementById("formulario"); // ID corrigido conforme HTML fornecido
    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // CORREÇÃO: Captura valor do radio selecionado
            const radioSelecionado = document.querySelector('input[name="destino"]:checked');
            const setorValor = radioSelecionado ? radioSelecionado.value : "";

            const dados = {
                id: id,
                item: document.getElementById("item").value,
                destino: setorValor, // Passa o valor do radio button
                observacoes: document.getElementById("observacoes").value,
                preco: document.getElementById("preco").value // Adiciona preço
            };

            try {
                const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    // Redireciona ou avisa sucesso
                    alert("Projeto atualizado com sucesso!");
                    window.location.href = "../../main-pages/home/home-projeto.html";
                } else {
                    alert("Erro ao atualizar projeto.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro de conexão.");
            }
        });
    }
});