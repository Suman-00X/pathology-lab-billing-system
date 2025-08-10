# Authentication Troubleshooting Guide

## ✅ Status: Backend Authentication Working

The backend authentication system is working correctly:
- ✅ Test client created successfully
- ✅ Database migration completed (5 bills, 7 test groups, 21 tests migrated)
- ✅ Login endpoint responding correctly
- ✅ Test credentials valid

## 🧪 Test Credentials
- **Email**: `mylab@test.com`
- **Password**: `test123`
- **Secret PIN**: `Bill@delete001`

## 🔧 Troubleshooting Steps

### 1. Check Server Status
Make sure both servers are running:
```bash
# Backend server (port 5000)
cd server
npm start

# Frontend server (port 3000)
cd client
npm run dev
```

### 2. Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Check Network tab for failed API calls

### 3. Check Network Requests
1. Open DevTools → Network tab
2. Try logging in
3. Look for POST request to `/api/auth/login`
4. Check if it returns 200 status
5. Verify response contains token and client data

### 4. Clear Browser Data
Sometimes cached data can cause issues:
1. Clear localStorage: `localStorage.clear()`
2. Clear cookies for localhost
3. Hard refresh (Ctrl+F5)

### 5. Check CORS Issues
If you see CORS errors in console:
1. Make sure server CORS is configured correctly
2. Check if frontend is running on correct port (3000)
3. Verify API calls are going to http://localhost:5000

### 6. Test Login Directly
You can test login in browser console:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'mylab@test.com',
    password: 'test123'
  })
}).then(r => r.json()).then(console.log)
```

### 7. Check Environment
Make sure you're in development mode:
- Frontend should show login page at http://localhost:3000/login
- Admin panel should be accessible at http://localhost:3000/admin

## 🚨 Common Issues

### Issue: "Invalid email or password"
- ✅ Backend is working, credentials are correct
- Check if frontend is sending request to correct endpoint
- Verify no typos in email/password input

### Issue: "Network Error" or "Failed to fetch"
- Check if backend server is running (port 5000)
- Verify CORS configuration
- Check firewall/antivirus blocking connections

### Issue: Page keeps redirecting to login
- Check if token is being saved to localStorage
- Verify AuthContext is properly wrapped around app
- Check browser console for authentication errors

### Issue: "Cannot find module" errors
- Run `npm install` in both client and server directories
- Check all dependencies are installed correctly

## 📞 Next Steps

If credentials still don't work:
1. Share browser console errors
2. Share network tab errors
3. Confirm both servers are running
4. Try the browser console test above
