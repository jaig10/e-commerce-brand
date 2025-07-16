const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully")
    }catch(err){
        console.log("mongoDB connection Failed");
        process.exit(1);
    }
}

module.exports = connectDB;