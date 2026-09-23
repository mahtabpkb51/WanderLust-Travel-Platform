const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Validate review
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); 
  } else {
    next();
  }
};

// CREATE review
router.post("/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview));

  // Edit review 
  router.get(
    "/:reviewId/edit",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.renderEditForm)
  );

  // update review
  router.put(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
   wrapAsync(reviewController.updateReview)
  );

// DELETE review
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview));

module.exports = router;
