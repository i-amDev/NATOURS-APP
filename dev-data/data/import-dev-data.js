const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("./../../models/tourModel");

mongoose.connect("mongodb://localhost:27017/natours", {
    useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false
})
    .then(() => {
        console.log("Connected to MongoDB ✅");
    })
    .catch((err) => {
        console.log("Connection error ❌:", err);
    });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf8"));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded!");
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted!");
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
};

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}