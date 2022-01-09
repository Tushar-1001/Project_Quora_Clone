const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const questionSchema = new mongoose.Schema({

    description: {type : String, required:true} ,
    tag: [String],
    askedBy: {type : ObjectId, ref : 'Quora_User' ,trim : true },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true })

module.exports = mongoose.model('Quora_question', questionSchema)