
const Listing = require("./models/listing");
const Review = require("./models/review");

// Login check
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.get("Referer") || "/listings";
    req.flash("error", "You must be logged in to access this page");
    return res.redirect("/login");
  }
  next();
};

//Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; 
  }
  next();
};

//  Listing Owner Check
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner to modify this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// Review Author Check
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not authorized to delete this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
