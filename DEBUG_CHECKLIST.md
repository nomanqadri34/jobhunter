# Descope Authentication Debug Checklist

## 🔍 Current Issue

The Descope web component is firing a "success" event, but the `sessionToken` is undefined, causing the error "Descope token is required".

## 🧪 Debug Steps

### 1. Check Browser Console

After loading the login page, check the browser console for:

- ✅ "Descope test element found"
- ✅ "🔍 Descope ready event: ..."
- ✅ "🔍 Descope loaded event: ..."
- ❌ "🎉 SUCCESS EVENT DETAILS:" (when you authenticate)

### 2. Test Authentication Flow

1. Go to http://localhost:3000
2. Try to sign in with Google or LinkedIn
3. Check console for the success event details
4. Look for what properties are available in `e.detail`

### 3. Common Issues to Check

#### A. Wrong Flow Configuration

- Flow ID might be incorrect
- Flow might not be configured to return session tokens

#### B. Project Configuration

- Project ID might be wrong
- Project might not be properly set up

#### C. Token Property Name

The token might be under a different property:

- `e.detail.sessionToken` ❌
- `e.detail.token` ❓
- `e.detail.jwt` ❓
- `e.detail.accessToken` ❓
- `e.detail.sessionJwt` ❓

### 4. Expected Console Output

When authentication succeeds, you should see:

```
🎉 SUCCESS EVENT DETAILS:
- Event detail: {sessionToken: "eyJ...", user: {...}}
- Event detail type: object
- Event detail keys: ["sessionToken", "user", ...]
- sessionToken: eyJ...
- user: {...}
```

### 5. Descope Dashboard Check

Go to [Descope Console](https://app.descope.com) and verify:

1. **Project ID**: P32CBVFJNBfm2p5qfp6hpj6omNsg
2. **Flow Configuration**: "sign-up-or-in" flow exists
3. **Authentication Methods**: Google and LinkedIn are enabled
4. **JWT Settings**: Session tokens are enabled

### 6. Environment Variables

Verify these are set correctly:

- Frontend: `VITE_DESCOPE_PROJECT_ID=P32CBVFJNBfm2p5qfp6hpj6omNsg`
- Backend: `DESCOPE_PROJECT_ID=P32CBVFJNBfm2p5qfp6hpj6omNsg`
- Backend: `DESCOPE_MANAGEMENT_KEY=UDMyQ0JWRkpOQmZtMnA1cWZwNmhwajZvbU5zZzpLMzJDT1lEckJlWlE1Vm56cTU4T2oyR3J3SG10`

## 🔧 Next Steps Based on Console Output

### If No Success Event Fires:

- Check Descope project configuration
- Verify authentication methods are enabled
- Check network tab for failed requests

### If Success Event Fires But No Token:

- Check what properties are available in `e.detail`
- Update token extraction logic
- Verify flow is configured to return session tokens

### If Token Exists But Backend Rejects It:

- Check backend Descope service configuration
- Verify management key is correct
- Check backend logs for token validation errors

## 🎯 Goal

Get the console to show:

```
Extracted token: eyJ... (valid JWT token)
Token type: string
AuthService.login called with token: eyJ...
Login response: {success: true, token: "...", user: {...}}
```
