// Aguarda o carregamento completo da página antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");

  // Verifica se o formulário foi encontrado para evitar erros
  if (!form) {
    console.error("Erro: Formulário não encontrado!");
    return;
  }

  // Adiciona o evento de envio ao formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede o recarregamento padrão da página
    console.log("Botão clicado, iniciando processo de cadastro...");

    // Captura os elementos do formulário
    const nomeInput = document.getElementById("item");
    const obsInput = document.getElementById("observacoes");
    const precoInput = document.getElementById("preco");
    const setorInput = document.querySelector('input[name="destino"]:checked');

    // Extrai os valores (com tratamento para valores nulos)
    const nome = nomeInput ? nomeInput.value : "";
    const obs = obsInput ? obsInput.value : "";
    const preco = precoInput ? precoInput.value : "";
    const setor = setorInput ? setorInput.value : null;

    // Validação básica extra (caso o HTML 'required' falhe)
    if (!nome || !setor) {
      alert("Por favor, preencha o Nome e escolha um Setor.");
      return;
    }

    try {
      console.log("Enviando dados para o servidor...");
      
      // Faz a requisição POST para o backend
      const response = await fetch(
        "http://localhost:3000/api/cadastrar-projeto",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Nota: O 'preco' não está sendo salvo no banco neste momento (limitação do server.js),
          // mas estamos enviando nome, setor e observações.
          body: JSON.stringify({ item: nome, destino: setor, observacoes: obs }),
        }
      );

      // Converte a resposta para JSON
      const result = await response.json();
      console.log("Resposta do servidor:", result);

      if (result.success) {
        // Prepara os parâmetros para passar para a próxima página
        const params = new URLSearchParams({
          id: result.id,
          nome: nome,
          setor: setor || "-",
          obs: obs || "-",
          preco: preco || "0,00", // Passa o preço para exibição visual
        });

        // Redireciona para a página de confirmação
        window.location.href = `projeto-cadastrado.html?${params.toString()}`;
      } else {
        alert("Erro no cadastro: " + (result.error || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão. Verifique se o servidor (server.js) está rodando.");
    }
  });
});