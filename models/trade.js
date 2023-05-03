const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    category:{type:String, required: [true, 'Category is required']},
    name:{type:String, required:[true, 'Name is required']},
    details:{type:String, required:[true,'Details are required']
                        ,minLength:[10,'the details content should have at least 10 characters']},
    author:{type:Schema.Types.ObjectId, ref:'User'},
    image:{type:String, required:[true, 'Image is required']},
    status:{type:String, required:[true,'Status is Required'],
                        enum:['Available','Offer pending','Traded']},
    yearofMFG:{type:Number, required:[true, 'Year of MFG is required']
                        ,min: [1901, 'Year of MFG must be greater than or equal to 1901']
                        ,max: [new Date().getFullYear(), "Year of MFG must be less than or equal to current year"]},
    offerName: {type: String},
    offered: {type:Boolean},
    watchlist: {type:Boolean} 
},
{timestamps: true}
);

module.exports = mongoose.model('Trade', tradeSchema);