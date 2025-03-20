const mongoose=require('mongoose');
const {Schema}=mongoose;

const CitySchema = new Schema({
    name:{type:String, required:true, unique:true},
    location:{
        lat:{type:Number,required:true},
        lon:{type:Number,required:true},
    },
    pincode:{type:Number,required:false}
},{
    collection:'city'
});

const City=mongoose.model("City",CitySchema)

module.exports=City;