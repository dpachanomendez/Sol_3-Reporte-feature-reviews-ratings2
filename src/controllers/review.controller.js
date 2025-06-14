import Review from '../models/review.model.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { user, name, rating, comment } = req.body;

    // Basic validation
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!user && !name) {
      return res.status(400).json({ message: 'User ID or name is required.' });
    }

    const newReview = new Review({
      user, // This can be null if the review is anonymous or from a non-logged-in user
      name, // Name of the reviewer (especially if not logged in)
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'username email'); // Populate user details if user field exists
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get a single review by ID (Optional, but good practice)
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'username email');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    res.status(500).json({ message: 'Error fetching review by ID', error: error.message });
  }
};
