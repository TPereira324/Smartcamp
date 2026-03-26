<?php
// views/dashboard/index.php
?>

<!DOCTYPE html>
<html lang="pt">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CocoRoot - Dashboard</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
        th { background: #f4f4f4; }
    </style>
</head>

<body>
	<h1>CocoRoot - Sistema de Busca</h1>
    
    <div style="display: flex; gap: 40px;">
        <!-- Form de Busca -->
        <div>
            <h3>Pesquisar Utilizadores</h3>
            <form action="" method="GET">
                <input name="busca" value="<?php echo htmlspecialchars($_GET['busca'] ?? ''); ?>"
                    placeholder="Nome, email ou ID" type="text">
                <button type="submit">Pesquisar</button>
            </form>
        </div>

        <!-- Form de Registo (Backend atualizado) -->
        <div>
            <h3>Novo Registo</h3>
            <form action="/api/usuario/registar" method="POST">
                <div class="form-group">
                    <input type="text" name="nome" placeholder="Nome" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" name="senha" placeholder="Senha" required>
                </div>
                <button type="submit">Cadastrar</button>
            </form>
        </div>
    </div>

	<table>
		<tr>
			<th>ID</th>
			<th>Nome</th>
			<th>Email</th>
		</tr>
		<?php if (empty($usuarios)): ?>
			<tr>
				<td colspan="3">Nenhum utilizador encontrado ou aguardando pesquisa.</td>
			</tr>
		<?php else: ?>
			<?php foreach ($usuarios as $user): ?>
				<tr>
					<td><?php echo $user->id; ?></td>
					<td><?php echo htmlspecialchars($user->nome); ?></td>
					<td><?php echo htmlspecialchars($user->email); ?></td>
				</tr>
			<?php endforeach; ?>
		<?php endif; ?>
	</table>
</body>

</html>
