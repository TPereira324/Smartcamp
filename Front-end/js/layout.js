document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop() || 'principal.html';
    const user = JSON.parse(localStorage.getItem('user'));
    const isInPages = window.location.pathname.includes('/pages/');
    const assetPrefix = isInPages ? '../' : '';

    const headerHTML = `
    <nav class="nav">
        <a href="principal.html" class="nav-logo" aria-label="CocoRoot">
            <img src="${assetPrefix}image/logo.jpeg" alt="" class="nav-brand">
            <span class="nav-title">CocoRoot</span>
        </a>
        <div class="nav-links">
            <a href="noticias.html" class="nav-link ${currentPath.includes('noticias') || currentPath.includes('post') ? 'active' : ''}">Notícias</a>
            <a href="dashboard.html" class="nav-link ${currentPath.includes('dashboard') || currentPath.includes('registrar-cultivo') ? 'active' : ''}">Dashboard</a>
            <a href="comunidade.html" class="nav-link ${currentPath.includes('comunidade') ? 'active' : ''}">Comunidade</a>
            <a href="comecar.html" class="nav-link ${currentPath.includes('comecar') ? 'active' : ''}">Guia</a>
            <a href="sobre.html" class="nav-link ${currentPath.includes('sobre') ? 'active' : ''}">Sobre nós</a>
            ${user && user.role === 'admin' ? '<a href="dashboard.html?admin=true" class="nav-link active">Admin</a>' : ''}
        </div>
        <div class="nav-right">
            ${user ? `
                <span class="nav-user-info">${user.nome}</span>
                <a href="#" id="logout-btn" class="nav-link nav-logout"><i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sair</a>
            ` : `
                <a href="login.html" class="nav-btn"><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i> Entrar</a>
                <a href="registo.html" class="nav-btn"><i class="bi bi-person-plus" aria-hidden="true"></i> Criar Conta</a>
            `}
        </div>
    </nav>
    `;

    const footerHTML = `
    <footer class="footer" style="margin-top: auto;">
        <div class="footer-logo">
            <span style="display:flex;align-items:center;gap:10px;">
                <img src="${assetPrefix}image/logo.jpeg" alt="" class="nav-brand">
                <span class="nav-title">CocoRoot</span>
            </span>
        </div>
        <div class="footer-links">
            <div class="footer-col">
                <div style="font-weight:800;margin-bottom:6px;">Produto</div>
                <a href="comecar.html" style="text-decoration:none;color:var(--muted);">Guias</a>
                <a href="principal.html#funcionalidades" style="text-decoration:none;color:var(--muted);">Funcionalidades</a>
                <a href="principal.html#como-funciona" style="text-decoration:none;color:var(--muted);">Como funciona</a>
            </div>
            <div class="footer-col">
                <div style="font-weight:800;margin-bottom:6px;">Empresa</div>
                <a href="sobre.html" style="text-decoration:none;color:var(--muted);">Sobre nós</a>
                <a href="dashboard.html" style="text-decoration:none;color:var(--muted);">Dashboard</a>
            </div>
            <div class="footer-col">
                <div style="font-weight:800;margin-bottom:6px;">Legal</div>
                <a href="#" style="text-decoration:none;color:var(--muted);">Privacidade</a>
                <a href="#" style="text-decoration:none;color:var(--muted);">Termos</a>
                <a href="#" style="text-decoration:none;color:var(--muted);">Cookies</a>
            </div>
        </div>
        <div class="footer-actions">
            ${user ? '' : '<a href="login.html" class="btn">Entrar</a>'}
        </div>
    </footer>
    `;

    // Inject header at the start of body
    if (!document.body.classList.contains('auth-page') && !document.querySelector('.nav')) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    } else if (document.querySelector('.nav')) {
        document.querySelector('.nav').outerHTML = headerHTML;
    }

    // Inject footer at the end of body
    if (!document.body.classList.contains('auth-page')) {
        if (document.querySelector('.footer')) {
            document.querySelector('.footer').outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }

    // Handle Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'principal.html';
        });
    }
});
