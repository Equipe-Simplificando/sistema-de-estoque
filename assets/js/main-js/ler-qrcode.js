const API_BASE = `http://${window.location.hostname}:3000`;

document.addEventListener("DOMContentLoaded", () => {
    
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Texto lido: ${decodedText}`, decodedResult);
        
        const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);

        if (!idLimpo) {
            alert("QR Code inválido ou sem números identificáveis: " + decodedText);
            return;
        }

        html5QrcodeScanner.clear().then(() => {
            window.location.href = `../../material-pages/editar-material.html?id=${idLimpo}`;
        }).catch(error => {
            console.error("Erro ao parar scanner", error);
        });
    }

    function onScanFailure(error) {
        // Erros de leitura ignorados para não poluir o console
    }

    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});