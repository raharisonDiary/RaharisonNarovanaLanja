$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\..\web"
if (-not (Test-Path node_modules)) { npm install }
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
