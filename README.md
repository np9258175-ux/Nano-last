# 🍌 Nano Banana Image Generation Tool

AI image generation tool based on Google Gemini API

## Functional Features

- **Text Generate Image**: Enter text description to generate high-quality images
- **Image modification**: Supports image generation and text + image generation to generate new images
- **Multiple image generation**: Support uploading 1-3 images with text prompt words to generate new images
- **Modern interface**: Beautiful and responsive design
- **Drag and drop upload**: Support drag and drop file upload
- **Image Preview**: The source image can be previewed before uploading
- **One-click download**: The generated images can be downloaded directly
- **🔒 Security Protection**: API keys are protected by the server side and are not exposed on the front end

## Technology Stack

- Front-end: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js, Express
- API: Google Gemini 2.5 Flash Image Preview
- Deployment: Vercel, Netlify and other platforms

## Local Development Settings

### 1. Environment configuration
```bash
# Copy environment variable templates
cp.env.example.env

# Edit the .env file and add your API key
# GEMINI_API_KEY=Your new API key
```

### 2. Install and run
```bash
npm install
npm start
```

Visit http://localhost:3000

## Deployment Options

### Vercel Deployment (Recommended)
1. Add environment variables to Vercel project settings:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
2. Connect to the GitHub repository
3. Automatic deployment

### Netlify Deployment
1. Add environment variables to Netlify site settings:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
2. Connect and deploy the warehouse

## Instructions for use

### Text-generated image
1. Switch to the "Text Generate Image" tab
2. Enter a detailed image description
3. Click "Generate Image"
4. Wait for the generation to complete and download

### Image modification
1. Switch to the "Image Modification" tab
2. Enter a modification description
3. Select or drag the source image file
4. Click "Modify Image"
5. Wait for the generation to complete and download

### Multiple graph generation
1. Switch to the "Multiple Graph Generation" tab
2. Enter a detailed description prompt word
3. Select or drag 1-3 image files
4. Click "Generate Image"
5. Wait for the generation to complete and download

## Security Architecture

Now the API key is securely stored on the server side:
- The front-end calls the back-end API through `/api/generate-image` and `/api/edit-image`
- Backend proxy requests to Google Gemini API
- API keys are only used in server environment and will not be exposed to clients

## Notes

- Ensure stable network connection
- Image generation may take 10-30 seconds
- Supports common image formats (JPG, PNG, GIF, WebP)
- The generated image is in PNG format

---

🤖 Created by @thethestar

<!-- Last updated: Thursday, August 28, 2025 20:45:18 CST -->