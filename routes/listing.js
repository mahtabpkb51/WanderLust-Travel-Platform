const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require("multer");
const { storage } = require("../cloundConfig.js");
const upload = multer({ storage });

// Validation Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};
// NEW LISTING FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// FILTER
router.get("/filter/:category", async (req, res) => {
  const category = req.params.category.toLowerCase();
  const listings = await Listing.find({ category });

  res.render("listings/index", {
    allListings: listings,
    categorySelected: category,
  });
});

// SEARCH ROUTE 
router.get("/search", async (req, res) => {
  let query = req.query.q;

  if (!query) {
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    location: { $regex: query, $options: "i" }
  });

  res.render("listings/searchResults.ejs", { listings, query });
});

// SHOW + UPDATE + DELETE LISTING
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
