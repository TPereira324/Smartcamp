<?php

/**
 * Autoloader simples para o namespace App
 */
spl_autoload_register(function ($classe) {
    // Prefixo do namespace
    $prefixo = 'App\\';
    // Diretório base para o namespace
    $diretorioBase = __DIR__ . '/../';

    // A classe usa o prefixo?
    $tamanhoPrefixo = strlen($prefixo);
    if (strncmp($prefixo, $classe, $tamanhoPrefixo) !== 0) {
        return;
    }

    // Parte relativa do nome da classe
    $classeRelativa = substr($classe, $tamanhoPrefixo);

    // Substituir o prefixo pelo diretório base, substituir separadores de namespace por separadores de diretório
    // e adicionar .php
    $ficheiro = $diretorioBase . str_replace('\\', '/', strtolower($classeRelativa)) . '.php';

    // Se o ficheiro existe, carrega-o
    if (file_exists($ficheiro)) {
        require $ficheiro;
    } else {
        // Tentar carregar sem converter para minúsculas se falhar (para sistemas sensíveis a maiúsculas)
        $ficheiroOriginal = $diretorioBase . str_replace('\\', '/', $classeRelativa) . '.php';
        if (file_exists($ficheiroOriginal)) {
            require $ficheiroOriginal;
        }
    }
});
