# Development Guide

## Project Architecture

### Overview
Speed Reader is a monorepo containing a React frontend and Node.js/Express backend, connected to a PostgreSQL database.

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  PostgreSQL  │
│  React/Vite │      │  Express/TS │      │   Database   │
└─────────────┘      └─────────────┘      └──────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router (routing)
- Axios (HTTP client)

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (database)
- JWT (authentication)
- Multer (file uploads)
- pdf-parse, epub, mammoth (text extraction)

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection and query helper
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── bookController.ts    # Book CRUD operations
│   │   ├── bookmarkController.ts
│   │   ├── preferencesController.ts
│   │   └── statisticsController.ts
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── migrations/
│   │   └── init.sql             # Database schema
│   ├── routes/
│   │   └── index.ts             # API route definitions
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── textExtractor.ts     # Extract text from various formats
│   │   └── genreDetector.ts     # Detect book genre using NLP
│   └── index.ts                 # Application entry point
├── uploads/                     # Temporary file storage
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── Reader/
│   │       └── RSVPReader.tsx   # Main reading component
│   ├── pages/
│   │   └── Dashboard.tsx        # Main dashboard
│   ├── services/
│   │   └── api.ts               # API client configuration
│   ├── stores/
│   │   ├── authStore.ts         # Authentication state
│   │   └── readerStore.ts       # Reading state
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
└── package.json
```

## Key Components

### 1. RSVP Reading Engine (`RSVPReader.tsx`)

The core reading engine that displays words one at a time:

**Key Features:**
- Adjustable WPM (words per minute)
- Red letter highlighting (configurable position)
- Pause on punctuation
- Keyboard controls
- Progress tracking
- Session management

**Implementation Details:**
- Uses `setTimeout` for word timing
- Calculates delay based on WPM and punctuation
- Saves progress to database on pause/exit
- Creates reading sessions for statistics

### 2. Text Extraction (`textExtractor.ts`)

Extracts text from various file formats:

**Supported Formats:**
- PDF: Uses `pdf-parse` library
- EPUB: Uses `epub` library
- DOCX: Uses `mammoth` library
- TXT: Direct file reading

**Process:**
1. Receive uploaded file
2. Determine file type
3. Extract raw text
4. Clean and normalize text
5. Count words
6. Extract metadata (title, author)

### 3. Genre Detection (`genreDetector.ts`)

Automatically detects book genre:

**Algorithm:**
1. Tokenize sample text (first 5000 chars)
2. Match against keyword dictionaries
3. Score each genre based on keyword frequency
4. Select highest scoring genre
5. Generate appropriate background theme

**Genres Supported:**
- Fantasy, Sci-Fi, Mystery, Romance
- Thriller, Horror, Historical, Biography
- Self-Help, Business, General

### 4. Authentication Flow

**Registration:**
```
User Input → Validation → Hash Password → Create User → 
Create Preferences → Create Statistics → Generate JWT → Return Token
```

**Login:**
```
User Input → Find User → Verify Password → Generate JWT → Return Token
```

**Protected Routes:**
```
Request → Extract JWT → Verify Token → Attach User → Continue
```

### 5. Reading Progress Tracking

**Session Flow:**
```
Start Reading → Create Session → Track Words → Update Progress → 
End Session → Save Statistics → Update Streak
```

**Data Tracked:**
- Current word position
- Words read in session
- Average WPM
- Time spent
- Last read date (for streaks)

## Database Schema

### Key Tables

**users:**
- Core user information
- Authentication credentials

**books:**
- Book metadata
- Full text content
- Genre and background theme

**reading_progress:**
- Current position per book
- Completion status
- Last read timestamp

**reading_sessions:**
- Historical reading sessions
- Statistics per session

**user_statistics:**
- Aggregate user stats
- Reading streaks
- Total metrics

**user_preferences:**
- Reading preferences
- UI customization
- Default settings

## API Design

### RESTful Principles
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- JSON responses
- Error handling with meaningful messages

### Authentication
- JWT tokens in Authorization header
- Format: `Bearer <token>`
- Token expires after 24 hours (configurable)

### Example Request Flow

**Upload Book:**
```
POST /api/books/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData with file

