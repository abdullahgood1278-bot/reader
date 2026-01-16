# Speed Reader - RSVP Reading Application

A full-featured speed reading web application with book uploads, RSVP (Rapid Serial Visual Presentation) flashing, user accounts, and advanced reading features.

## Features

### Core Features
- **📚 Book Upload & Format Support**
  - Support for PDF, EPUB, TXT, DOC, DOCX formats
  - Automatic text extraction with quality preview
  - File validation and error handling

- **⚡ Speed Reading Engine**
  - Adjustable word-per-minute (WPM) from 100 to 1000+ WPM
  - Default start at 300 WPM
  - One red letter per word (customizable position: first, middle, random, or last)
  - Smooth word transitions with minimal visual jitter
  - Keyboard controls: Space (play/pause), arrow keys (speed/navigation), +/- (fine-tuning)

- **👤 User Accounts & Progress**
  - User registration and authentication with JWT
  - Track reading progress per book (position, time spent)
  - Reading history with timestamps
  - Continue reading from last position
  - Bookmark/favorite books and passages

- **🎨 Dynamic Book-Related Backgrounds**
  - Generate beautiful, artistic backgrounds related to each book's content/genre
  - Book genre detection (sci-fi, fantasy, romance, mystery, etc.) with matching visual themes
  - Gradient overlays with customizable intensity
  - Option for users to customize background overlay intensity
  - Genre-specific color schemes

### Enhanced Features
- **🎯 Reading Experience**
  - Adjustable font size (accessibility)
  - Dark mode and customizable themes
  - Customizable text color, background color, highlight color
  - Pause on punctuation (slight pause at periods/commas)
  - Word count display and reading time estimates

- **📊 Statistics & Analytics**
  - Words read per session
  - Average reading speed
  - Total time spent reading
  - Books completed count
  - Reading streaks (consecutive days)
  - Daily/weekly reading goals and progress

- **🎮 Navigation & Control**
  - Progress bar showing position in book
  - Skip ahead/back functionality
  - Session history and resume options
  - Real-time WPM adjustment

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Multer for file uploads
- Text extraction: pdf-parse, epub, mammoth, tesseract.js
- Natural language processing for genre detection

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Axios for API calls
- Lucide React for icons

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd reader
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**

Create a PostgreSQL database:
```bash
createdb speedreader
```

Configure database connection in `backend/.env`:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

4. **Configure environment variables**

Backend (`backend/.env`):
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speedreader
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
UNSPLASH_ACCESS_KEY=your-unsplash-key (optional)
```

Frontend (`frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
```

5. **Start the application**

Development mode (runs both backend and frontend):
```bash
npm run dev
```

Or run separately:
```bash
# Backend
npm run dev:backend

# Frontend (in another terminal)
npm run dev:frontend
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Usage

### Getting Started

1. **Register an account** at `/register`
2. **Upload a book** - Supported formats: PDF, EPUB, TXT, DOC, DOCX
3. **Start reading** - Click on a book to begin speed reading
4. **Customize your experience** - Adjust WPM, themes, and preferences

### Keyboard Controls (while reading)

- `Space` - Play/Pause
- `Arrow Up` - Increase speed by 50 WPM
- `Arrow Down` - Decrease speed by 50 WPM
- `Arrow Right` - Skip forward one word
- `Arrow Left` - Go back one word
- `+` or `=` - Increase speed by 10 WPM
- `-` - Decrease speed by 10 WPM
- `Esc` - Exit reader

## Project Structure

```
reader/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── migrations/      # Database schema
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   ├── uploads/             # Temporary file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # State management
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
└── package.json             # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Books
- `POST /api/books/upload` - Upload a new book
- `GET /api/books` - Get all books for user
- `GET /api/books/:id` - Get specific book with content
- `DELETE /api/books/:id` - Delete a book
- `PUT /api/books/:id/progress` - Update reading progress

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

### Statistics
- `GET /api/statistics` - Get user statistics
- `POST /api/statistics/sessions` - Create reading session
- `POST /api/statistics/goals` - Create reading goal
- `PUT /api/statistics/goals/:id` - Update goal progress

### Bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks` - Get bookmarks
- `DELETE /api/bookmarks/:id` - Delete bookmark

## Features in Detail

### Genre Detection
The application automatically detects book genres based on content analysis:
- Fantasy, Sci-Fi, Mystery, Romance, Thriller, Horror
- Historical, Biography, Self-Help, Business
- Generates appropriate background themes for each genre

### Background Themes
Each book gets a unique background theme based on its genre:
- Gradient-based color schemes
- Optional Unsplash image integration
- Customizable overlay intensity
- Smooth, non-distracting animations

### Reading Statistics
Track your reading journey:
- Total words read
- Books completed
- Reading time
- Average WPM
- Current and longest reading streaks
- Session history

## Deployment

### Quick Start - Deploy to Production

Deploy your Speed Reader app to production in under 30 minutes:

**Frontend**: Vercel (Global CDN, automatic HTTPS)  
**Backend**: Railway (Easy deployment, PostgreSQL included)

```bash
# See the quick start guide
cat VERCEL_QUICKSTART.md
```

**📚 Deployment Guides:**
- **[VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)** - Deploy in 30 minutes (recommended)
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Environment variables reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Alternative deployment platforms

### Local Production Build

Build for production locally:

```bash
npm run build
```

Run production build:

```bash
npm start
```

## Development

### Development Commands

```bash
# Run both backend and frontend in development mode
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build

# Run production build
npm start

# Verify setup
npm run verify
```

### Helper Scripts

```bash
# Production deployment helper
./deploy-production.sh

# Quick setup
./quickstart.sh
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Text extraction libraries: pdf-parse, epub, mammoth
- UI components: Lucide React icons
- State management: Zustand
- Styling: Tailwind CSS

## Support

For issues, questions, or contributions, please open an issue on GitHub.
