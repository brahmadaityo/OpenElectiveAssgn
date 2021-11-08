var express = require('express');
var router = express.Router();
var passport = require('passport');
var {ensureAuthenticated} = require('../config/auth');
const {Parser} = require('json2csv');

//Mongoose
var Choice = require('../models/Choice');
var User = require('../models/User');
var Subject = require('../models/Subject');
var Seat = require('../models/Seat');

//Admin login
router.get('/admin_login', (req, res) => res.render('admin_login'));

//Admin Login Handle
router.post('/admin_login', (req, res, next) => {
    passport.authenticate('admin_login', {
        successRedirect: '/admin_dashboard',
        failureRedirect: '/admin/admin_login',
        failureFlash: true
    })(req, res, next);
});

//Admin Logout Handle
router.get('/admin_logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You Are Logged Out');
    res.redirect('/admin/admin_login');
});

//Student information
router.post('/student', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var name = Admin.name;
        var student_id = req.body['student_id'];
        console.log(student_id);
        User.findOne({student_id: student_id})
            .then(user => {
                if (user) {
                    if (user.filled) {
                        Choice.findOne({student_id: student_id})
                            .then(choice => {
                                res.render('admin_student', {
                                    name,
                                    user,
                                    choice
                                });
                            });
                    } else {
                        res.render('admin_student', {
                            name,
                            user
                        });
                    }
                } else {
                    console.log('Please Enter Valid Student ID');
                    let errors = [];
                    errors.push({msg: 'Please Enter Valid Student ID'});
                    res.render('admin_dashboard', {
                        errors,
                        name
                    });
                }
            });
    } else {
        req.logout();
        res.redirect('/');
    }

});

