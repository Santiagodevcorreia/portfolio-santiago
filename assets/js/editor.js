(() => {
  'use strict';
  const published = window.PORTFOLIO;
  if (!published) return;
  const clone = value => JSON.parse(JSON.stringify(value));
  let draft;
  try { draft = JSON.parse(localStorage.getItem('portfolio-draft')) || clone(published); }
  catch { draft = clone(published); }
  if (!Array.isArray(draft.projetos)) draft.projetos = [];
  let selected = draft.projetos.length ? 0 : -1;
  const $ = id => document.getElementById(id);
  function notify(message) {
    $('message').textContent = message;
    $('message').hidden = false;
    clearTimeout(notify.timeout);
    notify.timeout = setTimeout(() => $('message').hidden = true, 4000);
  }
  function persist() {
    try { localStorage.setItem('portfolio-draft', JSON.stringify(draft)); }
    catch { notify('Não foi possível guardar o rascunho neste navegador. Descarrega o ficheiro para não perder as alterações.'); }
  }
  function listProjects() {
    const list = $('project-list');
    list.replaceChildren();
    draft.projetos.forEach((project, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-item' + (i === selected ? ' active' : '');
      const content = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = project.titulo || 'Novo projeto';
      const sub = document.createElement('small'); sub.textContent = project.categoria || 'Sem categoria';
      content.append(title, sub);
      const number = document.createElement('span'); number.className = 'project-number'; number.textContent = String(i+1).padStart(2, '0');
      button.append(content, number);
      button.addEventListener('click', () => { saveProject(false); selected = i; listProjects(); fillProject(); });
      list.append(button);
    });
  }
  const fields = {
    titulo: 'p-title', categoria: 'p-category', descricao: 'p-description', detalhes: 'p-details', icone: 'p-icon', url: 'p-url', codigo: 'p-code'
  };
  function fillProject() {
    const project = draft.projetos[selected];
    $('project-form').hidden = !project;
    if (!project) return;
    for (const [key, id] of Object.entries(fields)) $(id).value = project[key] || '';
    $('p-tech').value = (project.tecnologias || []).join(', ');
  }
  function saveProject(showMessage = true) {
    if (selected < 0 || !draft.projetos[selected]) return true;
    const title = $('p-title').value.trim();
    if (!title && showMessage) { notify('Escreve o nome do projeto.'); $('p-title').focus(); return false; }
    for (const id of ['p-url', 'p-code']) {
      const value = $(id).value.trim();
      if (value && !/^https?:\/\//i.test(value)) {
        if (showMessage) { notify('Os links devem começar por https:// ou http://'); $(id).focus(); }
        return false;
      }
    }
    const project = draft.projetos[selected];
    for (const [key, id] of Object.entries(fields)) project[key] = $(id).value.trim();
    project.tecnologias = $('p-tech').value.split(',').map(t => t.trim()).filter(Boolean);
    persist();
    listProjects();
    if (showMessage) notify('Projeto guardado! Descarrega o ficheiro para publicares as alterações.');
    return true;
  }
  $('project-form').addEventListener('submit', event => { event.preventDefault(); saveProject(true); });
  $('add-project').addEventListener('click', () => {
    if (!saveProject(false)) return;
    draft.projetos.push({titulo:'Novo projeto',categoria:'Projeto escolar',descricao:'',detalhes:'',tecnologias:[],icone:'outro',url:'',codigo:''});
    selected = draft.projetos.length - 1;
    persist(); listProjects(); fillProject(); $('p-title').focus();
    notify('Projeto criado. Completa os campos e guarda.');
  });
  $('delete-project').addEventListener('click', () => {
    if (selected < 0 || !window.confirm('Tens a certeza de que queres eliminar este projeto do rascunho?')) return;
    draft.projetos.splice(selected, 1);
    selected = Math.min(selected, draft.projetos.length-1);
    persist(); listProjects(); fillProject(); notify('Projeto eliminado do rascunho.');
  });
  function move(offset) {
    if (selected < 0 || !saveProject(false)) return;
    const next = selected + offset;
    if (next < 0 || next >= draft.projetos.length) return;
    [draft.projetos[selected], draft.projetos[next]] = [draft.projetos[next], draft.projetos[selected]];
    selected = next; persist(); listProjects(); fillProject();
  }
  $('move-up').addEventListener('click', () => move(-1));
  $('move-down').addEventListener('click', () => move(1));

  const profileFields = {
    nome:'u-name',titulo:'u-title',apresentacao:'u-intro',perfil:'u-about',email:'u-email',github:'u-github'
  };
  function fillProfile() {
    for (const [key, id] of Object.entries(profileFields)) $(id).value = draft[key] || '';
  }
  function saveProfile(showMessage=true) {
    const gh = $('u-github').value.trim();
    if (gh && !/^https:\/\//i.test(gh)) {
      if (showMessage) notify('O link do GitHub deve começar por https://');
      return false;
    }
    for (const [key,id] of Object.entries(profileFields)) draft[key] = $(id).value.trim();
    persist();
    if (showMessage) notify('Perfil guardado! Descarrega o ficheiro para publicares as alterações.');
    return true;
  }
  $('profile-form').addEventListener('submit', event => {event.preventDefault();saveProfile(true);});
  function showPanel(name) {
    if (name === 'profile') saveProject(false);
    else saveProfile(false);
    $('projects-panel').hidden = name !== 'projects';
    $('profile-panel').hidden = name !== 'profile';
    $('nav-projects').classList.toggle('active',name==='projects');
    $('nav-profile').classList.toggle('active',name==='profile');
    if (name === 'projects') { listProjects(); fillProject(); }
    else fillProfile();
  }
  $('nav-projects').addEventListener('click',()=>showPanel('projects'));
  $('nav-profile').addEventListener('click',()=>showPanel('profile'));
  function exportData() {
    if (!$('projects-panel').hidden && !saveProject(true)) return;
    if (!$('profile-panel').hidden && !saveProfile(true)) return;
    const content = '// Dados editados com editar.html\nwindow.PORTFOLIO = ' + JSON.stringify(draft, null, 2).replace(/</g,'\\u003c') + ';\n';
    const blob = new Blob([content], {type:'text/javascript;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download='dados.js'; document.body.append(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify('Ficheiro dados.js descarregado. Substitui o ficheiro antigo na pasta e no GitHub.');
  }
  $('export-side').addEventListener('click',exportData);
  $('export-bottom').addEventListener('click',exportData);
  $('reset').addEventListener('click',() => {
    if (!window.confirm('Queres perder o rascunho e repor os dados do ficheiro publicado?')) return;
    draft = clone(published); selected=draft.projetos.length?0:-1;
    localStorage.removeItem('portfolio-draft'); listProjects(); fillProject(); fillProfile(); notify('Dados originais restaurados.');
  });
  listProjects(); fillProject(); fillProfile();
})();

