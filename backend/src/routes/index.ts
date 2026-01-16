import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { AuthController } from '../controllers/authController';
import { BookController } from '../controllers/bookController';
import { PreferencesController } from '../controllers/preferencesController';
import { StatisticsController } from '../controllers/statisticsController';
import { BookmarkController } from '../controllers/bookmarkController';
import { authenticate } from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'),
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.epub', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, TXT, DOC, and DOCX are allowed.'));
    }
  },
});

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', AuthController.me);

router.post('/books/upload', authenticate, upload.single('file'), BookController.uploadBook);
router.get('/books', authenticate, BookController.getBooks);
router.get('/books/:id', authenticate, BookController.getBook);
router.delete('/books/:id', authenticate, BookController.deleteBook);
router.put('/books/:id/progress', authenticate, BookController.updateProgress);

router.get('/preferences', authenticate, PreferencesController.getPreferences);
router.put('/preferences', authenticate, PreferencesController.updatePreferences);

router.get('/statistics', authenticate, StatisticsController.getStatistics);
router.post('/statistics/sessions', authenticate, StatisticsController.createSession);
router.post('/statistics/goals', authenticate, StatisticsController.createGoal);
router.get('/statistics/goals', authenticate, StatisticsController.getGoals);
router.put('/statistics/goals/:id', authenticate, StatisticsController.updateGoalProgress);
router.put('/statistics/goals/:id/update', authenticate, StatisticsController.updateGoal);
router.delete('/statistics/goals/:id', authenticate, StatisticsController.deleteGoal);

router.post('/bookmarks', authenticate, BookmarkController.createBookmark);
router.get('/bookmarks', authenticate, BookmarkController.getBookmarks);
router.put('/bookmarks/:id', authenticate, BookmarkController.updateBookmark);
router.delete('/bookmarks/:id', authenticate, BookmarkController.deleteBookmark);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
