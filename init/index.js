const mongoose = require("mongoose");
const axios = require("axios");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

function assignCategory(item) {
  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();

  if (
    title.includes("beach") ||
    description.includes("beach") ||
    title.includes("bungalow")
  ) {
    return "beach";
  }

  if (
    title.includes("mountain") ||
    title.includes("ski") ||
    title.includes("cabin") ||
    title.includes("chalet") ||
    description.includes("mountain")
  ) {
    return title.includes("cabin") || title.includes("chalet")
      ? "cabins"
      : "mountain";
  }

  if (
    title.includes("villa")
  ) {
    return "villa";
  }

  if (
    title.includes("penthouse") ||
    title.includes("luxury") ||
    description.includes("luxury")
  ) {
    return "luxury";
  }

  if (
    title.includes("apartment") ||
    title.includes("loft")
  ) {
    return "rooms";
  }

  if (
    title.includes("hotel") ||
    title.includes("lodge")
  ) {
    return "hotels";
  }

  if (
    title.includes("treehouse") ||
    title.includes("island") ||
    title.includes("safari")
  ) {
    return "family";
  }

  if (
    title.includes("pool") ||
    description.includes("pool")
  ) {
    return "pool";
  }

  if (
    title.includes("historic") ||
    title.includes("castle")
  ) {
    return "trending";
  }

  return "trending";
}

const dbURL = process.env.MONGODB_URL;

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Old listings removed");

  for (let item of initData.data) {
    try {
      const geoRes = await axios.get(
        "https://us1.locationiq.com/v1/search.php",
        {
          params: {
            key: process.env.LOCATION_IQ_TOKEN,
            q: `${item.location}, ${item.country}`,
            format: "json",
          },
        }
      );

      const lat = geoRes.data[0].lat;
      const lng = geoRes.data[0].lon;

      const newListing = new Listing({
        ...item,
        category: assignCategory(item),
        owner: "6aa40e5a06b8840b5ddc4afb",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      });

      await newListing.save();
      console.log(`Saved: ${item.title}`);
    } catch (err) {
      console.log(`Error for ${item.title} → ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  console.log("All Listings Inserted with Coordinates!");
  mongoose.connection.close();
};

initDB();