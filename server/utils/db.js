const  mongoose = require("mongoose");
const URI = process.env.CONNECTION_STRING   

const connectDb = async()=>{
    try{
        await mongoose.connect(URI)
        console.log("Connection Vayo");
    }catch(error){
        console.log("Connection Failed");
        process.exit(0);
    }
}
module.exports = connectDb;