const API_BASE = `http://${window.location.hostname}:3000`;

document.addEventListener("DOMContentLoaded", async () => {
    const perfil = localStorage.getItem("perfilUsuario"); 
    const ehAdmin = (perfil === "admin");

    try {
       
        const response = await fetch(`${API_BASE}/api/materiais`);
        const materiais = await response.json();
  
        const tbody = document.getElementById("tabela-corpo");
        tbody.innerHTML = ""; 
  
        materiais.forEach((mat) => {
            const tr = document.createElement("tr");
  
            tr.addEventListener("click", () => {
                window.location.href = `../../pages/material-pages/editar-material.html?id=${mat.id}`;
            });
            
            let botaoExcluirHTML = "";
            if (ehAdmin) {
                botaoExcluirHTML = `
                    <button class="btn-excluir-tabela" onclick="deletarMaterial(event, ${mat.id})" title="Excluir">
                        🗑️
                    </button>
                `;
            }

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

async function deletarMaterial(event, id) {
    event.stopPropagation(); 

    if(!confirm("Tem certeza que deseja excluir este material?")) return;

    try {
        const response = await fetch(`${API_BASE}/api/deletar/${id}`, {
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