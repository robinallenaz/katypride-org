@echo off
echo Testing Strapi connection...
echo.

echo 1. Testing basic connectivity:
curl -I https://katypride-strapi.onrender.com/health
echo.

echo 2. Testing API endpoint (should return 401 without token):
curl -I https://katypride-strapi.onrender.com/api/events
echo.

echo 3. If you see responses above, the Strapi backend is running.
echo    Now generate an API token in the admin panel:
echo    https://katypride-strapi.onrender.com/admin
echo.

pause
