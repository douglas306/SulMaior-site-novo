(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  // Entrada do hero
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('loaded')));
  setTimeout(() => body.classList.add('loaded'), 150); // garante a entrada mesmo com rAF pausado

  // Vídeo: pausa com movimento reduzido ou fora da tela
  const video = document.querySelector('.hero-video');
  if (video) {
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    else {
      video.play().catch(() => {});
      new IntersectionObserver(([e]) => { e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(video);
    }
  }

  // Entradas ao rolar, com escalonamento dentro de .stagger
  document.querySelectorAll('.stagger').forEach(group => {
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => el.style.setProperty('--d', (Math.min(i, 8) * 0.08) + 's'));
  });
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  // Topo sólido, botão flutuante e parallax
  const top = document.getElementById('topbar');
  const fab = document.querySelector('.fab');
  const hero = document.querySelector('.hero');
  const layers = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const heroH = hero ? hero.offsetHeight : 0;
    top.classList.toggle('solid', y > 40);
    if (reduce) return;
    const vh = window.innerHeight;
    layers.forEach(el => {
      const host = el.parentElement;
      const r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      // deslocamento relativo ao centro da tela
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Cards: no toque, vira com um toque e desvira com outro
  const touch = window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.flip').forEach(card => {
    card.addEventListener('click', e => {
      if (!touch || e.target.closest('a')) return;
      card.classList.toggle('on');
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { if (e.target === card) { e.preventDefault(); card.classList.toggle('on'); } }
    });
  });

  // Formulário: abre o WhatsApp com a mensagem pronta
  const form = document.getElementById('cotacao');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const linhas = [
      'Olá! Quero uma cotação.',
      `Nome: ${d.get('nome')}`,
      `Telefone: ${d.get('tel')}`,
      `Seguro de interesse: ${d.get('seg')}`
    ];
    const msg = String(d.get('msg') || '').trim();
    if (msg) linhas.push(`Mensagem: ${msg}`);
    const pdf = d.get('apolice');
    if (pdf && pdf.name) linhas.push(`Apólice atual (PDF): ${pdf.name} - envio o arquivo nesta conversa.`);
    window.open('https://wa.me/5551998582806?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
    const aviso = document.getElementById('pdfAviso');
    if (aviso && pdf && pdf.name) { aviso.hidden = false; aviso.textContent = 'No WhatsApp que abriu, toque no clipe e anexe o arquivo "' + pdf.name + '" para nos enviar a apólice.'; }
  });
})();
