// Links com a classe "modal-link" abrem o <dialog> cujo id está no href
// (ex.: <a href="#background"> abre <dialog id="background">)
for (const link of document.querySelectorAll('.modal-link')) {
  const dialog = document.querySelector(link.getAttribute('href'));

  link.addEventListener('click', (event) => {
    event.preventDefault(); // não pula a página até o dialog escondido
    dialog.showModal();
  });
}

for (const dialog of document.querySelectorAll('dialog.modal')) {
  // Clicar fora da caixa (no fundo escurecido) fecha o modal.
  // Esc e o botão × já fecham sozinhos, sem precisar de código.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Se alguém chegar com o link direto (site.com/#background), já abre o modal
  if (location.hash === '#' + dialog.id) {
    dialog.showModal();
  }
}
