var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

//Load user model
var User = require('../models/User');
var Admin = require('../models/Admin');

module.exports = function (passport) {
    passport.use('student_login',
        new LocalStrategy({usernameField: 'student_id'}, (student_id, password, done) => {
            //Match user
            User.findOne({student_id: student_id})
                .then(user => {
                    if (!user) {
                        return done(null, false, {message: 'That Student ID Is Not Registered'});
                    }

                    if (password === user.password) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Password Inorrect'})
                    }
                })
                .catch(err => console.log(err));
        })
    );

    passport.use('admin_login',
        new LocalStrategy({usernameField: 'admin_id'}, (admin_id, password, done) => {
            //Match admin
            Admin.findOne({admin_id: admin_id})
                .then(admin => {
                    if (!admin) {
                        return done(null, false, {message: 'That Admin ID Is Not Registered'});
                    }

                    if (password === admin.password) {
                        return done(null, admin);
                    } else {
                        return done(null, false, {message: 'Password Inorrect'})
                    }
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((data, done) => {
        if (data.type === 1) {
            Admin.findById(data._id, (err, user) => {
                done(err, user);
            });
        } else {
            User.findById(data._id, (err, user) => {
                done(err, user);
            });
        }
    });
};