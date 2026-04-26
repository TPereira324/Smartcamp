document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const user = api.requireLoggedUser();
    if (!user) return;

    const greetingName = document.getElementById('dashboard-user-name');
    const greetingText = document.getElementById('dashboard-greeting-text');
    const parcelasCount = document.getElementById('dashboard-parcelas-count');
    const tarefasCount = document.getElementById('dashboard-tarefas-count');
    const alertasCount = document.getElementById('dashboard-alertas-count');
    const parcelasContainer = document.getElementById('dashboard-parcelas-list');
    const tarefasContainer = document.getElementById('dashboard-tarefas-list');
    const monitorizacaoContainer = document.getElementById('dashboard-monitorizacao');
    const climaContainer = document.getElementById('dashboard-clima');
    const errorBox = document.getElementById('dashboard-error');

    if (greetingName) greetingName.textContent = user.nome || 'utilizador';
    if (greetingText) greetingText.textContent = 'Visão geral carregada a partir dos dados disponíveis no servidor.';

    const setError = (message) => {
        if (!errorBox) return;
        errorBox.hidden = !message;
        errorBox.textContent = message || '';
    };

    const renderEmpty = (container, message) => {
        if (!container) return;
        container.innerHTML = `<div class="card"><div style="color:var(--muted);line-height:1.6;">${message}</div></div>`;
    };

    const fetchOptional = async (path) => {
        try {
            return await api.fetchJson(path);
        } catch {
            return null;
        }
    };

    const weatherCodeToText = (code) => {
        const n = Number(code);
        if (!Number.isFinite(n)) return 'Sem descrição';
        if (n === 0) return 'Céu limpo';
        if ([1, 2, 3].includes(n)) return 'Parcialmente nublado';
        if ([45, 48].includes(n)) return 'Nevoeiro';
        if ([51, 53, 55, 56, 57].includes(n)) return 'Chuvisco';
        if ([61, 63, 65, 66, 67].includes(n)) return 'Chuva';
        if ([71, 73, 75, 77].includes(n)) return 'Neve';
        if ([80, 81, 82].includes(n)) return 'Aguaceiros';
        if ([95, 96, 99].includes(n)) return 'Trovoada';
        return 'Tempo variável';
    };

    const fetchWeatherFromOpenMeteo = async (city) => {
        const name = String(city || '').trim() || 'Lisboa';
        const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
        geoUrl.searchParams.set('name', name);
        geoUrl.searchParams.set('count', '1');
        geoUrl.searchParams.set('language', 'pt');
        geoUrl.searchParams.set('format', 'json');

        const geoRes = await fetch(geoUrl.toString());
        const geoData = await geoRes.json().catch(() => null);
        const place = geoData?.results?.[0];
        const latitude = Number(place?.latitude);
        const longitude = Number(place?.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

        const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
        forecastUrl.searchParams.set('latitude', String(latitude));
        forecastUrl.searchParams.set('longitude', String(longitude));
        forecastUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code');
        forecastUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
        forecastUrl.searchParams.set('timezone', 'auto');

        const forecastRes = await fetch(forecastUrl.toString());
        const forecastData = await forecastRes.json().catch(() => null);
        const current = forecastData?.current || null;
        const daily = forecastData?.daily || null;
        if (!current) return null;

        const cityLabel = place?.name || name;
        const tempMax = Array.isArray(daily?.temperature_2m_max) ? daily.temperature_2m_max[0] : null;
        const tempMin = Array.isArray(daily?.temperature_2m_min) ? daily.temperature_2m_min[0] : null;

        return {
            cidade: cityLabel,
            temperatura: current.temperature_2m,
            sensacao_termica: current.apparent_temperature,
            humidade: current.relative_humidity_2m,
            temp_max: tempMax,
            temp_min: tempMin,
            descricao: weatherCodeToText(current.weather_code),
            fonte: 'open-meteo',
        };
    };

    const fetchWeather = async (city) => {
        const cityName = String(city || '').trim() || 'Lisboa';
        try {
            const response = await api.fetchJson(`clima?cidade=${encodeURIComponent(cityName)}`);
            const clima = response?.data || null;
            if (clima) return clima;
        } catch { }

        try {
            return await fetchWeatherFromOpenMeteo(cityName);
        } catch {
            return null;
        }
    };

    const formatArea = (value) => {
        const amount = Number(value || 0);
        return `${amount.toFixed(2)} m²`;
    };

    const formatDate = (value) => {
        if (!value) return 'Sem data';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Sem data';
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const formatShortDateTime = (value) => {
        if (!value) return 'Sem data';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Sem data';
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const tasksStorageKey = 'cocoRootTasks';

    const readTasksStore = () => {
        try {
            const raw = localStorage.getItem(tasksStorageKey);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    };

    const writeTasksStore = (store) => {
        localStorage.setItem(tasksStorageKey, JSON.stringify(store || {}));
    };

    const normalizeText = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const getParcelaId = (parcela) => {
        const id = parcela?.id ?? parcela?.par_id ?? parcela?.parcela_id ?? parcela?.parcelaId ?? parcela?.nome;
        return String(id || '');
    };

    const getParcelaLabel = (parcela) => String(parcela?.nome || parcela?.par_nome || 'Parcela');

    const getCultivoLabel = (parcela) => {
        const cultivos = Array.isArray(parcela?.cultivos) ? parcela.cultivos : [];
        const first = cultivos[0];
        return String(first?.nome || parcela?.tipo || parcela?.cultivo || '');
    };

    const pickCultivoCategory = (cultivoName) => {
        const t = normalizeText(cultivoName);
        if (!t) return 'geral';
        const has = (...words) => words.some((w) => t.includes(normalizeText(w)));
        if (has('alface', 'couve', 'espinafre', 'rúcula', 'rucula', 'repolho')) return 'folhosas';
        if (has('tomate', 'pimento', 'pepino', 'abobrinha', 'courgette', 'beringela', 'melancia', 'melao', 'melão', 'morango')) return 'frutiferas';
        if (has('manjericão', 'manjericao', 'hortelã', 'hortela', 'salsa', 'coentros', 'alecrim', 'orégãos', 'oregãos', 'oregano', 'cebolinho')) return 'ervas';
        if (has('batata', 'cenoura', 'beterraba', 'nabo', 'rabanete')) return 'raizes';
        return 'geral';
    };

    const addDays = (date, days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + Number(days || 0));
        return d;
    };

    const startOfDay = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const endOfDay = (date) => {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    };

    const buildTaskId = () => {
        try {
            if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        } catch { }
        return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    };

    const generateTasksForParcela = (parcela, cultivoName) => {
        const parcelaId = getParcelaId(parcela);
        const parcelaNome = getParcelaLabel(parcela);
        const cultivo = String(cultivoName || '').trim();
        const category = pickCultivoCategory(cultivo);
        const baseTitle = cultivo ? ` (${cultivo})` : '';
        const today = startOfDay(new Date());

        const make = (titulo, dueDate, kind) => ({
            id: buildTaskId(),
            titulo,
            parcela_id: parcelaId,
            parcela_nome: parcelaNome,
            cultivo_nome: cultivo,
            categoria: category,
            tipo: kind || 'geral',
            estado: 'Pendente',
            data_inicio: new Date(dueDate).toISOString(),
            created_at: new Date().toISOString(),
        });

        const tasks = [
            make(`Verificar humidade e ajustar rega${baseTitle}`, today, 'rega'),
            make(`Inspecionar pragas/doenças${baseTitle}`, addDays(today, 3), 'saude'),
        ];

        if (category === 'folhosas') {
            tasks.push(make(`Verificar crescimento e desbaste${baseTitle}`, addDays(today, 2), 'maneio'));
            tasks.push(make(`Adubação leve (se necessário)${baseTitle}`, addDays(today, 7), 'nutricao'));
        } else if (category === 'frutiferas') {
            tasks.push(make(`Verificar floração/frutificação${baseTitle}`, addDays(today, 2), 'maneio'));
            tasks.push(make(`Apoiar/tutorar plantas (se aplicável)${baseTitle}`, addDays(today, 5), 'maneio'));
            tasks.push(make(`Adubação (se necessário)${baseTitle}`, addDays(today, 10), 'nutricao'));
        } else if (category === 'ervas') {
            tasks.push(make(`Colheita seletiva e limpeza${baseTitle}`, addDays(today, 4), 'maneio'));
            tasks.push(make(`Podar para estimular rebrote${baseTitle}`, addDays(today, 8), 'maneio'));
        } else if (category === 'raizes') {
            tasks.push(make(`Verificar solo e compactação${baseTitle}`, addDays(today, 2), 'maneio'));
            tasks.push(make(`Rega profunda (se necessário)${baseTitle}`, addDays(today, 4), 'rega'));
            tasks.push(make(`Adubação de manutenção${baseTitle}`, addDays(today, 9), 'nutricao'));
        } else {
            tasks.push(make(`Registar observações no painel${baseTitle}`, addDays(today, 1), 'registo'));
            tasks.push(make(`Adubação (se necessário)${baseTitle}`, addDays(today, 8), 'nutricao'));
        }

        return tasks;
    };

    const mergeGeneratedTasks = (existingTasks, parcelas) => {
        const list = Array.isArray(existingTasks) ? existingTasks.slice() : [];
        const byKey = new Set(
            list.map((t) => `${t.parcela_id || ''}::${normalizeText(t.titulo)}::${String(t.data_inicio || '').slice(0, 10)}`),
        );

        parcelas.forEach((parcela) => {
            const cultivo = getCultivoLabel(parcela);
            const generated = generateTasksForParcela(parcela, cultivo);
            generated.forEach((t) => {
                const key = `${t.parcela_id || ''}::${normalizeText(t.titulo)}::${String(t.data_inicio || '').slice(0, 10)}`;
                if (byKey.has(key)) return;
                byKey.add(key);
                list.push(t);
            });
        });

        return list;
    };

    const getUserTasks = (userId) => {
        const store = readTasksStore();
        const tasks = Array.isArray(store?.[userId]) ? store[userId] : [];
        return { store, tasks };
    };

    const setUserTasks = (store, userId, tasks) => {
        const next = { ...(store || {}) };
        next[userId] = Array.isArray(tasks) ? tasks : [];
        writeTasksStore(next);
    };

    const renderTasks = (tasks, options = {}) => {
        if (!tarefasContainer) return;
        const all = Array.isArray(tasks) ? tasks : [];
        const showOnlyToday = options.onlyToday !== false;
        const now = new Date();
        const cutoff = endOfDay(now);

        const isDone = (task) => String(task?.estado || '').toLowerCase().includes('conclu');
        const due = (task) => new Date(task?.data_inicio || task?.dueDate || 0);

        const visible = showOnlyToday
            ? all.filter((t) => !isDone(t) && due(t).getTime() <= cutoff.getTime())
            : all.filter((t) => !isDone(t));

        visible.sort((a, b) => due(a).getTime() - due(b).getTime());

        if (visible.length === 0) {
            renderEmpty(tarefasContainer, 'Sem tarefas para hoje. Registe um cultivo para gerar tarefas automaticamente.');
            return;
        }

        tarefasContainer.innerHTML = visible.map((tarefa) => {
            const dueText = formatShortDateTime(tarefa.data_inicio);
            return `
                <button type="button" data-task-id="${String(tarefa.id || '')}" style="all:unset;cursor:pointer;display:block;">
                    <div style="display:flex;align-items:flex-start;gap:10px;">
                        <div class="check-box">•</div>
                        <div>
                            <div style="font-weight:900;">${tarefa.titulo || 'Tarefa'}</div>
                            <div style="color:var(--muted);line-height:1.6;">${tarefa.parcela_nome || 'Sem parcela'} · Pendente · ${dueText}</div>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    };

    try {
        const [parcelasResponse, tarefasResponse, alertasResponse, clima] = await Promise.all([
            api.fetchJson(`parcelas/listar/${user.id}`),
            fetchOptional(`tarefas/listar/${user.id}`),
            fetchOptional(`alertas/listar/${user.id}`),
            fetchWeather('Lisboa'),
        ]);

        const parcelas = Array.isArray(parcelasResponse?.data) ? parcelasResponse.data : [];
        const serverTarefas = Array.isArray(tarefasResponse?.data) ? tarefasResponse.data : [];
        const alertas = Array.isArray(alertasResponse?.data) ? alertasResponse.data : [];

        if (parcelasCount) parcelasCount.textContent = String(parcelas.length);
        if (alertasCount) alertasCount.textContent = String(alertas.length);

        if (parcelas.length === 0) {
            renderEmpty(parcelasContainer, 'Ainda não existem parcelas registadas na base de dados.');
        } else if (parcelasContainer) {
            parcelasContainer.innerHTML = parcelas.map((parcela) => {
                const cultivos = Array.isArray(parcela.cultivos) ? parcela.cultivos : [];
                const cultivo = cultivos[0];
                return `
                    <div class="card">
                        <div style="font-weight:900;margin-bottom:6px;">${parcela.nome || 'Parcela'}</div>
                        <div style="color:var(--muted);line-height:1.6;">Estado: ${parcela.estado || 'Sem estado'}</div>
                        <div style="color:var(--muted);line-height:1.6;">Área: ${formatArea(parcela.area_m2)}</div>
                        <div style="color:var(--muted);line-height:1.6;">Cultivo: ${cultivo?.nome || 'Não definido'}</div>
                    </div>
                `;
            }).join('');
        }

        const userId = String(user.id ?? 'anon');
        const hasServerTasks = serverTarefas.length > 0;
        let tarefas = hasServerTasks ? serverTarefas : [];

        if (!hasServerTasks) {
            const { store, tasks } = getUserTasks(userId);
            const merged = mergeGeneratedTasks(tasks, parcelas);
            tarefas = merged;
            setUserTasks(store, userId, merged);

            if (tarefasContainer) {
                if (!tarefasContainer.dataset.tasksBound) {
                    tarefasContainer.dataset.tasksBound = '1';
                    tarefasContainer.addEventListener('click', (e) => {
                        const btn = e.target?.closest?.('[data-task-id]');
                        const taskId = btn?.getAttribute?.('data-task-id');
                        if (!taskId) return;
                        const { store: currentStore, tasks: currentTasks } = getUserTasks(userId);
                        const nextTasks = currentTasks.map((t) => {
                            if (String(t.id) !== String(taskId)) return t;
                            return { ...t, estado: 'Concluída', concluida_em: new Date().toISOString() };
                        });
                        setUserTasks(currentStore, userId, nextTasks);
                        renderTasks(nextTasks, { onlyToday: true });
                        if (tarefasCount) {
                            const pending = nextTasks.filter((t) => !String(t?.estado || '').toLowerCase().includes('conclu')).length;
                            tarefasCount.textContent = String(pending);
                        }
                    });
                }
            }
        }

        if (tarefasCount) {
            const pending = tarefas.filter((t) => !String(t?.estado || '').toLowerCase().includes('conclu')).length;
            tarefasCount.textContent = String(pending);
        }

        if (hasServerTasks) {
            if (tarefasContainer) {
                tarefasContainer.innerHTML = tarefas.map((tarefa) => `
                    <div style="display:flex;align-items:flex-start;gap:10px;">
                        <div class="check-box">${String(tarefa.estado || '').toLowerCase().includes('conclu') ? '✓' : '•'}</div>
                        <div>
                            <div style="font-weight:900;">${tarefa.titulo || 'Tarefa'}</div>
                            <div style="color:var(--muted);line-height:1.6;">${tarefa.parcela_nome || 'Sem parcela'} · ${tarefa.estado || 'Sem estado'} · ${formatDate(tarefa.data_inicio)}</div>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            renderTasks(tarefas, { onlyToday: true });
        }

        if (monitorizacaoContainer) {
            const totalArea = parcelas.reduce((sum, parcela) => sum + Number(parcela.area_m2 || 0), 0);
            const healthyCount = parcelas.filter((parcela) => String(parcela.estado || '').toLowerCase().includes('saud')).length;
            const attentionCount = parcelas.filter((parcela) => {
                const state = String(parcela.estado || '').toLowerCase();
                return state.includes('aten') || state.includes('critic');
            }).length;
            const cultivosCount = parcelas.reduce((sum, parcela) => sum + (Array.isArray(parcela.cultivos) ? parcela.cultivos.length : 0), 0);

            monitorizacaoContainer.innerHTML = `
                <div class="dash-card">
                    <div class="dash-card-title">Área total registada</div>
                    <div style="font-size:28px;font-weight:900;line-height:1;">${formatArea(totalArea)}</div>
                    <div style="color:var(--muted);margin-top:6px;">Somatório das parcelas guardadas na base de dados.</div>
                </div>
                <div class="dash-card">
                    <div class="dash-card-title">Estado das parcelas</div>
                    <div style="color:var(--muted);line-height:1.8;">
                        Saudáveis: ${healthyCount}<br>
                        Em atenção: ${attentionCount}<br>
                        Cultivos associados: ${cultivosCount}
                    </div>
                </div>
            `;
        }

        if (climaContainer) {
            if (!clima) {
                renderEmpty(climaContainer, 'A integração de clima ainda não está disponível no servidor atual.');
            } else {
                climaContainer.innerHTML = `
                    <div class="dash-card">
                        <div class="dash-card-title">Agora em ${clima.cidade || 'Lisboa'}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
                            <div>
                                <div style="font-size:34px;font-weight:900;line-height:1;">${Math.round(Number(clima.temperatura || 0))}°C</div>
                                <div style="color:var(--muted);margin-top:6px;">${clima.descricao || 'Sem descrição'} · Humidade ${clima.humidade ?? '—'}%</div>
                            </div>
                            <div style="color:var(--muted);line-height:1.8;">
                                Sensação: ${clima.sensacao_termica ?? '—'}°C<br>
                                Mín: ${clima.temp_min ?? '—'}°C<br>
                                Máx: ${clima.temp_max ?? '—'}°C
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        setError('');
    } catch (error) {
        if (parcelasCount) parcelasCount.textContent = '0';
        if (tarefasCount) tarefasCount.textContent = '0';
        if (alertasCount) alertasCount.textContent = '0';
        renderEmpty(parcelasContainer, 'Não foi possível carregar as parcelas da base de dados.');
        renderEmpty(tarefasContainer, 'As tarefas não puderam ser carregadas.');
        renderEmpty(monitorizacaoContainer, 'O monitoramento não está disponível.');
        renderEmpty(climaContainer, 'O clima não está disponível.');
        setError(error.message || 'Erro ao carregar o dashboard.');
    }
});
