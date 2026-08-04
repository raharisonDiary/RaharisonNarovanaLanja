$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\..\mobile"
if (-not (Test-Path node_modules)) { npm install --legacy-peer-deps }
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm start
