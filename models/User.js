var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    student_id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    cgpi: {
        type: Number,
        require: true
    },
    filled: {
        type: Boolean,
        require: true
    },
    alloted: {
        type: String,
        require: false
    }
    

});

var User = mongoose.model('User', UserSchema);
/*
const a = new User({  name: 'Ankan',student_id: '510818008',password: 'ankan@510818008',branch: 'IT',cgpi: '8.61',filled:'false'});
const s = new User({  name: 'Siddhartha',student_id: '510818006',password: 'siddhartha@510818006',branch: 'IT',cgpi: '9.06',filled:'false'});
const d = new User({  name: 'Souradip',student_id: '510818009',password: 'souradip@510818009',branch: 'CST',cgpi: '9.88',filled:'false'});
a.save();
s.save();
d.save();
*/
module.exports = User;