<?php

use App\Config\Router;
use App\Controller\UsuarioController;
use App\Controller\ParcelaController;
use App\Controller\SensorController;
use App\Controller\TarefaController;
use App\Controller\ForumController;

// Carregar bootstrap (autoloader e configs base)
require_once __DIR__ . '/config/bootstrap.php';
require_once __DIR__ . '/config/router.php';

$router = new Router();

// --- ROTA RAIZ (HTML) ---
$router->get('/', [UsuarioController::class, 'index']);

// --- ROTAS DE UTILIZADOR ---
$router->post('/api/usuario/registar', [UsuarioController::class, 'registar']);
$router->post('/api/usuario/login', [UsuarioController::class, 'login']);
$router->get('/api/usuario/perfil/{id}', [UsuarioController::class, 'perfil']);

// --- ROTAS DE PARCELAS ---
$router->post('/api/parcela/adicionar', [ParcelaController::class, 'adicionar']);
$router->get('/api/parcela/listar/{id}', [ParcelaController::class, 'listar']); // ID do utilizador

// --- ROTAS DE SENSORES ---
$router->post('/api/sensor/leitura', [SensorController::class, 'registarLeitura']);
$router->get('/api/sensor/parcela/{id}', [SensorController::class, 'listarPorParcela']);

// --- ROTAS DE TAREFAS ---
$router->post('/api/tarefa/adicionar', [TarefaController::class, 'adicionar']);
$router->post('/api/tarefa/estado/{id}', [TarefaController::class, 'alternarEstado']);
$router->get('/api/tarefa/listar/{id}', [TarefaController::class, 'listar']); // ID do utilizador

// --- ROTAS DE FÓRUM ---
$router->post('/api/forum/publicar', [ForumController::class, 'publicar']);
$router->get('/api/forum/listar', [ForumController::class, 'listar']);

// Disparar o roteamento
$router->disparar();
