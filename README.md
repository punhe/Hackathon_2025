<<<<<<< HEAD
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run your project:**

### Prerequisites
- Node.js version 20.19+ or 22.12+ (required for Vite compatibility)
- npm package manager
- Modern web browser with JavaScript enabled

### Installation Steps
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd web-track-naver-vietnam-ai-hackathon-punhe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Firebase and Gemini AI API configurations

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5174`

### Build for Production
```bash
npm run build
npm run preview
```

## 🔗 Deployed Web URL or APK file
✍️ [Paste your link here]


## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ [Paste your video link here]


## 💻 Project Introduction

### a. Overview

**TaskTrack** is an intelligent task management application that combines the simplicity of a todo list with the power of AI-driven productivity features. Built for the NAVER Vietnam AI Hackathon 2025, TaskTrack revolutionizes how users organize, schedule, and manage their daily tasks through seamless integration of artificial intelligence and intuitive design.

The application features a beautiful red-themed interface that provides both traditional task management and Google Calendar-style scheduling capabilities. Users can create, organize, and prioritize tasks while leveraging AI assistance for intelligent task breakdown and smart scheduling across multiple days.

### b. Key Features & Function Manual

#### 🎯 **Dual-Tab Interface**
- **All Tasks Tab**: Traditional task management with AI-powered categorization and priority detection
- **Schedule Tab**: Google Calendar-like monthly view for visual task scheduling

#### 🤖 **AI-Powered Features**
- **Smart Task Breakdown**: Automatically analyzes user input and breaks complex tasks into actionable subtasks
- **AI Support Scheduler**: Intelligently distributes work across multiple days with optimal time suggestions
- **Automatic Categorization**: AI categorizes tasks (work, personal, shopping, etc.) and assigns priority levels

#### 📅 **Calendar Functionality**
- **Drag & Drop**: Move tasks between dates with smooth animations and visual feedback
- **CRUD Operations**: Create, read, update, and delete events with intuitive modals
- **Time Scheduling**: Optional time assignments for precise task planning
- **Visual Indicators**: Color-coded events with overflow handling for busy days

#### 🔐 **User Management**
- **Firebase Authentication**: Secure login/registration with username support
- **Personal Data**: Each user's tasks are private and securely stored
- **Profile Management**: Customizable user profiles with display names

#### 🎨 **User Experience**
- **Smooth Animations**: Comprehensive loading states and transitions throughout the app
- **Anti-Jank System**: Skeleton loading and preloader prevent layout shifts during page refresh
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Consistent Theme**: Beautiful red gradient theme across all components

### c. Unique Features (What’s special about this app?) 

#### 🚀 **AI-First Approach**
Unlike traditional task managers, TaskTrack puts AI at the center of the user experience. The moment users type a task, AI automatically suggests improvements, breaks down complex projects, and recommends optimal scheduling.

#### 🎯 **Intelligent Task Distribution**
The AI Support feature is particularly innovative - users can describe a large project, specify a timeframe, and watch as AI intelligently breaks it down into manageable daily tasks with realistic time estimates and logical progression.

#### 🎨 **Seamless Design Integration**
TaskTrack doesn't just add AI as an afterthought. The AI features are beautifully integrated into the UI with smooth animations, progress indicators, and visual feedback that makes AI assistance feel natural and intuitive.

#### 📱 **Google Calendar UX with Todo Simplicity**
The dual-tab interface gives users the best of both worlds - simple task lists for quick capture and powerful calendar views for visual planning, all with drag-and-drop functionality that feels familiar yet enhanced.

#### ⚡ **Performance-First Architecture**
Every interaction is optimized for smoothness with comprehensive loading states, skeleton placeholders, and animation systems that prevent UI jank and provide professional-grade user experience.

### d. Technology Stack and Implementation Methods

#### **Frontend Framework**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling and responsive design

#### **AI Integration**
- **Google Gemini AI** for intelligent task analysis, categorization, and scheduling
- **Custom AI Prompts** optimized for task management and productivity scenarios
- **Fallback Systems** for graceful degradation when AI services are unavailable

#### **Backend Services**
- **Firebase Authentication** for secure user management and session handling
- **Firestore Database** for real-time data synchronization and offline support
- **Firebase Security Rules** for data privacy and user isolation

#### **UI/UX Libraries**
- **Lucide React** for consistent iconography
- **Custom CSS Animations** with keyframes and cubic-bezier transitions
- **Responsive Grid System** for calendar layout and task organization

#### **State Management**
- **React Hooks** (useState, useEffect, useMemo) for local component state
- **Context API** for global authentication state
- **Real-time Listeners** for live data updates from Firestore

### e. Service Architecture & Database structure (when used)

#### **Client-Side Architecture**
```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx        # Authentication forms
│   ├── Calendar.tsx    # Calendar grid and scheduling
│   ├── AddTodo.tsx     # Task creation with AI
│   └── AISupportModal.tsx # AI scheduling assistant
├── config/             # Configuration and services
│   ├── firebase.ts     # Firebase setup and exports
│   └── gemini.ts       # AI service integration
├── services/           # Business logic layer
│   └── todoService.ts  # CRUD operations for tasks
└── App.tsx            # Main application component
```

#### **Firebase Database Schema**
```javascript
// Firestore Collections
todos: {
  [docId]: {
    id: string,
    text: string,
    completed: boolean,
    category: string,
    priority: 'low' | 'medium' | 'high',
    userId: string,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    scheduledDate?: Timestamp,  // For calendar events
    scheduledTime?: string      // Optional time
  }
}

