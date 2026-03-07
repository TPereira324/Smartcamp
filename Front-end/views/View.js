class View {
    constructor() {
        this.app = document.getElementById('app');
    }

    renderLogin() {
        this.app.innerHTML = `
            <div class="login-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="input-group">
                        <label for="username">Usuário</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="input-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-login">Entrar</button>
                    <div id="login-message" class="message"></div>
                </form>
            </div>
        `;
    }

    displayMessage(message, isError = false) {
        const messageDiv = document.getElementById('login-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = isError ? 'message error' : 'message success';
        }
    }
}