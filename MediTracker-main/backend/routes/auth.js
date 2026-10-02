import express from 'express';
import { body } from 'express-validator';
import { signup , login} from '../controllers/AuthController.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters')
      .isLength({ min: 6 }),
  ],
  signup
);
router.post('/login', login);
export default router;