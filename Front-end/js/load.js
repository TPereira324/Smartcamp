document.addEventListener('DOMContentLoaded', () => {
    const model = new UtilizadorModel();
    const view = new UtilizadorView();
    const controller = new UtilizadorController(model, view);

    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    controller.init();
    console.log('Aplicação CocoRoot carregada!');
});
