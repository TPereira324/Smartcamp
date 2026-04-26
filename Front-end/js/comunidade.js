document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const statsRoot = document.getElementById('community-stats');
    const postsRoot = document.getElementById('posts');
    const errorBox = document.getElementById('community-error');
    const tabs = Array.from(document.querySelectorAll('.tab[data-cat]'));

    const setError = (message) => {
        if (!errorBox) return;
        errorBox.hidden = !message;
        errorBox.textContent = message || '';
    };

    const renderStats = (posts) => {
        if (!statsRoot) return;
        const counters = {
            todos: posts.length,
            duvidas: posts.filter((post) => post.categoria === 'duvidas').length,
            dicas: posts.filter((post) => post.categoria === 'dicas').length,
            experiencias: posts.filter((post) => post.categoria === 'experiencias').length,
        };

        statsRoot.innerHTML = `
            <div class="stat-item">
                <span class="stat-num">${counters.todos}</span>
                <span class="stat-label">Todos</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">${counters.duvidas}</span>
                <span class="stat-label">Dúvidas</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">${counters.dicas}</span>
                <span class="stat-label">Dicas</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">${counters.experiencias}</span>
                <span class="stat-label">Experiências</span>
            </div>
        `;
    };

    const formatRelativeMeta = (post) => {
        const author = post?.autor?.nome || 'Utilizador';
        const date = post?.data ? new Date(post.data) : null;
        if (!date || Number.isNaN(date.getTime())) {
            return `${author} · ${post?.comentarios ?? 0} respostas`;
        }

        const text = new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
        return `${author} · ${text}`;
    };

    const renderPosts = (posts, activeCategory) => {
        if (!postsRoot) return;
        const filtered = activeCategory === 'todos'
            ? posts
            : posts.filter((post) => post.categoria === activeCategory);

        if (filtered.length === 0) {
            postsRoot.innerHTML = '<div class="card"><div style="color:var(--muted);line-height:1.6;">Sem publicações para esta categoria.</div></div>';
            return;
        }

        postsRoot.innerHTML = filtered.map((post) => `
            <a class="card" data-cat="${post.categoria || 'outros'}" href="comunidade-post.html?id=${post.id}" style="text-decoration:none;color:inherit;display:block;">
                <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="font-weight:900;">${post?.autor?.nome || 'Utilizador'}</div>
                    <div style="color:var(--muted);font-size:13px;">${formatRelativeMeta(post)}</div>
                </div>
                <div style="font-weight:900;font-size:16px;margin-bottom:6px;">${post.titulo || 'Sem título'}</div>
                <div style="color:var(--muted);line-height:1.6;">${post.conteudo || 'Sem conteúdo.'}</div>
                <div class="post-badge">${post.categoria_label || 'Outro'}</div>
            </a>
        `).join('');
    };

    let currentCategory = 'todos';
    let posts = [];

    const activateTab = (category) => {
        currentCategory = category;
        tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.cat === category));
        renderPosts(posts, currentCategory);
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activateTab(tab.dataset.cat));
    });

    try {
        const response = await api.fetchJson('forum/listar');
        posts = Array.isArray(response?.data) ? response.data : [];
        renderStats(posts);
        renderPosts(posts, currentCategory);
        setError('');
    } catch (error) {
        renderStats([]);
        renderPosts([], currentCategory);
        setError(error.message || 'Não foi possível carregar a comunidade.');
    }
});
