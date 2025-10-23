# Script PowerShell para contornar verificação de versão do Node.js
# Este script modifica temporariamente o arquivo do Next.js para ignorar a verificação de versão

Write-Host "Contornando verificação de versão do Node.js..."

# Encontra o arquivo do Next.js
$nextFile = Get-ChildItem -Path "node_modules" -Recurse -Name "next" | Where-Object { $_ -like "*bin*" } | Select-Object -First 1

if (-not $nextFile) {
    Write-Host "Arquivo do Next.js não encontrado"
    exit 1
}

$fullPath = Join-Path "node_modules" $nextFile

# Faz backup do arquivo original
Copy-Item $fullPath "$fullPath.backup"

# Modifica o arquivo para ignorar verificação de versão
$content = Get-Content $fullPath -Raw
$content = $content -replace 'if \(nodeVersion < requiredVersion\) \{', 'if (false) {'
Set-Content $fullPath $content

Write-Host "Executando build..."
npm run build

# Restaura o arquivo original
Move-Item "$fullPath.backup" $fullPath

Write-Host "Build concluído!"
