<?php

namespace App\Controller;

use App\Service\UsuarioService;
use Exception;

class UsuarioController extends Controller {
    private UsuarioService $usuarioService;

    public function __construct() {
        $this->usuarioService = new UsuarioService();
    }

    /**
     * Exibe a página inicial (Dashboard de Busca)
     */
    public function index(): void {
        $busca = $_GET['busca'] ?? '';
        $usuarios = [];
        
        if (!empty($busca)) {
            $usuarios = $this->usuarioService->pesquisar($busca);
        }

        $this->view('dashboard/index', [
            'usuarios' => $usuarios
        ]);
    }

    /**
     * Endpoint para registo de novo utilizador
     */
    public function registar(): void {
        try {
            $dados = $_POST;
            $usuarioDto = $this->usuarioService->registar(
                $dados['nome'] ?? '',
                $dados['email'] ?? '',
                $dados['senha'] ?? ''
            );

            $this->json([
                'status' => 'sucesso',
                'mensagem' => 'Conta criada com sucesso!',
                'dados' => $usuarioDto
            ], 201);
        } catch (Exception $e) {
            $this->erro($e->getMessage());
        }
    }

    /**
     * Endpoint para login
     */
    public function login(): void {
        try {
            $dados = $_POST;
            $usuarioDto = $this->usuarioService->login(
                $dados['email'] ?? '',
                $dados['senha'] ?? ''
            );

            $this->json([
                'status' => 'sucesso',
                'mensagem' => 'Login realizado!',
                'dados' => $usuarioDto
            ]);
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 401);
        }
    }

    /**
     * Endpoint para obter perfil
     */
    public function perfil(int $id): void {
        try {
            $usuarioDto = $this->usuarioService->obterPerfil($id);
            $this->json([
                'status' => 'sucesso',
                'dados' => $usuarioDto
            ]);
        } catch (Exception $e) {
            $this->erro($e->getMessage(), 404);
        }
    }
}
