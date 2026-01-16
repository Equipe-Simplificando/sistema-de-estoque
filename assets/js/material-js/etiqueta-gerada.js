document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nome = params.get("nome");
    const destino = params.get("destino");
    const projeto = params.get("projeto");
    const obs = params.get("obs");
    const codigoParaQRCode = params.get("cod") || id || "ERRO";

    if (id) {
        const idVisual = id.includes("-") ? id : "#" + String(id).padStart(4, '0');
        document.getElementById("view_id").innerText = idVisual;
    }

    if (nome) document.getElementById("view_nome").innerText = nome;

    if (destino) {
        document.getElementById("view_destino").innerText =
            destino.charAt(0).toUpperCase() + destino.slice(1);
    } else {
        document.getElementById("view_destino").innerText = "-";
    }

    document.getElementById("view_projeto").innerText =
        (projeto && projeto !== "null" && projeto !== "") ? projeto : "-";

    document.getElementById("view_obs").innerText =
        (obs && obs !== "null" && obs !== "") ? obs : "Sem observações.";

    if (codigoParaQRCode) {
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = ""; 

        new QRCode(qrContainer, {
            text: codigoParaQRCode,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    }

    const btnEditar = document.getElementById("btn-editar");
    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const paramsEdit = new URLSearchParams({
                id: id,
                nome: nome,
                destino: destino,
                projeto: projeto,
                obs: obs,
            });
            window.location.href = `editar-material.html?${paramsEdit.toString()}`;
        });
    }
});