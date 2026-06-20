Smoke Tests for Location Endpoints

Run the included smoke scripts to verify the fallback chain (Google → Photon → internal) against your local API gateway.

Environment:
- `API_BASE` (optional) — base URL of the API gateway, default `http://localhost:3000`

Shell (Linux/macOS/WSL):

```bash
docs/tests/smoke_location.sh "Nairobi"
```

PowerShell (Windows):

```powershell
.\docs\tests\smoke_location.ps1 'Nairobi'
```

Node (cross-platform):

```bash
node docs/tests/smoke_location.js Nairobi
```

Adjust `API_BASE` to your running gateway if it's not on `http://localhost:3000`.

These are minimal smoke checks; they only verify responses and HTTP codes. For CI, wrap them in your chosen test runner.
