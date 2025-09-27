# Google OAuth Setup Instructions

## To enable Google Sign-In:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project or Select Existing**
   - Click on the project dropdown at the top
   - Click "New Project" or select existing

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click Enable

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Configure OAuth consent screen if prompted
   - Application type: "Web application"
   - Name: "BabyNames App"

5. **Add Authorized JavaScript Origins**
   - http://localhost:3000 (for development)
   - https://amirchason.github.io (for production)

6. **Add Authorized Redirect URIs**
   - http://localhost:3000/auth/callback
   - https://amirchason.github.io/babyname2/auth/callback

7. **Copy Your Client ID**
   - Copy the generated Client ID
   - Update `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

8. **Restart the app**
   ```bash
   npm start
   ```

## Current Status
- Google Auth is configured but needs a valid Client ID
- The "Sign in with Google" button will work once you add the Client ID
- User profile picture and name will appear after login