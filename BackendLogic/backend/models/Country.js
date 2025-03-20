const mongoose=require('mongoose');
const {Schema}=mongoose;

const CountrySchema=new Schema({
    code2: String,
    code3: String,
    name: String,
    capital: String,
    region: String,
    subregion: String,
    states: [{ code: String, name: String, subdivision: String }],
});
const Country=mongoose.model('Country',CountrySchema)
module.exports=Country;