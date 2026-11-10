/* Grade recorrente fornecida pela unidade. Todos os horários são de Porto Alegre. */
window.Fly = (() => {
  const zone = 'America/Sao_Paulo';
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const modalities = {
    Pilates: { description: 'Controle, consciência corporal e movimento.', icon: 'balance' },
    Funcional: { description: 'Movimentos variados para a sua rotina.', icon: 'activity' },
    GAP: { description: 'Foco em glúteos, abdômen e pernas.', icon: 'target' },
    Ritmos: { description: 'Música e movimento para renovar a energia.', icon: 'music' },
    Alongamento: { description: 'Uma pausa para alongar e cuidar do corpo.', icon: 'sun' }
  };
  const schedule = [[], [['08:30', 'Pilates'], ['19:00', 'GAP'], ['19:30', 'Pilates']],
    [['08:30', 'Funcional'], ['19:00', 'Funcional'], ['19:30', 'Ritmos']],
    [['08:30', 'Pilates'], ['19:00', 'GAP'], ['19:30', 'Pilates']],
    [['08:30', 'Funcional'], ['19:00', 'Funcional'], ['19:30', 'Ritmos']], [['08:30', 'Alongamento']], []];
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 10h8m-8 4h5"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    dumbbell: '<path d="M8 12h8M3 9v6m4-9v12m10-12v12m4-9v6M3 12h4m10 0h4"/>',
    balance: '<path d="M4 17h16M12 4v13M5 9h14m-14 0-3 5h6L5 9Zm14 0-3 5h6l-3-5Z"/>',
    activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    music: '<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.arrow}</svg>`;
  function today(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const dateObject = date => new Date(`${date}T12:00:00Z`);
  const dayOf = date => dateObject(date).getUTCDay();
  function addDays(date, count) {
    const d = dateObject(date);
    d.setUTCDate(d.getUTCDate() + count);
    return d.toISOString().slice(0, 10);
  }
  const instant = (date, time) => new Date(`${date}T${time}:00-03:00`);
  const formatDate = (date, options = { weekday: 'long', day: 'numeric', month: 'long' }) => new Intl.DateTimeFormat('pt-BR', { timeZone: zone, ...options }).format(dateObject(date));
  function validSelection(date, time, name, now = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return false;
    const d = dateObject(date);
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== date) return false;
    return schedule[dayOf(date)].some(([t, n]) => t === time && n === name) && instant(date, time) > now && date <= addDays(today(now), 90);
  }
  return { zone, days, modalities, schedule, icon, today, dayOf, addDays, instant, formatDate, validSelection };
})();
