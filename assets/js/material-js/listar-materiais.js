// Ao carregar a página, busca os dados
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/materiais");
    const materiais = await response.json();

    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = ""; // Limpa antes de preencher

    materiais.forEach((mat) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                        <td>${mat.id}</td>
                        <td>${mat.nome_item}</td>
                        <td>${mat.destino}</td>
                        <td>${mat.projeto || "-"}</td>
                    `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao carregar estoque. O servidor está rodando?");
  }
});
