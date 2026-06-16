<table>
  <tr>
    <td>
      <h1>🧥 ClothShare</h1>
      <h3><i>Fashion with a Purpose. Warmth for Everyone.</i></h3>
      <p>ClothShare is a sustainable clothing donation platform designed to bridge the gap between people with excess clothing and those in need. By leveraging modern technology and AI, we make donating clothes simple, rewarding, and impactful.</p>
    </td>
    <td width="320" valign="top">
      <img src="certificate%20%26%20win.jpg" alt="Hackathon Certificate" width="320" style="border-radius: 8px; margin-top: 10px;"/>
    </td>
  </tr>
</table>

### 🎥 Project Demo

<video src="Project%20preview.mp4" width="100%" controls></video>

---
## 🌟 Key Features

### for Donors 🎁
- **Easy Donation Flow**: Upload photos of your clothes, add details (size, type, condition), and list them in seconds.
- **Bulk Uploads**: Donate multiple items at once to save time.
- **AI-Powered Analysis**: Our integrated AI (Google Gemini) analyzes your clothing images to automatically suggest titles, categories, and descriptions.
- **Gamification**: Earn **Points**, formatted **Badges** (e.g., "Generous Soul", "Eco Champion"), and **Level Up** from specific milestones.

### for Claimers & Donation Centers 🏢
- **Smart Browsing**: Filter items by type, size, gender, and condition.
- **AI Stylist**: Get outfit recommendations based on items you claim or upload.
- **Bulk Claiming Cart**: Select multiple items and claim them all at once.
- **Donation Center Dashboard**: Special interface for organizations to create **Bulk Requests** (e.g., "Need 50 Winter Jackets") and manage large-scale inventories.

### Impact Initiative ❤️
- **"Warmth for Every Child"**: A targeted initiative highlighting the need for kids' winter wear.
- **Transparent Tracking**: See your donation history and the impact you've made.

---

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Modern CSS3 with Glassmorphism design, Dark/Light mode compatible (Dark Glass theme default).
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage).
- **AI & ML**: 
  - **Google Gemini API**: For advanced image analysis and text generation.
  - **TensorFlow.js**: Client-side image classification fallbacks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm or yarn
- A Firebase Project (or use Demo Mode)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clothshare.git
   cd clothshare
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_key
   ```
   *Note: If no keys are provided, the app will run in **Demo Mode** with mock data.*

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Demo Mode

Don't have API keys handy? No problem! 
ClothShare includes a robust **Demo Mode** that mocks authentication, database operations, and typical user flows. 
- **Persisted Sessions**: Demo users are saved to local storage, so you can refresh the page without losing your progress.
- **Mock Data**: Pre-filled with sample clothing items so you can browse and claim immediately.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