users: {
  [userId]: {
    displayName: string,
    email: string,
    createdAt: Timestamp
  }
}
```

#### **API Integration Flow**
1. **User Authentication**: Firebase Auth handles login/registration
2. **Task Creation**: AI analyzes input → Firestore stores result
3. **Real-time Updates**: Firestore listeners update UI automatically
4. **AI Processing**: Gemini API calls for task breakdown and scheduling
5. **Data Persistence**: All user data synced across devices via Firebase

## 🧠 Reflection

### a. If you had more time, what would you expand?

#### **Enhanced AI Capabilities**
I would love to implement **AI-powered productivity insights** that analyze user patterns and suggest optimal work schedules. Imagine the app learning when you're most productive and automatically suggesting the best times for different types of tasks.

#### **Collaboration Features**
Adding **team workspace functionality** would be amazing - shared calendars, task delegation, and real-time collaboration with AI that understands team dynamics and suggests optimal task distribution among team members.

#### **Mobile Application**
Developing a **native mobile app** with offline-first capabilities would make TaskTrack truly portable. Push notifications for scheduled tasks and AI-suggested break times would enhance the mobile experience.

#### **Advanced Calendar Features**
- **Multi-calendar support** for work/personal separation
- **Recurring tasks** with intelligent AI adjustments
- **Integration with external calendars** (Google Calendar, Outlook)
- **Time tracking** with AI-powered productivity analytics

#### **Gamification Elements**
Implementing **productivity streaks, achievement badges, and AI-powered challenges** could make task management more engaging and motivating for users.

### b. If you integrate AI APIs more for your app, what would you do?

#### **Multi-Modal AI Integration**
- **Voice-to-Task**: Integrate speech recognition so users can verbally describe tasks while commuting or multitasking
- **Image Recognition**: Allow users to take photos of handwritten notes or whiteboards and automatically convert them to structured tasks
- **Document Analysis**: Upload PDFs or documents and have AI extract actionable tasks and deadlines

#### **Predictive Intelligence**
- **Smart Deadline Prediction**: AI that learns from your completion patterns and suggests realistic deadlines
- **Workload Balancing**: Automatically detect when you're overcommitted and suggest task rescheduling or delegation
- **Productivity Forecasting**: Predict your energy levels and suggest optimal task scheduling based on historical data

#### **Contextual AI Assistant**
- **Location-Aware Tasks**: AI that suggests location-based tasks ("You're near the grocery store, here are your shopping tasks")
- **Weather-Sensitive Planning**: Automatically adjust outdoor tasks based on weather forecasts
- **Calendar Integration**: AI that reads your existing calendar and finds optimal slots for new tasks

#### **Advanced Natural Language Processing**
- **Conversational Task Management**: Chat with AI to refine and organize tasks naturally
- **Sentiment Analysis**: Detect stress levels in task descriptions and suggest workload adjustments
- **Multi-Language Support**: AI that works seamlessly across Vietnamese, English, and other languages

#### **Ecosystem Integration**
- **Email Integration**: AI that scans emails and suggests tasks from action items
- **Slack/Teams Bots**: AI assistant that works within existing workflow tools
- **IoT Integration**: Smart home integration for location-based task reminders

#### **Personalized AI Models**
Implementing **user-specific AI fine-tuning** where the AI learns each individual's work patterns, preferences, and productivity habits to provide increasingly personalized suggestions over time.

The vision is to create an AI that doesn't just manage tasks but becomes a true **productivity partner** that understands your life, anticipates your needs, and actively helps you achieve your goals more efficiently.


## ✅ Checklist
- [✅] Code runs without errors  
- [✅] All required features implemented (add/edit/delete/complete tasks)  
- [✅] All ✍️ sections are filled  
=======
# Hackathon_2025
>>>>>>> 01ead63502d5f209eea161b85cf9db93c0b8324e
