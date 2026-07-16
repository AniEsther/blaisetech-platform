// controllers/reviewController.js — customer review & rating system.
const { Review, User } = require('../models');

// POST /api/reviews  (customer)
async function createReview(req, res, next) {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    const review = await Review.create({
      customerId: req.user.id, bookingId: bookingId || null, rating, comment,
    });
    res.status(201).json(review);
  } catch (err) { next(err); }
}

// GET /api/reviews  (public — shown on website)
async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.findAll({
      include: [{ model: User, attributes: ['fullName'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id  (admin — moderate inappropriate reviews)
async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    await review.destroy();
    res.json({ message: 'Review removed.' });
  } catch (err) { next(err); }
}

module.exports = { createReview, getAllReviews, deleteReview };
