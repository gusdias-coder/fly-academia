(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = null;
  let booking = null;
  $('#modalityCards').innerHTML = Object.entries(Fly.modalities).map(([name, data], i) => `
    <div class="col-12 ${i < 4 ? 'col-lg-6' : ''}"><article class="modality">
      <span class="modality-icon">${Fly.icon(data.icon)}</span>
      <h3>${name}</h3><p>${data.description}</p>
      <a href="horarios.html?modalidade=${encodeURIComponent(name)}">Ver horários ${Fly.icon('arrow')}</a>
    </article></div>`).join('');

  const params = new URLSearchParams(location.search);
  const candidate = { name: params.get('modalidade'), date: params.get('data'), time: params.get('hora') };
  if (Object.hasOwn(Fly.modalities, candidate.name || '')) $('#interest').value = candidate.name;
  const selectionText = s => `${Fly.formatDate(s.date)} às ${s.time} (Porto Alegre)`;
  function showSelection() {
    $('#chosen').textContent = selected ? `Horário desejado: ${selectionText(selected)}. Sujeito à confirmação.` : '';
    $('#clearSelection').hidden = !selected;
  }
  if (Fly.validSelection(candidate.date, candidate.time, candidate.name)) { selected = candidate; showSelection(); }
  else if (params.has('data') || params.has('hora')) $('#chosen').textContent = 'Este horário não está disponível para solicitação. Escolha uma nova aula na página de horários ou combine com a equipe.';
  $('#interest').addEventListener('change', () => { selected = null; showSelection(); });
  $('#clearSelection').onclick = () => { selected = null; showSelection(); $('#interest').focus(); };

  function billing(annual) {
    $('#monthly').setAttribute('aria-pressed', String(!annual));
    $('#annual').setAttribute('aria-pressed', String(annual));
    $('#monthly').classList.toggle('active', !annual);
    $('#annual').classList.toggle('active', annual);
    $('#planTitle').textContent = annual ? 'Plano anual recorrente' : 'Plano mensal';
    $('#price').textContent = annual ? 'R$ 99' : 'R$ 149';
    $('#contract').textContent = annual ? '12 parcelas de R$ 99 · total R$ 1.188.' : 'Pagamento mensal.';
    $('#saving').textContent = annual ? 'Economize R$ 600 em 12 meses em relação ao mensal.' : 'Escolha o ritmo da sua rotina.';
    if (!reduced.matches && Element.prototype.animate) $('#price').animate([{ opacity: 0.3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
  }
  $('#monthly').onclick = () => billing(false);
  $('#annual').onclick = () => billing(true);
  const plans = [...document.querySelectorAll('.plan')];
  $('.plan-dots').innerHTML = plans.map((p, i) => `<button aria-label="Ver plano ${i + 1}" aria-current="${i === 0}" data-plan="${i}"><span></span></button>`).join('');
  document.querySelectorAll('[data-plan]').forEach(button => button.onclick = () => {
    const list = $('#plans');
    list.scrollTo({ left: list.scrollLeft + plans[Number(button.dataset.plan)].getBoundingClientRect().left - list.getBoundingClientRect().left, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  $('#plans').addEventListener('scroll', () => {
    const left = $('#plans').getBoundingClientRect().left;
    const nearest = plans.reduce((best, p, i) => Math.abs(p.getBoundingClientRect().left - left) < Math.abs(plans[best].getBoundingClientRect().left - left) ? i : best, 0);
    document.querySelectorAll('[data-plan]').forEach((b, i) => b.setAttribute('aria-current', String(i === nearest)));
  }, { passive: true });

  $('#bookingForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#name').value.trim();
    const phone = $('#phone').value.replace(/\D/g, '');
    const errors = {
      name: !/\p{L}.*\p{L}/u.test(name) ? 'Digite seu nome com pelo menos duas letras.' : '',
      phone: !/^(?:55)?[1-9]{2}\d{8,9}$/.test(phone) ? 'Informe seu telefone com DDD (10 ou 11 dígitos).' : ''
    };
    Object.entries(errors).forEach(([field, message]) => {
      $('#' + field + 'Error').textContent = message;
      $('#' + field).setAttribute('aria-invalid', String(Boolean(message)));
    });
    const invalid = Object.keys(errors).find(k => errors[k]);
    if (invalid) { $('#' + invalid).focus(); return; }
    if (selected && !Fly.validSelection(selected.date, selected.time, selected.name)) {
      selected = null; showSelection();
      $('#chosen').textContent = 'O horário selecionado já passou. Escolha outra aula ou envie uma solicitação com horário a combinar.';
      $('#chosen').focus(); return;
    }
    booking = { name, phone, interest: $('#interest').value, selected };
    const timing = selected ? selectionText(selected) : 'Horário a combinar com a equipe';
    $('#summary').textContent = `${name}, modalidade: ${booking.interest}. ${timing}.`;
    const message = `Olá! Sou ${name}. Meu WhatsApp é ${phone}. Quero solicitar uma aula experimental de ${booking.interest}. ${timing}. Podem confirmar disponibilidade e condições?`;
    $('#sendRequest').href = 'https://wa.me/5551996010890?text=' + encodeURIComponent(message);
    $('#calendar').hidden = !selected;
    $('#calendarNote').textContent = selected ? 'Evento provisório, com duração estimada de 1 hora. Aguarde a confirmação da academia.' : 'Escolha uma aula na página de horários para adicionar um horário provisório ao calendário.';
    $('#confirmation').showModal();
  });
  $('#closeConfirmation').onclick = () => $('#confirmation').close();
  const stamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  $('#calendar').onclick = () => {
    if (!booking?.selected) return;
    const { date, time, name } = booking.selected;
    const start = Fly.instant(date, time);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fly Academia//Solicitacao//PT-BR', 'BEGIN:VEVENT',
      `UID:${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2)}@fly-tarrago`,
      `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 3600000))}`,
      `SUMMARY:Provisório - ${name} na Fly Tarragó`, 'DESCRIPTION:Solicitação sujeita à confirmação pela academia.',
      'LOCATION:Rua Tenente Ary Tarragó 1942 - Porto Alegre', 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR', ''];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'fly-aula-provisoria.ics'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
})();
