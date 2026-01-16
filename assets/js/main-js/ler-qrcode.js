document.addEventListener("DOMContentLoaded", () => {
    
    function onScanSuccess(decodedText, decodedResult) {
        const idLimpo = parseInt(decodedText.replace(/\D/g, ""), 10);

        if (!idLimpo) {
            alert("QR Code inválido: " + decodedText);
            return;
        }

        html5QrCode.stop().then(() => {
            window.location.href = `../../material-pages/perfil-material.html?id=${idLimpo}`;
        }).catch(err => {
            console.error(err);
        });
    }

    const html5QrCode = new Html5Qrcode("reader");

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(err => {
        console.error(err);
        html5QrCode.start(
            { facingMode: "user" }, 
            config, 
            onScanSuccess
        );
    });
});