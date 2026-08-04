$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."
docker compose up -d database
Set-Location .\back
dotnet tool restore
dotnet ef database update `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext
dotnet run --project .\src\Census.Api\Census.Api.csproj --launch-profile https
