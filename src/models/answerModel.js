const mongoose = require('mongoose')
const answerSchema = new mongoose.Schema({
    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quora_User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim : true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quora_question',
        required: true
    },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })
module.exports = mongoose.model('Quora_Answers', answerSchema)