Response:
{
  "message": "Book uploaded successfully",
  "book": {
    "id": 1,
    "title": "Example Book",
    "genre": "fantasy",
    "word_count": 50000,
    ...
  }
}
```

## State Management

### Zustand Stores

**authStore:**
- User authentication state
- Login/logout functions
- Token management

**readerStore:**
- Current book
- Reading position
- WPM settings
- Session tracking

**Benefits:**
- Simple API
- No boilerplate
- TypeScript support
- React hooks integration

## Development Workflow

### 1. Starting Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Or use root command
npm run dev  # Runs both concurrently
```

### 2. Making Changes

**Backend Changes:**
- Edit TypeScript files in `backend/src/`
- `ts-node-dev` automatically restarts server
- Check terminal for errors

**Frontend Changes:**
- Edit React files in `frontend/src/`
- Vite Hot Module Replacement (HMR) updates instantly
- Check browser console for errors

### 3. Database Changes

**Modify Schema:**
1. Edit `backend/src/migrations/init.sql`
2. Recreate database or run migration
3. Restart backend

**Reset Database:**
```bash
psql -d speedreader -f backend/src/migrations/init.sql
```

### 4. Adding New Features

**Backend Endpoint:**
1. Create/update controller in `controllers/`
2. Add route in `routes/index.ts`
3. Update types in `types/index.ts`
4. Test with Postman/curl

**Frontend Feature:**
1. Create/update component
2. Add to routing if needed
3. Update state stores if needed
4. Style with Tailwind

## Testing Strategy

### Backend Testing
- Unit tests for utilities
- Integration tests for API endpoints
- Database tests with test database

### Frontend Testing
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright/Cypress

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Book upload (all formats)
- [ ] RSVP reading
- [ ] WPM adjustment
- [ ] Progress saving
- [ ] Statistics accuracy
- [ ] Keyboard controls
- [ ] Mobile responsiveness

## Performance Considerations

### Backend
- Database query optimization
- Connection pooling
- File upload streaming
- Caching strategies

### Frontend
- Code splitting
- Lazy loading
- Memoization
- Optimistic updates

### Reading Engine
- Precise timing with requestAnimationFrame
- Minimal re-renders
- Efficient state updates
- Background loading

## Common Development Tasks

### Add New Book Format

1. Install parser library: `npm install <parser>`
2. Add extraction method in `textExtractor.ts`
3. Update file filter in `routes/index.ts`
4. Test with sample file

### Add New API Endpoint

1. Create controller method
2. Add route in `routes/index.ts`
3. Update frontend API service
4. Add TypeScript types
5. Test endpoint

### Add New User Preference

1. Add column to `user_preferences` table
2. Update TypeScript types
3. Add to preferences controller
4. Update frontend preferences store
5. Add UI control

## Debugging Tips

### Backend Debugging
- Check console logs for database queries
- Use debugger statements
- Inspect request/response in Network tab
- Check PostgreSQL logs

### Frontend Debugging
- React DevTools for component inspection
- Redux DevTools for Zustand
- Network tab for API calls
- Console logs for state changes

### Common Issues

**Database Connection Failed:**
- Check PostgreSQL is running
- Verify credentials in .env
- Check database exists

**File Upload Failed:**
- Check file size limit
- Verify file type allowed
- Check uploads directory exists
- Review Multer configuration

**Authentication Failed:**
- Check JWT_SECRET is set
- Verify token not expired
- Check Authorization header format

## Production Deployment

### Environment Variables
- Set strong JWT secrets
- Configure production database
- Set NODE_ENV=production
- Configure CORS properly

### Build Process
```bash
# Build both
npm run build

# Or separately
cd backend && npm run build
cd frontend && npm run build
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] File storage configured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Error monitoring set up
- [ ] Backups configured

## Resources

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Getting Help

- Check existing GitHub issues
- Read the documentation
- Ask in discussions
- Contact maintainers
