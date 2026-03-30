const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // This only works on CREATE and SAVE!!
            validator: function (element) {
                return element === this.password;
            },
            message: "Passwords are not the same"
        }
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;