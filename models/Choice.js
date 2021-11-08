var mongoose = require('mongoose');

var ChoiceSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true
    },
    subject_name: [{
        type: String,
        required: true
    }],
    choices: [{
        type: String,
        required: true
    }],
    cgpi: {
        type: Number,
        require: true
    }
});

var Choice = mongoose.model('Choice', ChoiceSchema);
module.exports = Choice;