// Ao carregar a página, busca os dados
document.addEventListener("DOMContentLoaded", async () => {
    // Verifica o perfil salvo no login
    const perfil = localStorage.getItem("perfilUsuario"); 
    const ehAdmin = (perfil === "admin");

    try {
        const response = await fetch("http://localhost:3000/api/materiais");
        const materiais = await response.json();
  
        const tbody = document.getElementById("tabela-corpo");
        // Se houver cabeçalho na tabela (thead), seria bom adicionar uma coluna extra lá também visualmente,
        // mas aqui focaremos no corpo.
        tbody.innerHTML = ""; 
  
        materiais.forEach((mat) => {
            const tr = document.createElement("tr");
  
            // Evento de clique na linha para EDITAR
            tr.addEventListener("click", () => {
                window.location.href = `../../pages/material-pages/editar-material.html?id=${mat.id}`;
            });
            
            // Cria o botão de excluir APENAS se for ADMIN
            let botaoExcluirHTML = "";
            if (ehAdmin) {
                botaoExcluirHTML = `
                    <button class="btn-excluir-tabela" onclick="deletarMaterial(event, ${mat.id})" title="Excluir">
                        🗑️
                    </button>
                `;
            }

            // Monta o HTML da linha
            // Adicionei um style inline básico no botão para garantir visibilidade
            tr.innerHTML = `
                <td>${mat.id}</td>
                <td>${mat.nome_item}</td>
                <td>${mat.destino}</td>
                <td>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${mat.projeto || "-"}</span>
                        ${botaoExcluirHTML}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar estoque. O servidor está rodando?");
    }
});

// Função de deletar (fora do loop)
async function deletarMaterial(event, id) {
    // Impede que o clique no botão abra a edição da linha
    event.stopPropagation();

    if(!confirm("Tem certeza que deseja excluir este material?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/deletar/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Material excluído com sucesso!");
            location.reload();
        } else {
            alert("Erro ao excluir.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão.");
    }
}