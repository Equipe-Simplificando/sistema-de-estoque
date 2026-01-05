document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("ID do projeto não encontrado.");
        window.location.href = "../../main-pages/home/home-projeto.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/projetos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar projeto");
        
        const projeto = await response.json();

        document.getElementById("item").value = projeto.nome_projeto;
        document.getElementById("destino").value = projeto.setor;
        document.getElementById("observacoes").value = projeto.observacoes;

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar dados do projeto.");
    }

    // --- LÓGICA DO BOTÃO EXCLUIR ---
    const perfil = localStorage.getItem("perfilUsuario");
    if (perfil === "admin") {
        const form = document.getElementById("form-editar"); // Garanta que seu form tem esse ID ou use querySelector("form")
        
        // Cria Container para botões ficarem alinhados (opcional, mas fica melhor)
        const divBotoes = document.createElement("div");
        divBotoes.style.display = "flex";
        divBotoes.style.gap = "10px";
        divBotoes.style.flexDirection = "column";

        // Cria o botão de excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.textContent = "EXCLUIR PROJETO";
        btnExcluir.style.backgroundColor = "#d32f2f";
        btnExcluir.style.color = "white";
        btnExcluir.style.marginTop = "10px";
        btnExcluir.className = "botao-cadastro"; // Reaproveita estilo css
        
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

        // Adiciona ao final do form
        // Se o form já tiver o botão "Salvar", movemos ele para dentro da div ou apenas damos append
        if(form) {
            form.appendChild(btnExcluir);
        }
    }
    // -------------------------------

    const form = document.getElementById("form-editar");
    if(form){
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const dados = {
                id: id,
                item: document.getElementById("item").value,
                destino: document.getElementById("destino").value,
                observacoes: document.getElementById("observacoes").value
            };

            try {
                const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    window.location.href = "projeto-editado.html";
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