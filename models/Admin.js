var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin_id: {
        type: Number,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

var Admin = mongoose.model('Admin', AdminSchema);
/*
const admin = new Admin({ name: 'IIEST_ADMIN',admin_id: '24111856',password: "iiest",type: '1'});
admin.save(); 
*/
module.exports = Admin;