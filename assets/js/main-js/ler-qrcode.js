// Configuração do scanner quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    
    // Função que roda quando um QR Code é lido com sucesso
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Scan result: ${decodedText}`, decodedResult);
        
        // Parar o scanner após a leitura
        html5QrcodeScanner.clear().then(() => {
            // Tenta verificar se o texto é um número (ID) ou um nome
            // Redireciona para a página de edição (que funciona como visualização detalhada)
            // Se o QR code for apenas o ID (ex: "1", "2"), vamos direto.
            // Se for um JSON ou texto, você pode precisar ajustar aqui.
            
            // Exemplo: Redireciona para Editar Material passando o ID lido
            // Ajuste o caminho se necessário para corresponder à sua estrutura
            window.location.href = `../../material-pages/editar-material.html?id=${decodedText}`;
        }).catch(error => {
            console.error("Erro ao parar scanner", error);
        });
    }

    function onScanFailure(error) {
        // Apenas loga erros de leitura (muito comuns enquanto a câmera procura)
        // console.warn(`Code scan error = ${error}`);
    }

    // Inicializa o Scanner
    // 'reader' é o ID da div que criamos no HTML
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        /* verbose= */ false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});