//Allotment
router.get('/allotment', ensureAuthenticated, (req, res) => {
    var Admins = req.session.passport.user;
    var total_seats;
    if (Admins.type === 1) {
        function filledAllocated(callback) {
            var seatObj = {};
            Seat.find()
                .then(seat => {
                    total_seats = seat[0]['total_seats'];
                    Subject.find()
                        .then(subject => {
                            var seats = total_seats;
                            for (var j = 0; j < subject.length; j++) {
                                seatObj[subject[j].subject_name] = seats;
                            }
                            Choice.find()
                                .then(choice => {
                                    if (choice.length !== 0) {
                                        var Obj = choice;

                                        function compare(a, b) {
                                            if (a.cgpi >= b.cgpi) {
                                                return -1;
                                            } else {
                                                return 1;
                                            }
                                        }

                                        Obj.sort(compare);
                                        var lenObj = Obj[0].subject_name.length;
                                        for (var i = 0; i < Obj.length; i++) {
                                            var result = {};
                                            Obj[i].choices.forEach((key, ind) => result[key] = Obj[i].subject_name[ind]);
                                            var key, val, currentSubject;
                                            for (var j = 1; j <= lenObj; j++) {
                                                currentSubject = result[j];
                                                if (seatObj[currentSubject] >= 1) {
                                                    User.findOneAndUpdate({student_id: Obj[i].student_id}, {$set: {alloted: currentSubject}}, {new: true}, (err, doc) => {
                                                        if (err) {
                                                            console.log("Something Wrong While Updating Data");
                                                        }
                                                        console.log(doc);
                                                    });
                                                    seatObj[currentSubject]--;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                });
                        });
                });
            callback(seatObj);
        }

        function notFilledAllocated(seatObj) {
            Subject.find()
                .then(subject => {
                    User.find({filled: false})
                        .then(user => {
                            var Obj = user;
                            var lenSub = subject.length;
                            var currentSubject, currentBranch;
                            for (var i = 0; i < Obj.length; i++) {
                                for (var j = 0; j < lenSub; j++) {
                                    currentSubject = subject[j].subject_name;
                                    currentBranch = subject[j].branch;
                                    if (seatObj[currentSubject] >= 1 && currentBranch !== Obj[i].branch) {
                                        User.findOneAndUpdate({student_id: Obj[i].student_id}, {$set: {alloted: currentSubject}}, {new: true}, (err, doc) => {
                                            if (err) {
                                                console.log("Something Wrong While Updating Data");
                                            }
                                            doc.filled = true;
                                            doc.save();
                                            console.log(doc);
                                        });
                                        seatObj[currentSubject]--;
                                        break;
                                    }
                                }
                            }
                        });
                });
        }

        filledAllocated(notFilledAllocated);
        req.logout();
        req.flash('success_msg', 'Allotment Done Successfully');
        res.redirect('/admin/admin_login');
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Choice unlock
router.post('/choice_unlock', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var student_id = req.body['student_id'];
        User.findOne({student_id: student_id})
            .then(user => {
                if (user) {
                    user.alloted = undefined;
                    user.filled = false;
                    user.save();
                    Choice.deleteOne({student_id: user.student_id}, function (err) {
                        if (!err) {
                            console.log('Choice Removed Sucessfully');
                        } else {
                            console.log(err);
                        }
                    });
                    console.log('Choice Unlocked Sucessfully');
                } else {
                    console.log('Student Not Found');
                }
                var name = req.session.passport.user.name;
                res.render('admin_student', {
                    name,
                    user
                });
            });

    } else {
        req.logout();
        res.redirect('/');
    }
});

//Subjects
router.get('/subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        Seat.find()
            .then(seats => {
                var total_seats = seats[0]['total_seats'];
                Subject.find()
                    .then(subject => {
                        var name = req.session.passport.user.name;
                        res.render('admin_subject', {
                            total_seats,
                            subject,
                            name
                        });
                    });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Add Subject
router.post('/add_subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var {branch, subject_name, subject_code} = req.body;
        Seat.find()
            .then(seat => {
                var total_seats = seat[0]['total_seats'];
                if (branch === '' || subject_name === '' || subject_code === '') {
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            let errors = [];
                            errors.push({msg: 'Please Fill All The Fields'})
                            res.render('admin_subject', {
                                total_seats,
                                errors,
                                subject,
                                name
                            });
                        });
                } else if (branch !== 'cse' && branch !== 'ece' && branch !== 'ce'
                    && branch !== 'it' && branch !== 'me' && branch !== 'ee') {
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            let errors = [];
                            errors.push({msg: "Please Enter Branch Name In Correct Format"});
                            res.render('admin_subject', {
                                total_seats,
                                errors,
                                subject,
                                name
                            });
                        });
                } else {
                    Subject.findOne({subject_code: subject_code})
                        .then(subject => {
                            if (subject) {
                                console.log('Subject Code Should Be Different');
                                let errors = [];
                                errors.push({msg: 'Subject Code Should Be Different'});
                                Subject.find()
                                    .then(subject => {
                                        var name = req.session.passport.user.name;
                                        res.render('admin_subject', {
                                            total_seats,
                                            errors,
                                            subject,
                                            name
                                        });
                                    })
                            } else {
                                var newSubject = new Subject({
                                    branch,
                                    subject_name,
                                    subject_code
                                });
                                newSubject.save()
                                    .then(subject => {
                                        let successes = [];
                                        successes.push({msg: 'Subject Added Successfully'});
                                        console.log('Subject Added Successfully');
                                        Subject.find()
                                            .then(subject => {
                                                var name = req.session.passport.user.name;
                                                res.render('admin_subject', {
                                                    total_seats,
                                                    successes,
                                                    subject,
                                                    name
                                                });
                                            })
                                    })
                                    .catch(err => console.log(err));
                            }
                        })
                }
            })
    } else {
        req.logout();
        req.redirect('/');
    }
});

//Remove Subject
router.post('/remove_subject', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        Seat.find()
            .then(seat => {
                var total_seats = seat[0]['total_seats'];
                var subject_code = req.body['subject_code'];
                Subject.findOneAndRemove({subject_code: subject_code}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Subject Deleted Successfully');
                        let successes = [];
                        successes.push({msg: 'Subject Deleted Successfully'});
                        Subject.find()
                            .then(subject => {
                                var name = req.session.passport.user.name;
                                res.render('admin_subject', {
                                    total_seats,
                                    successes,
                                    subject,
                                    name
                                });
                            });
                    }
                });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Update Seats
router.post('/update_seats', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var total_seats = req.body['total_seats'];
        if (total_seats === '' || total_seats <= 0) {
            let errors = [];
            errors.push({msg: 'Please Enter A Valid Number'});
            Seat.find()
                .then(seats => {
                    var total_seats = seats[0]['total_seats'];
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            res.render('admin_subject', {
                                errors,
                                total_seats,
                                subject,
                                name
                            });
                        });
                });
        } else {
            Seat.find()
                .then(seat => {
                    seat[0]['total_seats'] = total_seats;
                    seat[0].save();
                    Subject.find()
                        .then(subject => {
                            var name = req.session.passport.user.name;
                            res.render('admin_subject', {
                                total_seats,
                                subject,
                                name
                            });
                        })
                });
        }
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Unlock choices for all
router.get('/unlock_all', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        User.find()
            .then(user => {
                if (user) {
                    for (var i = 0; i < user.length; i++) {
                        user[i].alloted = undefined;
                        user[i].filled = false;
                        user[i].save();
                        Choice.deleteOne({student_id: user[i].student_id}, function (err) {
                            if (!err) {
                                console.log('Choice Removed Sucessfully');
                            } else {
                                console.log(err);
                            }
                        });
                        console.log('Choice Unlocked Sucessfully');
                    }
                } else {
                    console.log('Student Not Found');
                }
                var name = req.session.passport.user.name;
                let successes = [];
                successes.push({msg: 'Choices Unlocked Successfully'});
                res.render('admin_dashboard', {
                    successes,
                    name
                });
            });
    } else {
        req.logout();
        res.redirect('/');
    }
});

//Get list of all allotment
router.get('/get_list', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        User.find()
            .then(user => {
                if (user[0].alloted !== undefined) {
                    var name = Admin.name;
                    Subject.find()
                        .then(subject => {
                            res.render('admin_get_list', {
                                name,
                                subject
                            });
                        });
                } else {
                    let errors = [];
                    errors.push({msg: 'Please Start Allotment First'});
                    res.render('admin_dashboard', {
                        errors,
                        name: req.user.name
                    });
                }
            });

    } else {
        req.logout();
        res.redirect('/');
    }
});

//Download list
router.post('/get_list', ensureAuthenticated, (req, res) => {
    var Admin = req.session.passport.user;
    if (Admin.type === 1) {
        var subject_name = req.body['subject_name'];
        User.find({alloted: subject_name})
            .then(user => {
                if (user.length !== 0) {
                    function compare(a, b) {
                        if (a.cgpi >= b.cgpi) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }

                    user.sort(compare);
                    const fields = ['name', 'student_id', 'cgpi', 'branch'];
                    const json2csvParser = new Parser({fields});
                    const csv = json2csvParser.parse(user);
                    res.attachment(subject_name + '.csv');
                    res.status(200).send(csv);
                } else {
                    let errors = [];
                    errors.push({msg: 'Please Start Allotment First'});
                    res.render('admin_dashboard', {
                        errors,
                        name: req.user.name
                    });
                }
            })
    } else {
        req.logout();
        res.redirect('/');
    }
});

module.exports = router;