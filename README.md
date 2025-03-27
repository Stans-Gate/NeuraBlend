# NeuraBlend: AI-Powered Learning Assistant

![NeuraBlend Logo](/frontend/public/assets/neura.png)

## Overview

NeuraBlend is an AI-powered learning platform designed to create personalized study plans for students. The application leverages artificial intelligence to generate customized learning paths tailored to individual learning styles and goals.

## Features

- **AI-Generated Study Plans**: Create personalized study plans based on grade level, subject, and learning goals
- **Step-by-Step Learning**: Break down complex topics into manageable steps with guided resources
- **Interactive Quizzes**: Test knowledge with AI-generated quizzes at each learning step
- **Progress Tracking**: Monitor learning progress and achievements in the dashboard
- **Badge Collection**: Earn and purchase badges to showcase achievements
- **Gamified Learning**: Earn XP and Kudos for answering quiz questions correctly

## Tech Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **React Router**: For navigation and routing between different pages
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: For animations and transitions
- **Tailwind Components**: Custom components built with Tailwind classes

### Backend
- **FastAPI**: High-performance Python web framework for building the API
- **SQLAlchemy**: SQL toolkit and ORM for database interactions
- **SQLite**: Lightweight database for storing user data, study plans, and badges
- **OpenAI GPT**: For generating personalized study plans, quizzes, and learning resources

### Key Libraries
- **React Markdown**: For rendering markdown content from study plans
- **Remark GFM**: GitHub Flavored Markdown plugin for React Markdown
- **Framer Motion**: Animation library for React
- **Papa Parse**: CSV parsing library
- **React Icons**: Icon library for React

## Project Structure

```
neura-blend/
├── frontend/                # React frontend application
│   ├── public/              # Public assets
│   │   └── assets/          # Images, logos, and other static files
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       └── ui/              # UI utility components
│
├── backend/                 # FastAPI backend application
│   ├── api.py              # API endpoints
│   ├── database.py         # Database connection and session management
│   ├── models.py           # SQLAlchemy models
│   ├── openai_utils.py     # OpenAI integration utilities
│   └── init_badges.py      # Script to initialize badge data
```

## Application Workflow

1. **User Registration/Login**: Users create an account or log in with their username and email
2. **Dashboard**: Users can view their learning progress, XP, and Kudos
3. **Create Study Plan**: Users specify their grade level, subject, and learning goal to generate a personalized study plan
4. **Study Plan Execution**: Users work through the generated study plan step by step
5. **Knowledge Testing**: Each step includes a quiz to test understanding and earn XP/Kudos
6. **Badge Collection**: Users can spend Kudos to purchase achievement badges in the shop

## User Experience

- **Modern UI**: Clean, responsive interface designed with Tailwind CSS
- **Personalization**: AI-generated content tailored to individual learning needs
- **Gamification**: Points, badges, and achievements to motivate continued learning
- **Resource Integration**: Each learning step includes relevant resources or AI-generated materials

## Installation and Setup

### Prerequisites
- Node.js and npm
- Python 3.8+
- OpenAI API key

### Frontend Setup
1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```
   echo "OPENAI_API_KEY=your_openai_api_key" > .env
   ```
5. Initialize the database and badges:
   ```
   python init_badges.py
   ```
6. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

## Future Enhancements

- **Collaborative Learning**: Features for group study and peer-to-peer learning
- **Advanced Analytics**: Detailed insights into learning patterns and progress
- **Content Expansion**: More subjects, grade levels, and specialized learning tracks
- **Mobile App**: Native mobile application for on-the-go learning
- **AI Tutoring**: Real-time AI tutoring sessions with personalized feedback

## Contributors

- Joaquin Diaz - Graphical Designer
- Stan Chen - Full Stack Developer & Product Manager
- Sean Donovan - UI/UX Developer
- Sung - Korean Chad
- Oscar Mendez

## License

MIT License
