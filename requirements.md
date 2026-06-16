# System Requirements Specification (SRS) for ClothShare

## 1. Introduction
This document outlines the software and hardware requirements necessary to develop, deploy, and run the ClothShare application.

## 2. Technical Requirements

### 2.1 Backend / Infrastructure
- **Firebase Project**:
  - **Authentication**: Email/Password provider enabled.
  - **Firestore Database**: For storing user profiles, donations, bulk requests, and claims.
  - **Storage**: For hosting user-uploaded clothing images.
- **Google Cloud AI**:
  - **Gemini API Access**: Required for the "AI Stylist" and "Auto-Description" features.

### 2.2 Frontend Environment
- **Node.js**: Version 18.0.0 or higher recommended (LTS).
- **Package Manager**: `npm` (v9+) or `yarn`.
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

## 3. Functional Requirements

### 3.1 User Authentication
- The system must allow users (Individuals and Organizations) to Sign Up and Login.
- Support for "Demo Mode" fallback when external services (Firebase) are unavailable.
- User sessions must be persisted across page reloads.

### 3.2 Donation Management
- Users can create new donation listings including:
  - **Image**: Upload capability (single or bulk).
  - **Metadata**: Title, Type, Size, Condition, Gender, Quantity.
- **AI Analysis**: System should optionally analyze images to pre-fill metadata.

### 3.3 Claiming & Inventory
- Users can browse available donations with filters (Size, Type, Condition).
- **Cart System**: Users can add multiple items to a cart and claim them in a single transaction.
- **Inventory Tracking**: Claiming items must automatically deduct quantity or mark items as "Claimed".

### 3.4 Gamification
- The system must track user contributions.
- **Points**: Awarded for Donations (10pts) and Claims (5pts).
- **Levels**: Users progress through levels (Newcomer -> Champion) based on points.
- **Badges**: visual awards for specific milestones.

### 3.5 Donation Center Features
- Dedicated dashboard for "Donation Center" user type.
- Ability to select high volumes of items and claim efficiently.
- **Bulk Requests**: Ability to post "Requests" for specific needs (e.g., "50 Winter Coats").

## 4. Non-Functional Requirements

### 4.1 Performance
- **Image Optimization**: Images should be loaded lazily or optimized to prevent layout shift.
- **Responsive UI**: The application must be fully functional on Mobile (375px width) and Desktop (1920px width).

### 4.2 Error Handling
- The system must fail gracefully if API keys are missing (automatically switching to Demo Mode).
- User feedback must be provided for all major actions (Success alerts, Error toasts).

## 5. Development Dependencies
(See `package.json` for exact versions)
- `react`, `react-dom`: Core UI framework.
- `react-router-dom`: Client-side routing.
- `firebase`: SDK for backend services.
- `@google/generative-ai`: Client library for Gemini API.
- `@tensorflow/tfjs`, `@tensorflow-models/mobilenet`: Fallback image classification.
- `vite`: Build tool and dev server.
