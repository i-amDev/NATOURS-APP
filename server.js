const app = require("./app");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/natours", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        console.log("Connected to MongoDB ✅");
    })
    .catch((err) => {
        console.log("Connection error ❌:", err);
    });

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"],
    },
});

const Tour = mongoose.model("Tour", tourSchema);

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}.....`);
});
