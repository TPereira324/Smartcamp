(() => {
    const backendBaseUrl = new URL('../../Back-end/', window.location.href);
    const apiBaseUrl = new URL('api.php/', backendBaseUrl);

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
