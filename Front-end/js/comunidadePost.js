document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    const titleEl = document.getElementById('c-title');
    const badgeEl = document.getElementById('c-badge');
    const metaEl = document.getElementById('c-meta');
    const bodyEl = document.getElementById('c-body');
    const commentsEl = document.getElementById('community-comments');
    const errorEl = document.getElementById('community-post-error');
    const form = document.getElementById('community-comment-form');
    const textarea = document.getElementById('community-comment-input');

    const setError = (message) => {
        if (!errorEl) return;
        errorEl.hidden = !message;
        errorEl.textContent = message || '';
    };

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const renderComments = (comments) => {
        if (!commentsEl) return;
        if (!Array.isArray(comments) || comments.length === 0) {
            commentsEl.innerHTML = '<div class="card"><div style="color:var(--muted);line-height:1.6;">Ainda não existem respostas para esta publicação.</div></div>';
            return;
        }

        commentsEl.innerHTML = comments.map((comment) => `
            <div class="comment-item">
                <div class="comment-avatar"></div>
                <div class="comment-lines">
                    <div style="font-weight:800;margin-bottom:4px;">${comment?.autor?.nome || 'Utilizador'}</div>
                    <div style="color:var(--muted);margin-bottom:4px;">${formatDate(comment.data)}</div>
                    <div style="color:var(--muted);line-height:1.6;">${comment.conteudo || ''}</div>
                </div>
            </div>
        `).join('');
    };

    const loadPost = async () => {
        if (!postId) {
            setError('Publicação inválida.');
            return;
        }

        try {
            const [postResponse, commentsResponse] = await Promise.all([
                api.fetchJson(`forum/detalhe/${postId}`),
                api.fetchJson(`forum/comentarios/${postId}`),
            ]);

            const post = postResponse?.data;
            if (!post) {
                setError('Publicação não encontrada.');
                return;
            }

            if (titleEl) titleEl.textContent = post.titulo || 'Sem título';
            if (badgeEl) badgeEl.textContent = post.categoria_label || 'Outro';
            if (metaEl) metaEl.textContent = `${post?.autor?.nome || 'Utilizador'} · ${formatDate(post.data)}`;
            if (bodyEl) bodyEl.textContent = post.conteudo || 'Sem conteúdo.';
            document.title = `${post.titulo || 'Publicação'} - CocoRoot`;

            renderComments(Array.isArray(commentsResponse?.data) ? commentsResponse.data : []);
            setError('');
        } catch (error) {
            renderComments([]);
            setError(error.message || 'Não foi possível carregar esta publicação.');
        }
    };

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const user = api.getLoggedUser();
        const content = String(textarea?.value || '').trim();

        if (!user?.id) {
            setError('Precisas de iniciar sessão para comentar.');
            return;
        }
        if (!content) {
            setError('Escreve uma resposta antes de enviar.');
            return;
        }

        try {
            await api.fetchJson(`forum/comentar/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ut_id: user.id,
                    conteudo: content,
                }),
            });
            if (textarea) textarea.value = '';
            await loadPost();
        } catch (error) {
            setError(error.message || 'Não foi possível enviar o comentário.');
        }
    });

    await loadPost();
});
