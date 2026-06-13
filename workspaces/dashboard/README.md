# VentureOS Dashboard (Internal, Password-Protected)

Deployed as a separate Railway service from this directory.

Required environment variables on Railway:
- `NEXT_PUBLIC_API_URL` = `https://ventureos-production.up.railway.app`
- `DASHBOARD_PASSWORD` = `<choose a strong password>`

Access: visit the Railway-generated domain, browser will prompt for username `admin` and the configured `DASHBOARD_PASSWORD`.

Also add `DASHBOARD_URL=<this service's Railway domain>` to the MAIN server's environment variables, so CORS allows requests from here.
