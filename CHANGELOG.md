# Changelog

All notable changes to Speed Reader will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-16

### Initial Release 🎉

### Added

#### Core Features
- **User Authentication System**
  - User registration with email, username, and password
  - Secure login with JWT tokens
  - Token-based authentication for API endpoints
  - Password hashing with bcrypt
  - Session management

- **Book Upload & Management**
  - Support for multiple file formats: PDF, EPUB, TXT, DOC, DOCX
  - Automatic text extraction from uploaded files
  - Book metadata extraction (title, author)
  - Word count calculation
  - File size validation (up to 50MB)
  - Book library management (view, delete)

- **RSVP Reading Engine**
  - Rapid Serial Visual Presentation (RSVP) word flashing
  - Adjustable reading speed: 100-1000+ WPM
  - Default starting speed: 300 WPM
  - Red letter highlighting with configurable position (first, middle, last, random)
  - Smooth word transitions
  - Minimal visual jitter

- **Keyboard Controls**
  - `Space` - Play/Pause
  - `Arrow Up/Down` - Adjust speed by 50 WPM
  - `Arrow Left/Right` - Navigate words
  - `+/-` - Fine-tune speed by 10 WPM
  - `Esc` - Exit reader

- **Reading Progress Tracking**
  - Save current reading position per book
  - Resume reading from last position
  - Track completion status
  - Last read timestamp
  - Continue reading option

- **Dynamic Book-Related Backgrounds**
  - Automatic genre detection using NLP
  - Genre-specific gradient themes
  - 10+ genre categories (Fantasy, Sci-Fi, Mystery, Romance, etc.)
  - Customizable overlay intensity
  - Optional Unsplash API integration for book imagery

- **Reading Statistics & Analytics**
  - Total words read
  - Books completed count
  - Total reading time
  - Average reading speed (WPM)
  - Reading streaks (current and longest)
  - Session history
  - Words read per session

- **Bookmarks System**
  - Save favorite passages
  - Add notes to bookmarks
  - View all bookmarks
  - Delete bookmarks

- **User Preferences**
  - Default WPM setting
  - Red letter position preference
  - Font size adjustment
  - Theme selection
  - Custom color schemes
  - Pause on punctuation toggle
  - Background overlay intensity

#### Technical Features
- **Backend**
  - RESTful API with Express.js
  - TypeScript for type safety
  - PostgreSQL database with normalized schema
  - JWT authentication middleware
  - File upload handling with Multer
  - Automatic database initialization
  - Error handling and validation

- **Frontend**
  - React 18 with TypeScript
  - Vite for fast development
  - Tailwind CSS for styling
  - Zustand for state management
  - React Router for navigation
  - Responsive design
  - Dark theme UI

- **Database**
  - Users table with authentication
  - Books table with full text content
  - Reading progress tracking
  - Session history
  - Statistics aggregation
  - Preferences storage
  - Bookmarks storage
  - Goals tracking

#### Documentation
- Comprehensive README with feature overview
- Detailed SETUP.md for installation
- DEVELOPMENT.md for contributors
- CONTRIBUTING.md with guidelines
- ROADMAP.md for future features
- API documentation
- Docker setup with docker-compose
- Quick start script

#### Developer Tools
- TypeScript configuration for both backend and frontend
- ESLint setup
- Tailwind CSS configuration
- Development and production builds
- Monorepo structure with workspaces
- Hot Module Replacement (HMR)
- Automatic server restart on changes

#### Quality of Life
- Health check endpoint
- Setup verification script
- Environment variable examples
- .gitignore for clean repository
- Docker support for easy deployment
- Error messages and validation
- Loading states
- Smooth animations

### Security
- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment variable protection
- Secure file upload validation

### Performance
- Database connection pooling
- Efficient text extraction
- Optimized word timing algorithm
- React component optimization
- Minimal re-renders in reading engine
- Fast API responses

## [Unreleased]

### Planned
- Mobile responsive improvements
- Settings UI panel
- Comprehensive test suite
- Performance optimizations
- Additional themes
- More keyboard shortcuts
- Reading comprehension tools
- Social features
- Advanced analytics

See [ROADMAP.md](ROADMAP.md) for detailed future plans.

---

[1.0.0]: https://github.com/your-repo/releases/tag/v1.0.0
