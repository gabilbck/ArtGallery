// Function to toggle between profile tabs
function togglePerfilTab(tabId, button) {
   const tabs = document.querySelectorAll(".perfil-aba-conteudo");
   tabs.forEach((tab) => {
      tab.style.display = "none";
   });

   const buttons = document.querySelectorAll(".perfil-switch-container button");
   buttons.forEach((btn) => {
      btn.classList.remove("ativo");
   });

   document.getElementById(tabId).style.display = "block";
   button.classList.add("ativo");

   const slider = document.querySelector(".perfil-switch-slider");
   slider.style.left = button.offsetLeft + "px";
}
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById("perfil-colecoes").style.display = "block";
   document.getElementById("perfil-favoritos").style.display = "none";
});
