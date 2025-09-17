# Vercel Deployment Configuration Guide

## 🔐 Environment variable configuration

To protect sensitive information, follow these steps to configure environment variables in Vercel:

### 1. Log in to Vercel
Visit [vercel.com](https://vercel.com) and log in to your account

### 2. Select a project
Select your `nano-banana-tool` project

### 3. Enter project settings
Click on the project name → Settings → Environment Variables

### 4. Add environment variables

#### Required environment variables:

| Variable name | Description | Sample value |
|--------|--------|
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSyC...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### Optional environment variables:

| Variable name | Description | Sample value |
|--------|--------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-xxx.apps.googleusercontent.com` |

### 5. Environment variable acquisition method

#### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key value

####Supabase configuration
1. Visit [Supabase](https://supabase.com)
2. Create a new project or select an existing project
3. Enter Settings → API
4. Copy Project URL and anon public key

#### Google OAuth Client ID
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select an existing project
3. Enable the Google+ API and Google OAuth2 API
4. Create an OAuth 2.0 client ID on the "Credentials" page
5. Set the authorized domain name

### 6. Post-deployment verification

After configuration is complete, redeploy the project. You should see in the browser console:
- ✅ Configuration loaded successfully
- ✅ Supabase client initialization successfully

### 7. Safety precautions

- ✅ **Security**: Environment variables are only visible on the server side and will not be exposed to the client side
- ✅ **Recommended**: Use Supabase's anon key (public key, relatively secure)
- ⚠️ **Note**: Do not use Supabase's service_role key (super administrator permissions)

### 8. Troubleshooting

If you encounter configuration problems:
1. Check whether the environment variable name is correct
2. Confirm that there are no extra spaces in the environment variable value
3. Redeploy the project
4. View the error message of the browser console

## 🚀 Deployment command

```bash
# Installation dependencies
npm install

# Local Test
npm start

# Deploy to Vercel
vercel --prod
```

## 📝 Local development

Create `.env` file (do not submit to Git):

```bash
cp.env.example.env
# Edit the .env file and fill in the real API key
```