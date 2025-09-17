# Multi-picture generation function test guide

## Feature Overview
The multi-picture generation function allows users to upload 1-3 images and generate new images with text prompt words. This feature is based on the Google Gemini 2.5 Flash Image Preview model.

## Test steps

### 1. Prepare the test image
- Images using JPEG or PNG format
- Image size is recommended to be less than 10MB
- Make sure the image is clear and there is no damage

### 2. Test cases

#### Use Case 1: Single Graph Generation
- Upload 1 image
- Enter description: `Create a professional e-commerce fashion photo with this dress`
- Expected results: Successfully generated new images

#### Use Case 2: Double Graph Generation
- Upload 2 images (for example: one costume picture, one model picture)
- Enter description: `Create a professional e-commerce fashion photo. Take the dress from the first image and let the model from the second image wear it.`
- Expected results: Successfully generated images of models wearing costumes

#### Use Case 3: Three-picture generation
- Upload 3 images
- Enter description: `Combine elements from all three images to create a new composition`
- Expected result: Successfully generated new image containing three image elements

### 3. Troubleshooting of FAQs

#### Question 1: "Unable to process input image"
**Possible Causes: **
- Image format is not supported (JPEG and PNG only)
- Image file corruption
- Image resolution is too high or too low
- Image contains inappropriate content

**Solution: **
- Make sure to use JPEG or PNG format
- Try using different images
- Check if the image is damaged
- Use clearer images

#### Question 2: Image upload failed
**Possible Causes: **
- File size exceeds 10MB limit
- File format is incorrect
- Browser does not support it

**Solution: **
- Compressed image files
- Convert to JPEG or PNG format
- Using a modern browser

#### Question 3: API Error
**Possible Causes: **
- The API key is invalid or expired
- Network connection issues
- Request format error

**Solution: **
- Check the environment variable GEMINI_API_KEY
- Check network connection
- View browser console error message

### 4. Debugging information

The function contains detailed debug information display:
- Request details (number of images, format, size, etc.)
- Error details (HTTP status, error messages, etc.)
- Successful response information

### 5. Best Practices

1. **Image Quality**: Use high-quality, clear images
2. **Tip word**: Provide a detailed and specific description
3. **Number of images*: Start testing from a single image and gradually increase
4. **File size**: Keep the image file size reasonable (<5MB recommended)

### 6. Technical limitations

- Support up to 3 images
- Only support JPEG and PNG formats
- Maximum 10MB of single image
- Requires a valid Gemini API key

## Test environment

- Local development: `npm start`
- Vercel Deployment: Automatic Deployment
- Netlify deployment: Support Netlify functions

## Contact Support

If you encounter problems, please:
1. View the browser console error message
2. Check the debugging information display
3. Confirm the API key configuration
4. Create GitHub Issue