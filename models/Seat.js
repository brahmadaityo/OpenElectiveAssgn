var mongoose = require('mongoose');

var SeatSchema = new mongoose.Schema({
    total_seats: {
        type: Number,
        required: true
    }
});

var Seat = mongoose.model('Seat', SeatSchema);

/*
const s = new Seat({total_seats: '1'});
s.save(); 
*/
module.exports = Seat;