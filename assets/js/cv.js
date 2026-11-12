(() => {
  'use strict';
  const d = window.PORTFOLIO; if (!d) return;
  const $ = id => document.getElementById(id);
  const text = (tag, value, className) => {const e=document.createElement(tag);e.textContent=value||'';if(className)e.className=className;return e;};
  $('cv-name').textContent=d.nome||'';
  $('cv-title').textContent=d.titulo||'';
  $('cv-email').textContent=d.email||'';
  $('cv-profile').textContent=d.perfil||'';
  if(d.github && /^https:\/\//i.test(d.github)) { $('cv-github').textContent=d.github; $('cv-github').hidden=false; }
  for(const s of d.tecnicas||[]) $('cv-tech').append(text('li',s));
  for(const s of d.pessoais||[]) $('cv-personal').append(text('li',s));
  for(const l of d.idiomas||[]) $('cv-languages').append(text('li',l.nome+' — '+l.nivel));
  for(const f of d.formacao||[]){const a=text('article','');a.append(text('h3',f.escola),text('small',f.periodo),text('p',f.descricao));$('cv-education').append(a);}
  for(const p of d.projetos||[]){const a=text('article','');a.append(text('h3',p.titulo),text('p',p.descricao,'project-desc'));$('cv-projects').append(a);}
})();

