// Configuração do scanner quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    
    // Função que roda quando um QR Code é lido com sucesso
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Texto lido: ${decodedText}`, decodedResult);
        
        // CORREÇÃO: Remove letras e zeros à esquerda para ficar apenas o ID numérico
        // Ex: Transforma "MAT-0001" em 1, ou "MAT-0025" em 25
        const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);

        if (!idLimpo) {
            alert("QR Code inválido ou sem números identificáveis: " + decodedText);
            // Reinicia o scanner para tentar de novo sem recarregar a página
            return;
        }

        // Parar o scanner após a leitura e redirecionar
        html5QrcodeScanner.clear().then(() => {
            // Redireciona para a tela de edição passando apenas o ID numérico
            window.location.href = `../../material-pages/editar-material.html?id=${idLimpo}`;
        }).catch(error => {
            console.error("Erro ao parar scanner", error);
        });
    }

    function onScanFailure(error) {
        // Apenas loga erros de leitura (comuns enquanto a câmera procura o foco)
        // console.warn(`Code scan error = ${error}`);
    }

    // Inicializa o Scanner
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", // ID da div no HTML
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        /* verbose= */ false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});