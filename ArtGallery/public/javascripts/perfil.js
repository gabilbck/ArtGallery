function toggleTab(tabId, btn) {
   // Esconder todos os conteúdos
   document
      .querySelectorAll(".tab-content")
      .forEach((div) => div.classList.add("hidden"));

   // Remover 'active' de todos os botões
   document
      .querySelectorAll(".tab-button")
      .forEach((button) => button.classList.remove("active"));

   // Mostrar a aba correspondente
   document.getElementById(tabId).classList.remove("hidden");

   // Ativar o botão clicado
   btn.classList.add("active");
}
