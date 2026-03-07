class Model {
    constructor() {
        this.users = [
            { username: 'admin', password: '123' },
            { username: 'user', password: 'password' }
        ];
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            return { success: true, user: user.username };
        }
        return { success: false, message: 'Usuário ou senha inválidos.' };
    }
}