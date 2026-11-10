(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  let chosenDate = Fly.today();
  let weekStart = Fly.addDays(chosenDate, -((Fly.dayOf(chosenDate) + 6) % 7));
  const firstWeek = weekStart;
  const requested = new URLSearchParams(location.search).get('modalidade');
  if (Object.hasOwn(Fly.modalities, requested || '')) $('#filter').value = requested;

  function drawDays() {
    $('#weekTitle').textContent = `${Fly.formatDate(weekStart, { day: 'numeric', month: 'short' })} — ${Fly.formatDate(Fly.addDays(weekStart, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`;
    $('#previousWeek').disabled = weekStart <= firstWeek;
    $('#nextWeek').disabled = weekStart >= Fly.addDays(firstWeek, 28);
    $('#days').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const date = Fly.addDays(weekStart, i);
      const day = Fly.dayOf(date);
      return `<button class="date-button" data-date="${date}" aria-pressed="${date === chosenDate}" aria-label="${Fly.formatDate(date)}${date === Fly.today() ? ', hoje' : ''}"><span>${Fly.days[day].slice(0, 3)}</span><strong>${Number(date.slice(-2))}</strong><small>${date === Fly.today() ? 'Hoje' : Fly.schedule[day].length ? `${Fly.schedule[day].length} aulas` : 'Sem aulas'}</small></button>`;
    }).join('');
  }

  function drawClasses() {
    const modality = $('#filter').value;
    const period = $('#periodFilter').value;
    const all = Fly.schedule[Fly.dayOf(chosenDate)];
    const rows = all.filter(([time, name]) => (!modality || name === modality) && (!period || (period === 'morning' ? time < '12:00' : time >= '12:00')));
    $('#dayTitle').textContent = Fly.formatDate(chosenDate);
    $('#resultCount').textContent = `${rows.length} ${rows.length === 1 ? 'aula encontrada' : 'aulas encontradas'}`;
    $('#classList').innerHTML = rows.length ? rows.map(([time, name]) => {
      const future = Fly.instant(chosenDate, time) > new Date();
      const query = new URLSearchParams({ modalidade: name, data: chosenDate, hora: time });
      return `<article class="class-card"><div class="class-time">${Fly.icon('clock')}<time datetime="${chosenDate}T${time}:00-03:00">${time}</time><small>${time < '12:00' ? 'Manhã' : 'Noite'}</small></div><div class="class-info"><span class="class-symbol">${Fly.icon(Fly.modalities[name].icon)}</span><div><p class="eyebrow">AULA COLETIVA</p><h3>${name}</h3><p>${Fly.modalities[name].description}</p></div></div>${future ? `<a class="btn btn-lime" href="index.html?${query}#agendar" aria-label="Solicitar aula de ${name} às ${time}">Quero participar ${Fly.icon('arrow')}</a>` : '<span class="past-class">Horário encerrado</span>'}</article>`;
    }).join('') : `<div class="empty-state">${Fly.icon('calendar')}<h3>${all.length ? 'Nenhuma aula com esses filtros.' : 'Um dia para recuperar a energia.'}</h3><p>${all.length ? 'Experimente outra modalidade ou veja todos os horários deste dia.' : Fly.dayOf(chosenDate) === 6 ? 'Sem aulas coletivas no sábado. A musculação funciona das 09h às 15h.' : 'Sem aulas coletivas no domingo. Confira a programação de segunda-feira.'}</p><button class="btn btn-outline-dark" id="emptyAction">${all.length ? 'Limpar filtros' : 'Ver próximo dia com aulas'} ${Fly.icon('arrow')}</button></div>`;
    $('#emptyAction')?.addEventListener('click', () => {
      if (all.length) { $('#filter').value = ''; $('#periodFilter').value = ''; }
      else {
        do { chosenDate = Fly.addDays(chosenDate, 1); } while (!Fly.schedule[Fly.dayOf(chosenDate)].length);
        weekStart = Fly.addDays(chosenDate, -((Fly.dayOf(chosenDate) + 6) % 7));
        $('#filter').value = ''; $('#periodFilter').value = '';
        drawDays();
      }
      drawClasses();
      $('#dayTitle').focus({ preventScroll: true });
    });
  }
  $('#days').addEventListener('click', e => {
    const button = e.target.closest('[data-date]');
    if (!button) return;
    chosenDate = button.dataset.date;
    $('#days').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === button));
    drawClasses();
  });
  function changeWeek(amount) {
    weekStart = Fly.addDays(weekStart, amount * 7);
    chosenDate = Fly.addDays(chosenDate, amount * 7);
    drawDays(); drawClasses();
  }
  $('#previousWeek').onclick = () => changeWeek(-1);
  $('#nextWeek').onclick = () => changeWeek(1);
  $('#todayButton').onclick = () => {
    chosenDate = Fly.today(); weekStart = Fly.addDays(chosenDate, -((Fly.dayOf(chosenDate) + 6) % 7));
    drawDays(); drawClasses();
  };
  $('#filter').onchange = drawClasses;
  $('#periodFilter').onchange = drawClasses;
  drawDays(); drawClasses();
  addEventListener('pageshow', drawClasses);
})();
