# VentureOS Dashboard (Internal, Password-Protected)

Deployed as a SEPARATE Railway service in the same project.

Railway service settings:
- Root Directory: workspaces/dashboard
- Builder: Nixpacks (forced via nixpacks.toml — do NOT let it fall 
  back to the root Dockerfile)
- Build Command: (leave default, nixpacks.toml handles it)
- Start Command: (leave default, nixpacks.toml handles it)

Required environment variables on this service:
- NEXT_PUBLIC_API_URL = https://ventureos-production.up.railway.app
- DASHBOARD_PASSWORD = <choose a strong password>

Required environment variable on the MAIN service:
- DASHBOARD_URL = <this service's Railway domain, once generated>

Access: visit this service's Railway domain. Browser prompts for 
username 'admin' and DASHBOARD_PASSWORD.
