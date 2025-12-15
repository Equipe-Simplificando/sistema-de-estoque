const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const nome = params.get("nome");
const destino = params.get("destino");
const projeto = params.get("projeto");
const obs = params.get("obs");
const codigoParaQRCode = params.get("cod") || id || "ERRO";

if (id) document.getElementById("view_id").innerText = id;
if (nome) document.getElementById("view_nome").innerText = nome;

if (destino) {
  document.getElementById("view_destino").innerText =
    destino.charAt(0).toUpperCase() + destino.slice(1);
} else {
  document.getElementById("view_destino").innerText = "-";
}

document.getElementById("view_projeto").innerText =
  projeto && projeto !== "null" ? projeto : "-";

// CORREÇÃO: Agora o ID view_obs existe no HTML acima
document.getElementById("view_obs").innerText =
  obs && obs !== "null" ? obs : "Sem observações.";

if (id) {
  // Limpa QR Code anterior se houver
  document.getElementById("qrcode").innerHTML = "";

  new QRCode(document.getElementById("qrcode"), {
    text: codigoParaQRCode,
    width: 128, // Aumentei um pouco para melhor leitura na impressão
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

// Lógica do Botão EDITAR
document.getElementById("btn-editar").addEventListener("click", () => {
  const paramsEdit = new URLSearchParams({
    id: id,
    nome: nome,
    destino: destino,
    projeto: projeto,
    obs: obs,
  });
  window.location.href = `editar-material.html?${paramsEdit.toString()}`;
});
