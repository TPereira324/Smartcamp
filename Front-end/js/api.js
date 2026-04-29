(() => {
    // ---------------------------------------------------------------
    // CONFIGURAÇÃO MAMP PRO  (porta 80 — lido do httpd.conf)
    const MAMP_PORT = 80;
    const DEFAULT_PROJECT_BASE_PATH = '/CocoRoot/';
    // ---------------------------------------------------------------

    // URL base do Apache MAMP (sem barra final)
    const mampOrigin = MAMP_PORT === 80
        ? 'http://localhost'
        : 'http://localhost:' + MAMP_PORT;

    const isFileProtocol = window.location.protocol === 'file:';

    function detectProjectBasePath() {
        if (isFileProtocol) {
            return DEFAULT_PROJECT_BASE_PATH;
        }

        const match = window.location.pathname.match(/^(.*?\/)(Front-end|Back-end)\//);
        if (match && match[1] && match[1] !== '/') {
            return match[1];
        }

        return DEFAULT_PROJECT_BASE_PATH;
    }

    const projectBasePath = detectProjectBasePath();
    const rawBackend = new URL(`${projectBasePath.replace(/\/?$/, '/')}Back-end/`, mampOrigin);
    const backendBaseUrl = rawBackend.toString();
    const apiBaseUrl = backendBaseUrl + 'api.php/';

    function buildBackendUrl(path = '') {
        return new URL(String(path).replace(/^\/+/, ''), apiBaseUrl).toString();
    }

    function buildPhpUrl(fileName) {
        return new URL(String(fileName).replace(/^\/+/, ''), backendBaseUrl).toString();
    }

    async function parseJson(response) {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const message = data?.message || data?.mensagem || 'Falha ao comunicar com o servidor.';
            throw new Error(message);
        }
        return data;
    }

    async function fetchJson(path, options = {}) {
        const response = await fetch(buildBackendUrl(path), options);
        return parseJson(response);
    }

    function getLoggedUser() {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function requireLoggedUser() {
        const user = getLoggedUser();
        if (!user || !user.id) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    }

    window.CocoRootApi = {
        buildBackendUrl,
        buildPhpUrl,
        fetchJson,
        getLoggedUser,
        requireLoggedUser,
    };
})();
