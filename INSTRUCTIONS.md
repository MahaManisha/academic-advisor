# Assessment Generator Setup Instructions

The AI Assessment Generator has been implemented!

## 1. Configure API Key
Open your `.env` file and find the `AI Configuration` section at the bottom.
Replace `your_gemini_api_key_here` with your actual Google Gemini API Key.

```env
GEMINI_API_KEY=AIzaSy...
```

## 2. Restart Server
After saving the `.env` file, restart the server:
- If using nodemon: Valid changes usually trigger a restart, but typing `rs` in the terminal ensures it.
- OR stop and run `npm run dev` again.

> **Note**: If you see `EADDRINUSE`, it means the server is already running! Just check your existing terminal.


## 3. Usage
You can now generate assessments via the API:
**POST** `http://localhost:5000/api/assessments/generate`
**Headers**: `Authorization: Bearer <your_token>`
**Body**:
```json
{
  "context": "Paste your syllabus or topic content here..."
}
```
