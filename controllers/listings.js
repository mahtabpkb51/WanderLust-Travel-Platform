const axios = require("axios");
const Listing = require("../models/listing");

// SHOW ALL LISTINGS
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// RENDER NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// CREATE LISTING GEOCODING ADDED
module.exports.createListing = async (req, res) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;

    const listingData = req.body.listing;

    if (listingData.category) {
      listingData.category = listingData.category.toLowerCase();
    }


    // 1. GEOCODING (convert text -> lat,lng)
    const geoUrl = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_TOKEN}&q=${listingData.location}&format=json`;
    const geoResponse = await axios.get(geoUrl);

    const lat = geoResponse.data[0].lat;
    const lng = geoResponse.data[0].lon;

    console.log("Saved Coordinates:", lat, lng);

    // 2. SAVE LISTING WITH GEOMETRY
    const newListing = new Listing({
      ...listingData,
      owner: req.user._id,
      image: { url, filename },
      geometry: {
        type: "Point",
        coordinates: [lng, lat] 
      }
    });

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.log("Create Listing Error:", err.message);
    req.flash("error", "Error while creating listing.");
    res.redirect("/listings");
  }
};

// SHOW SINGLE LISTING
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  console.log(listing); 
  res.render("listings/show.ejs", { listing });
};

// RENDER EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl.replace("/uploads", "/uploads/w_250")

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};
// UPDATE LISTING 
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  if (req.body.listing.category) {
    req.body.listing.category = req.body.listing.category.toLowerCase();
  }

  // 1. Update basic fields
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  // 2. If user uploaded new image
  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  // 3. If location changed → RE-GEOCODE
  if (req.body.listing.location) {
    try {
      const geoUrl = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_TOKEN}&q=${req.body.listing.location}&format=json`;
      const geoRes = await axios.get(geoUrl);

      const lat = geoRes.data[0].lat;
      const lng = geoRes.data[0].lon;

      console.log("Updated Coordinates:", lat, lng);

      listing.geometry = {
        type: "Point",
        coordinates: [lng, lat]
      };

    } catch (err) {
      console.log("UPDATE GEOCODING ERROR:", err.message);
    }
  }

  // 4. Save the updated listing
  await listing.save();

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};


// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
