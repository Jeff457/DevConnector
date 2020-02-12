const mongoose = require("mongoose");
const config = require("config");
const dbURI = config.get("Mongo.dbConfig.URI");

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;