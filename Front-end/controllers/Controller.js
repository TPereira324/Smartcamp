class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        this.view.renderLogin();
        this.bindEvents();
    }

    bindEvents() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const result = this.model.login(username, password);

        if (result.success) {
            this.view.displayMessage(`Login realizado com sucesso! Bem-vindo, ${result.user}.`);
        } else {
            this.view.displayMessage(result.message, true);
        }
    }
}