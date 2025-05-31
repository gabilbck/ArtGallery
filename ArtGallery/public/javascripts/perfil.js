  function togglePerfilTab(tabId, btn) {
    const container = btn.parentElement; // .perfil-switch-container
    const buttons = container.querySelectorAll('button');
    const slider = container.querySelector('.perfil-switch-slider');

    // Remove ativo de todos os botões
    buttons.forEach(b => b.classList.remove('ativo'));

    // Adiciona ativo no botão clicado
    btn.classList.add('ativo');

    // Pega índice do botão clicado para posicionar o slider
    const index = Array.from(buttons).indexOf(btn);

    // Move slider para o botão clicado
    slider.style.left = `${index * 50}%`;

    // Aqui você pode adicionar código para mostrar a aba/tab correta
    // Exemplo simples (se tiver os conteúdos das abas):
    /*
    document.querySelectorAll('.perfil-tab').forEach(tab => {
      tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
    */
  }