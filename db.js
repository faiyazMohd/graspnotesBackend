const mongoose = require('mongoose');
// const mongoURI  ="mongodb://localhost:27017/?directConnection=true"
// const mongoURI  ="mongodb://127.0.0.1:27017/graspnotes?directConnection=true"
// const mongoURI = process.env.DATABASE;  
const mongoURI = process.env.DATABASE_ATLAS;   
mongoose.set("strictQuery", false);

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connection to Mongo was Successfull");
    })

}

module.exports = connectToMongo;