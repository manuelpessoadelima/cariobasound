// Os e-mails não aparecem inteiros no HTML (robôs de spam leem o HTML cru).
// <a class="email" data-user="nome" data-domain="site.com"> vira um mailto: de verdade aqui.
for (const link of document.querySelectorAll('a.email[data-user][data-domain]')) {
  const address = link.dataset.user + '@' + link.dataset.domain;
  link.href = 'mailto:' + address;
  link.textContent = address;
}
