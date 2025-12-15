document.addEventListener("DOMContentLoaded", () => {
    // 1. Captura os parâmetros da URL (vindos da página anterior)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nome = params.get("nome");
    const setor = params.get("setor");
    const obs = params.get("obs");
    const preco = params.get("preco");

    // 2. Preenche o formulário com os dados existentes
    if (id) {
        document.getElementById("projeto-id").value = id;
        document.getElementById("item").value = nome || "";
        document.getElementById("observacoes").value = obs !== "-" ? obs : ""; // Remove o traço se vier da tela anterior
        document.getElementById("preco").value = preco || "";

        // Marca o botão de rádio correto (Robótica ou Manutenção)
        if (setor === "robotica" || setor === "manutencao") {
            document.getElementById(setor).checked = true;
        }
    } else {
        alert("Erro: ID do projeto não encontrado.");
        window.location.href = "../../index.html"; // Volta se não tiver ID
    }

    // 3. Lógica para Salvar (Enviar para o backend)
    const form = document.getElementById("formulario-editar");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const idAtual = document.getElementById("projeto-id").value;
        const nomeAtual = document.getElementById("item").value;
        const obsAtual = document.getElementById("observacoes").value;
        const precoAtual = document.getElementById("preco").value;
        const setorAtual = document.querySelector('input[name="destino"]:checked')?.value;

        if (!nomeAtual || !setorAtual) {
            alert("Nome e Setor são obrigatórios.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/atualizar-projeto", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: idAtual,
                    item: nomeAtual,
                    destino: setorAtual,
                    observacoes: obsAtual
                    // Nota: O servidor atual (server.js) não está preparado para salvar o preço no banco ainda,
                    // mas enviaremos as outras infos normalmente.
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Redireciona de volta para a tela de confirmação/detalhes com os dados novos
                const novosParams = new URLSearchParams({
                    id: idAtual,
                    nome: nomeAtual,
                    setor: setorAtual,
                    obs: obsAtual || "-",
                    preco: precoAtual || "0,00"
                });
                
                // Você pode direcionar para projeto-cadastrado.html ou projeto-editado.html se preferir
                window.location.href = `projeto-cadastrado.html?${novosParams.toString()}`;
            } else {
                alert("Erro ao atualizar: " + (result.error || "Desconhecido"));
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão com o servidor.");
        }
    });
});