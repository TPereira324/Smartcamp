(() => {
    const form = document.querySelector('[data-cultivo-form]');
    if (!form) return;

    const stepMeta = document.querySelector('[data-step-meta]');
    const stepperDots = Array.from(document.querySelectorAll('[data-stepper-dot]'));
    const steps = Array.from(document.querySelectorAll('[data-step]'));
    const errorBox = document.querySelector('[data-cultivo-error]');

    const btnPrev = document.querySelector('[data-step-prev]');
    const btnNext = document.querySelector('[data-step-next]');
    const btnSave = document.querySelector('[data-step-save]');

    const summaryParcel = document.querySelector('[data-summary-parcela]');
    const summaryTipo = document.querySelector('[data-summary-tipo]');
    const summaryObjetivo = document.querySelector('[data-summary-objetivo]');
    const summaryMetodo = document.querySelector('[data-summary-metodo]');

    const state = {
        step: 1,
        largura: '',
        comprimento: '',
        profundidade: '',
        tipo: '',
        objetivo: '',
        metodo: '',
    };

    const el = {
        largura: form.querySelector('[name="largura"]'),
        comprimento: form.querySelector('[name="comprimento"]'),
        profundidade: form.querySelector('[name="profundidade"]'),
        tipo: form.querySelector('[name="tipo"]'),
        objetivo: form.querySelector('[name="objetivo"]'),
        metodo: form.querySelector('[name="metodo"]'),
    };

    const setError = (msg) => {
        if (!errorBox) return;
        if (!msg) {
            errorBox.hidden = true;
            errorBox.textContent = '';
            return;
        }
        errorBox.hidden = false;
        errorBox.textContent = msg;
    };

    const getNumber = (input) => {
        if (!input) return NaN;
        const v = String(input.value || '').trim().replace(',', '.');
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    };

    const syncState = () => {
        state.largura = (el.largura?.value || '').trim();
        state.comprimento = (el.comprimento?.value || '').trim();
        state.profundidade = (el.profundidade?.value || '').trim();
        state.tipo = el.tipo?.value || '';
        state.objetivo = el.objetivo?.value || '';
        state.metodo = el.metodo?.value || '';
    };

    const validateStep = (step) => {
        syncState();
        if (step === 1) {
            const largura = getNumber(el.largura);
            const comprimento = getNumber(el.comprimento);
            const profundidade = getNumber(el.profundidade);
            if (![largura, comprimento, profundidade].every((n) => Number.isFinite(n) && n > 0)) {
                return 'Preenche as dimensões da parcela com valores maiores que 0.';
            }
        }
        if (step === 2 && !state.tipo) return 'Seleciona o tipo de cultivo.';
        if (step === 3 && !state.objetivo) return 'Seleciona o objetivo do cultivo.';
        if (step === 4 && !state.metodo) return 'Seleciona o método de cultivo.';
        return '';
    };

    const renderSummary = () => {
        syncState();
        const largura = String(state.largura).trim();
        const comprimento = String(state.comprimento).trim();
        const profundidade = String(state.profundidade).trim();
        if (summaryParcel) summaryParcel.textContent = `${largura} m × ${comprimento} m × ${profundidade} m`;
        if (summaryTipo) summaryTipo.textContent = state.tipo || '—';
        if (summaryObjetivo) summaryObjetivo.textContent = state.objetivo || '—';
        if (summaryMetodo) summaryMetodo.textContent = state.metodo || '—';
    };

    const showStep = (n) => {
        const max = steps.length || 5;
        const clamped = Math.max(1, Math.min(max, n));
        state.step = clamped;

        steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === clamped));
        stepperDots.forEach((d, idx) => d.classList.toggle('active', idx + 1 <= clamped));

        if (stepMeta) stepMeta.textContent = `Passo ${clamped} de ${max}`;

        if (btnPrev) btnPrev.hidden = clamped === 1;
        if (btnNext) btnNext.hidden = clamped === max;
        if (btnSave) btnSave.hidden = clamped !== max;

        if (clamped === max) renderSummary();
        setError('');
    };

    const next = () => {
        const err = validateStep(state.step);
        if (err) {
            setError(err);
            return;
        }
        showStep(state.step + 1);
    };

    const prev = () => {
        showStep(state.step - 1);
    };

    const save = () => {
        const err = validateStep(1) || validateStep(2) || validateStep(3) || validateStep(4);
        if (err) {
            setError(err);
            showStep(1);
            return;
        }
        syncState();

        const id = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || String(Date.now());
        const cultivo = {
            id,
            parcela: {
                largura: Number(String(state.largura).replace(',', '.')),
                comprimento: Number(String(state.comprimento).replace(',', '.')),
                profundidade: Number(String(state.profundidade).replace(',', '.')),
            },
            tipo: state.tipo,
            objetivo: state.objetivo,
            metodo: state.metodo,
            createdAt: new Date().toISOString(),
        };

        const key = 'cultivos';
        const prevList = (() => {
            try {
                return JSON.parse(localStorage.getItem(key) || '[]');
            } catch {
                return [];
            }
        })();

        const nextList = Array.isArray(prevList) ? [...prevList, cultivo] : [cultivo];
        localStorage.setItem(key, JSON.stringify(nextList));
        window.location.href = 'dashboard.html';
    };

    btnPrev?.addEventListener('click', (e) => {
        e.preventDefault();
        prev();
    });

    btnNext?.addEventListener('click', (e) => {
        e.preventDefault();
        next();
    });

    btnSave?.addEventListener('click', (e) => {
        e.preventDefault();
        save();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.step < steps.length) next();
        else save();
    });

    showStep(1);
})();
