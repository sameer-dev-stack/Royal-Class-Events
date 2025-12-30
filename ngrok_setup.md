# ngrok Quick Reference

Use these commands to expose your local services to the public internet.

### Expose Next.js Web App
```powershell
ngrok http 3000
```

### Expose Python Intelligence Service
```powershell
ngrok http 8000
```

### Authentication (if required)
If you get an error about an auth token, run:
```powershell
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```
Get your token from [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken).
