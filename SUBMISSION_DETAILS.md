# Project Submission Details

Here is the complete content formatted for your submission.

## README.md Content
```markdown
# 🧥 ClothShare
### *Fashion with a Purpose. Warmth for Everyone.*

ClothShare is a sustainable clothing donation platform designed to bridge the gap between people with excess clothing and those in need. By leveraging modern technology and AI, we make donating clothes simple, rewarding, and impactful.

## Features
- **Easy Donation Flow**: Upload photos of your clothes, add details (size, type, condition), and list them in seconds.
- **Bulk Uploads**: Donate multiple items at once to save time.
- **AI-Powered Analysis**: Our integrated AI (Google Gemini) analyzes your clothing images to automatically suggest titles, categories, and descriptions.
- **Gamification**: Earn **Points**, formatted **Badges** (e.g., "Generous Soul", "Eco Champion"), and **Level Up** from specific milestones.
- **Smart Browsing**: Filter items by type, size, gender, and condition.
- **AI Stylist**: Get outfit recommendations based on items you claim or upload.
- **Bulk Claiming Cart**: Select multiple items and claim them all at once.
- **Donation Center Dashboard**: Special interface for organizations to create **Bulk Requests** and manage large-scale inventories.
- **"Warmth for Every Child"**: A targeted initiative highlighting the need for kids' winter wear.

## Technologies Used
React, Vite, Firebase (Auth, Firestore, Storage), Google Gemini API, TensorFlow.js, CSS3 (Glassmorphism), Context API

## Project Structure
src/
  ├── components/   # Reusable UI components (ClothingCard, CartDrawer, etc.)
  ├── context/      # Global state (AuthContext, CartContext)
  ├── pages/        # Application routes (Home, Donate, Claim, Profile, etc.)
  ├── services/     # API integrations (Firebase, Gemini AI)
  ├── styles/       # Global CSS and design tokens
  └── utils/        # Helper functions

## Team Members
- [Member 1 Name]
- [Member 2 Name]
```

## .env File Content
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key_here
```
*(Note: If these are left empty, the application will automatically run in **Demo Mode**, which is safe for evaluation)*

## Tech Stack
React, Vite, Node.js, Firebase Authentication, Firebase Firestore, Firebase Storage, Google Gemini AI (Generative AI), TensorFlow.js, CSS3, React Router DOM

## How to Run

**Step 1:** Clone the repository or extract the ZIP file.
**Step 2:** Navigate to the project directory:
   ```bash
   cd clothshare
   ```
**Step 3:** Install dependencies:
   ```bash
   npm install
   ```
**Step 4:** Set up environment variables:
   - Create a `.env` file in the root directory.
   - Copy the content from the ".env File Content" section above.
   - Fill in your API keys OR leave them blank to use **Demo Mode** (recommended for quick testing).
**Step 5:** Start the development server:
   ```bash
   npm run dev
   ```
**Step 6:** Open your browser and navigate to `http://localhost:5173`.
**Step 7:** Your application should now be running! 
   - You can Sign Up or Login.
   - In Demo Mode, data persists in your browser's Local Storage.

## Build/Installation Commands
```bash
npm install
# To build for production:
npm run build
```

## Start Commands
```bash
npm run dev
```

## Other Necessary Details

**1. Special Configurations: Demo Mode**
The application includes a robust "Demo Mode" fallback. If Firebase/Gemini API keys are missing or invalid, the app automatically switches to using local mock data.
- **Persisted Sessions**: "Demo Users" are saved to LocalStorage, so refreshing the page doesn't log you out.
- **Separate Profiles**: Authentication is simulated; logging in with different emails creates distinct profiles with their own separate data.

**2. External Services**
- **Google Gemini API**: Used for analyzing clothing images to auto-generate titles and descriptions.
- **Firebase**: Handles real-time database updates and user authentication.
- **TensorFlow.js**: Provides client-side fallback image classification.

**3. Known Issues/Limitations**
- In Demo Mode, image uploads use local Object URLs (blobs) which may expire if the browser session is cleared. Real deployments use Firebase Storage.
