const mongoose = require("mongoose");
const listingSchema = require("./listingSchema.js");

module.exports = class ListingsDB {
    constructor() {
        // We don't have a "Listing" object until initialize() is complete
        this.Listing = null;
    }

    // This function will:
    // - Connect to the MongoDB server
    // - Initialize the "Listing" model with the "listingsAndReviews" collection
    initialize(connectionString) {
        return new Promise((resolve, reject) => {
            let db = mongoose.createConnection(connectionString);

            db.once('error', (err) => {
                reject(err);
            });

            db.once('open', () => {
                this.Listing = db.model("listingsAndReviews", listingSchema);
                resolve();
            });
        });
    }

    // Create a new listing in the collection
    addNewListing(data) {
        return new Promise((resolve, reject) => {
            let newListing = new this.Listing(data);
            newListing.save().then(() => {
                resolve(newListing);
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Return an array of all listings for a specific page, sorted by number_of_reviews
    // Optional "name" parameter to filter results
    getAllListings(page, perPage, name) {
        return new Promise((resolve, reject) => {
            let findBy = name != null ? { "name": new RegExp(name, 'i') } : {};

            if (+page && +perPage) {
                this.Listing.find(findBy).sort({ number_of_reviews: -1 }).limit(+perPage).skip((+page - 1) * +perPage).exec().then(listings => {
                    resolve(listings);
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject(new Error('page and perPage query parameters must be valid numbers'));
            }
        });
    }

    // Return a single listing object whose "_id" matches the "Id" parameter
    getListingById(Id) {
        return new Promise((resolve, reject) => {
            this.Listing.findById(Id).exec().then(listing => {
                resolve(listing);
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Update an existing listing whose "_id" matches the "Id" parameter
    updateListingById(data, Id) {
        return new Promise((resolve, reject) => {
            this.Listing.updateOne({ _id: Id }, { $set: data }).exec().then(result => {
                resolve(result.modifiedCount > 0 ? result : null);
            }).catch(err => {
                reject(err);
            });
        });
    }

    // Delete an existing listing whose "_id" matches the "Id" parameter
    deleteListingById(Id) {
        return new Promise((resolve, reject) => {
            this.Listing.deleteOne({ _id: Id }).exec().then(result => {
                resolve(result.deletedCount > 0 ? result : null);
            }).catch(err => {
                reject(err);
            });
        });
    }
};