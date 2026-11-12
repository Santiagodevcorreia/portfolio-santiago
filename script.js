(() => {
  'use strict';
  const data = window.PORTFOLIO;
  if (!data) return;
  const $ = (selector) => document.querySelector(selector);
  const addText = (tag, content, className) => {
    const el = document.createElement(tag);
    el.textContent = content == null ? '' : String(content);
    if (className) el.className = className;
    return el;
  };

  $('#hero-role').textContent = data.titulo || 'Estudante de Programação';
  $('#hero-intro').textContent = data.apresentacao || '';
  $('#perfil-texto').textContent = data.perfil || '';
  $('#project-count').textContent = String(data.projetos.length).padStart(2, '0');
  $('#year').textContent = new Date().getFullYear();

  const themeToggle = $('#theme-toggle');
  function setTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#10283b' : '#f8fbfd';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    themeToggle.querySelector('span').textContent = dark ? '☀' : '☾';
    themeToggle.querySelector('.theme-label').textContent = dark ? 'Modo claro' : 'Modo escuro';
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
  }
  setTheme(localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  const emailLink = $('#email-link');
  if (data.email) {
    emailLink.href = 'mailto:' + data.email;
  } else {
    emailLink.hidden = true;
  }
  if (data.github && /^https:\/\//i.test(data.github)) {
    const gh = $('#github-link');
    gh.href = data.github;
    gh.hidden = false;
  }

  for (const skill of data.tecnicas || []) $('#skills-technical').append(addText('span', skill, 'pill'));
  for (const skill of data.pessoais || []) $('#skills-personal').append(addText('span', skill, 'pill'));
  for (const lang of data.idiomas || []) {
    const row = addText('div', '', 'language-row');
    row.append(addText('strong', lang.nome));
    row.append(addText('span', lang.nivel));
    $('#skills-languages').append(row);
  }
  for (const f of data.formacao || []) {
    const item = addText('div', '', 'timeline-item reveal');
    item.append(addText('time', f.periodo, 'timeline-time'));
    item.append(addText('h3', f.escola));
    item.append(addText('p', f.descricao));
    $('#education-list').append(item);
  }

  const icons = {
    reciclagem: '<path d="M9 3h6l4 7"/><path d="m19 6 1 4-4 1"/><path d="M20 10l-2.2 3.8"/><path d="m21 17-3 5H9"/><path d="m12 19-3 3 2-5"/><path d="M9 22l-2-4"/><path d="m3 15-2-4 4-7h4"/><path d="m4 7 1-3 3 2"/><path d="M5 4l2 4"/>',
    livro: '<path d="M12 7v14"/><path d="M3 18.5V4.5C6.6 3.2 9.3 3.4 12 5c2.7-1.6 5.4-1.8 9-.5v14c-3.6-1.2-6.3-.9-9 1-2.7-1.9-5.4-2.2-9-1Z"/><path d="M6 9h3"/><path d="M15 9h3"/>',
    quimica: '<path d="M9 3h6"/><path d="M10 3v7l-5.5 9a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 10V3"/><path d="M8 16h8"/><circle cx="12" cy="19" r="1"/>',
    outro: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m8 10 3 2-3 2M13 15h3"/>'
  };
  function projectLink(label, url, primary) {
    const validUrl = /^https?:\/\//i.test(url || '');
    const el = document.createElement(validUrl ? 'a' : 'span');
    el.className = 'project-link ' + (primary ? 'primary' : 'secondary') + (validUrl ? '' : ' is-disabled');
    el.textContent = label + (validUrl ? ' ↗' : ' · em breve');
    if (validUrl) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.setAttribute('aria-disabled', 'true');
      el.title = 'Ainda não foi adicionado um link a este projeto';
    }
    return el;
  }
  const grid = $('#projects-grid');
  const dialog = $('#project-dialog');
  function showDetails(project) {
    $('#dialog-title').textContent = project.titulo || 'Projeto';
    $('#dialog-description').textContent = project.detalhes || project.descricao || 'Ainda não foram adicionados mais detalhes a este projeto.';
    const tech = $('#dialog-tech'); tech.replaceChildren();
    for (const tag of project.tecnologias || []) tech.append(addText('span', tag));
    const dialogLinks = $('#dialog-links'); dialogLinks.replaceChildren();
    const valid = url => /^https?:\/\//i.test(url || '');
    if (valid(project.url)) dialogLinks.append(projectLink('Ver Projeto', project.url, true));
    if (valid(project.codigo)) dialogLinks.append(projectLink('Ver Código', project.codigo, false));
    dialog.showModal();
  }
  for (const project of data.projetos || []) {
    const card = addText('article', '', 'project-card reveal');
    const cover = addText('div', '', 'project-cover ' + (icons[project.icone] ? project.icone : 'outro'));
    cover.append(addText('span', 'PROJETO ESCOLAR', 'cover-code'));
    const icon = addText('span', '', 'cover-icon');
    icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[project.icone] || icons.outro) + '</svg>';
    cover.append(icon);
    const body = addText('div', '', 'project-body');
    body.append(addText('span', project.categoria || 'Projeto', 'project-category'));
    body.append(addText('h3', project.titulo));
    body.append(addText('p', project.descricao));
    const tags = addText('div', '', 'project-tags');
    for (const tag of project.tecnologias || []) tags.append(addText('span', tag));
    body.append(tags);
    const links = addText('div', '', 'project-links');
    links.append(projectLink('Ver Projeto', project.url, true));
    links.append(projectLink('Ver Código', project.codigo, false));
    const details = document.createElement('button');
    details.type = 'button'; details.className = 'project-link details'; details.textContent = 'Ver Detalhes →';
    details.addEventListener('click', () => showDetails(project));
    links.append(details);
    body.append(links);
    card.append(cover, body);
    grid.append(card);
  }
  if (!data.projetos.length) {
    grid.append(addText('p', 'Ainda não há projetos publicados. Podes adicioná-los no editor.'));
  }
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item[open]').forEach(other => { if (other !== item) other.open = false; });
    });
  });

  const toggle = $('#menu-toggle');
  const nav = $('#mobile-nav');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    nav.hidden = isOpen;
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }));

  const elements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('visible'));
  }
})();

