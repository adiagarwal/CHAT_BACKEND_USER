let mongoose = require('mongoose')

const mongoConnect = () =>{
    const uri = process.env.DATABASE_URL
    mongoose.set('strictQuery',true)
    mongoose.connect(uri,(err)=>{
        if(err){
            console.log(err)
            throw err
        }
        console.log('Successfully connected to mongodb')
    })
}

module.exports = {mongoose , mongoConnect}