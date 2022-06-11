const mongoose = require('mongoose')
const connectDb = async () => {
    const conn = await mongoose.connect(process.env.mongo_url, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true,
        useFindAndModify:false
    })
    console.log(`mongodb connected: ${conn.connection.host}`)
}
module.exports = connectDb;