# Enhanced Speed Reader - Full Setup Guide

## Overview
This is a comprehensive speed reading application with advanced features including RSVP reading, book uploads, user accounts, bookmark management, reading goals, and complete customization options.

## ✨ New Features Added

### 🎯 Complete Settings Management
- **Reading Speed Control**: Adjustable WPM from 100-1000+ with fine-tuning
- **Visual Customization**: Font size, red letter position, color schemes
- **Theme Support**: Dark mode, light mode, sepia, ocean blue, forest themes
- **Punctuation Pauses**: Optional extra pauses at periods and commas
- **Background Overlay**: Adjustable intensity for optimal reading experience

### 📖 Bookmark Management
- **Create Bookmarks**: Save current reading position with optional notes
- **Navigate**: Jump directly to bookmarked positions
- **Edit/Delete**: Full CRUD operations for bookmarks
- **Progress Visualization**: Visual progress bars for bookmark positions

### 🎯 Reading Goals System
- **Multiple Goal Types**: Words per day/week, books per month, minutes per day
- **Progress Tracking**: Real-time progress updates
- **Goal Management**: Create, edit, delete goals
- **Status Indicators**: Completed, expired, and active goal states

### 🌙 Enhanced Dark/Light Mode
- **Smooth Transitions**: Animated theme switching
- **Consistent Styling**: Both dark and light modes across all components
- **Settings Integration**: Theme preferences saved to user profile

### ⚡ Enhanced Reader Experience
- **Inline Controls**: Access bookmarks, settings, and goals directly from reader
- **Keyboard Shortcuts**: Complete keyboard navigation support
- **Session Tracking**: Real-time words read and reading statistics
- **Visual Feedback**: Progress bars, time estimates, and reading stats

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb speedreader
```

3. **Configure Environment Variables**

Backend (`.env`):
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speedreader
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
UNSPLASH_ACCESS_KEY=your-unsplash-api-key-here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

4. **Start the Application**

Development mode:
```bash
npm run dev
```

Or run separately:
```bash
# Backend (port 3001)
npm run dev:backend

# Frontend (port 3000)
npm run dev:frontend
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## 📖 Usage Guide

### Getting Started

1. **Register an Account**
   - Visit http://localhost:3000
   - Create a new account with email and username

2. **Upload Your First Book**
   - Click "Choose File" in the dashboard
   - Supported formats: PDF, EPUB, TXT, DOC, DOCX
   - Files are automatically processed and genre-detected

3. **Start Reading**
   - Click "Start Reading" on any book
   - Use spacebar to play/pause
   - Adjust speed with arrow keys or +/- keys

### Settings & Customization

1. **Access Settings**
   - Click the settings button in the reader
   - Or use the Settings tab in the dashboard

2. **Customize Reading Experience**
   - Adjust default WPM (100-1000+)
   - Choose font size (24-96px)
   - Select red letter position (first, middle, last, random)
   - Pick color themes or create custom colors
   - Enable/disable punctuation pauses
   - Adjust background overlay intensity

3. **Switch Dark/Light Mode**
   - Use the sun/moon toggle in the navigation
   - Theme preference is saved automatically

### Bookmarks

1. **Create Bookmarks**
   - Click the bookmark icon in the reader
   - Add optional notes for context
   - Bookmarks are saved automatically

2. **Manage Bookmarks**
   - View all bookmarks for current book
   - Click any bookmark to jump to that position
   - Edit or delete bookmarks as needed

### Reading Goals

1. **Create Goals**
   - Click "Goals" in the navigation or reader
   - Choose goal type (words, books, time)
   - Set target values and time periods

2. **Track Progress**
   - Goals show real-time progress
   - Visual progress bars with percentages
   - Status indicators (active, completed, expired)

### Keyboard Controls (While Reading)

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `↑` | Increase speed (+50 WPM) |
| `↓` | Decrease speed (-50 WPM) |
| `→` | Next word |
| `←` | Previous word |
| `+` / `=` | Fine increase (+10 WPM) |
| `-` | Fine decrease (-10 WPM) |
| `Esc` | Exit reader |

## 🏗️ Technical Architecture

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with comprehensive schema
- **JWT Authentication** with refresh tokens
- **File Processing**: pdf-parse, epub, mammoth, tesseract.js
- **Genre Detection**: Natural language processing
- **Background Generation**: Genre-based themes + Unsplash integration

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Framer Motion** for smooth animations

### Database Schema
- Users and authentication
- Books and reading progress
- Reading sessions and statistics
- Bookmarks and user preferences
- Reading goals and progress tracking

## 🎨 Design Features

### Visual Themes
- **Genre-Based Backgrounds**: Automatic theme generation based on book genre
- **Custom Color Schemes**: 5 preset themes + custom color picker
- **Dark/Light Mode**: Complete theme support with smooth transitions
- **Responsive Design**: Works on desktop and tablet

### User Experience
- **Smooth Animations**: All transitions use Framer Motion
- **Loading States**: Proper loading indicators for all async operations
- **Error Handling**: Comprehensive error messages and validation
- **Accessibility**: Keyboard navigation and screen reader support

## 📊 Analytics & Progress

### Reading Statistics
- Total words read
- Books completed
- Total reading time
- Average reading speed
- Reading streaks (current and longest)
- Recent session history

### Goal Tracking
- Daily, weekly, monthly goals
- Progress visualization
- Goal completion tracking
- Historical goal data

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Run both backend and frontend
npm run dev:backend  # Run backend only
npm run dev:frontend # Run frontend only
npm run build        # Build for production
npm run start        # Start production server
```

### Code Structure
```
/home/engine/project/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/  # Authentication middleware
│   │   ├── migrations/  # Database schema
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Text extraction, genre detection
│   └── uploads/         # Temporary file storage
└── frontend/         # React SPA
    └── src/
        ├── components/  # React components
        │   ├── Reader/   # RSVP reading components
        │   ├── Settings/ # Settings management
        │   └── Goals/    # Goals management
        ├── pages/        # Page components
        ├── services/     # API client
        ├── stores/       # Zustand stores
        └── types/        # TypeScript types
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Update database credentials for production
- Set secure JWT secret
- Configure file upload limits
- Set up SSL certificates
- Configure reverse proxy (nginx)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Books
- `POST /api/books/upload` - Upload new book
- `GET /api/books` - Get all books for user
- `GET /api/books/:id` - Get specific book
- `DELETE /api/books/:id` - Delete book
- `PUT /api/books/:id/progress` - Update reading progress

### Settings
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Statistics
- `GET /api/statistics` - Get user statistics
- `POST /api/statistics/sessions` - Create reading session
- `POST /api/statistics/goals` - Create reading goal
- `GET /api/statistics/goals` - Get all goals
- `PUT /api/statistics/goals/:id` - Update goal progress
- `PUT /api/statistics/goals/:id/update` - Update goal details
- `DELETE /api/statistics/goals/:id` - Delete goal

### Bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks` - Get bookmarks
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure supported file formats

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

## 📈 Future Enhancements

### Potential Additions
- **Comprehension Quizzes**: Test understanding after chapters
- **Social Features**: Share reading progress with friends
- **Vocabulary Helper**: Click for word definitions
- **Reading Analytics**: Detailed reading pattern analysis
- **Mobile App**: React Native version
- **Cloud Sync**: Cross-device synchronization
- **Export Features**: Download reading statistics
- **AI Recommendations**: Personalized book suggestions

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Text extraction libraries: pdf-parse, epub, mammoth
- UI components: Lucide React icons
- State management: Zustand
- Styling: Tailwind CSS
- Background images: Unsplash API (optional)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.