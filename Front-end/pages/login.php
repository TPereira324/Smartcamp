<?php
$erros = [
    "senha_incorreta"          => "Senha incorreta.",
    "utilizador_nao_encontrado"=> "Utilizador não encontrado.",
    "campos_obrigatorios"      => "Preenche todos os campos.",
    "metodo_invalido"          => "Pedido inválido.",
];
$sucessos = [
    "conta_criada" => "Conta criada com sucesso! Podes entrar agora.",
];

$erro   = isset($_GET["erro"])    ? ($erros[$_GET["erro"]]    ?? "Erro desconhecido.") : null;
$sucesso = isset($_GET["sucesso"]) ? ($sucessos[$_GET["sucesso"]] ?? null) : null;
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CocoRoot</title>
    <link rel="stylesheet" href="../css/wireframe.css">
</head>
<body class="auth-page">
    <div class="auth-img img-ph" style="overflow:hidden;padding:0;"></div>

    <div class="auth-form">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;">
            <a href="principal.html" class="back-link">← Home</a>
            <a href="registo.php" class="nav-btn">Criar Conta</a>
        </div>

        <div class="auth-logo">
            <span style="display:flex;align-items:center;gap:10px;">
                <span>CocoRoot</span>
            </span>
        </div>

        <?php if ($erro): ?>
            <p style="color:red;margin-bottom:12px;"><?php echo htmlspecialchars($erro); ?></p>
        <?php endif; ?>
        <?php if ($sucesso): ?>
            <p style="color:green;margin-bottom:12px;"><?php echo htmlspecialchars($sucesso); ?></p>
        <?php endif; ?>

        <form id="login-form" action="/Back-end/login.php" method="POST">
            <div class="form-group">
                <label for="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="Digite o seu e-mail" required>
            </div>
            <div class="form-group">
                <label for="password">Palavra-passe</label>
                <input type="password" id="password" name="password" placeholder="Digite a sua palavra-passe" required>
            </div>
            <div class="btn-group">
                <button type="submit" class="btn full">Entrar</button>
                <a href="registo.php" class="btn full">Registar-me</a>
            </div>
        </form>
    </div>
    <script src="../js/layout.js"></script>
</body>
</html>
