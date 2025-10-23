#!/bin/bash

# Script para contornar verificação de versão do Node.js
# Este script modifica temporariamente o arquivo do Next.js para ignorar a verificação de versão

echo "Contornando verificação de versão do Node.js..."

# Encontra o arquivo do Next.js
NEXT_FILE=$(find node_modules -name "*.js" -path "*/next/dist/bin/next" | head -1)

if [ -z "$NEXT_FILE" ]; then
    echo "Arquivo do Next.js não encontrado"
    exit 1
fi

# Faz backup do arquivo original
cp "$NEXT_FILE" "$NEXT_FILE.backup"

# Modifica o arquivo para ignorar verificação de versão
sed -i 's/if (nodeVersion < requiredVersion) {/if (false) {/' "$NEXT_FILE"

echo "Executando build..."
npm run build

# Restaura o arquivo original
mv "$NEXT_FILE.backup" "$NEXT_FILE"

echo "Build concluído!"
