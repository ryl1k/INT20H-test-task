param(
    [switch]$NoBuild,
    [switch]$Foreground
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example. Review values if needed."
}

$composeArgs = @("compose", "up", "--remove-orphans")
if (-not $NoBuild) {
    $composeArgs += "--build"
}
if (-not $Foreground) {
    $composeArgs += "-d"
}

docker @composeArgs
docker compose ps

Write-Host ""
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:8080/health"
Write-Host "Swagger:  http://localhost:8080/swagger/index.html"
