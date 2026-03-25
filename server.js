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

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}.....`);
});
