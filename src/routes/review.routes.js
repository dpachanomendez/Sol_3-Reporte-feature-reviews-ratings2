import { Router } from 'express';
import { createReview, getReviews, getReviewById } from '../controllers/review.controller.js';
import { auth } from '../middlewares/auth.middleware.js'; // Assuming you have this middleware

const router = Router();

// Public route to get all reviews
router.get('/reviews', getReviews);

// Public route to get a single review by ID
router.get('/reviews/:id', getReviewById);

// Protected route to create a new review (optional, depends on if only logged-in users can review)
// If you want anyone to be able to post a review, remove the 'auth' middleware here.
// If using 'auth', ensure the 'user' field in the review model is populated from req.user.id
router.post('/reviews', auth, createReview);
// If you allow anonymous reviews or reviews by name, you might want to adjust the createReview controller
// to handle cases where req.user is not present and instead rely on a 'name' field from the body.
// For now, I'm keeping 'auth' but the controller can handle a null 'user' if 'name' is provided.

export default router;
