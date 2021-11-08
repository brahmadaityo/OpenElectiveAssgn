var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../config/auth');

var Subject = require('../models/Subject');
var Choice = require('../models/Choice');

/* GET home page. */
router.get('/', (req, res) => res.render('welcome'));

// Student Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    var Userr = req.session.passport.user;
    if (Userr.type === 1) {
        req.logout();
        res.redirect('/')
    } else {
        if (Userr.alloted === undefined) {
            async function showDashboard () {
                var { name, student_id, cgpi, filled, branch } = req.session.passport.user;
                var subjects = await Subject.find({branch: {$nin: branch}}).exec();
                if (subjects.length === 0) {
                    console.log('Subjects Not Found');
                } else {
                    if (filled) {
                        Choice.findOne({ student_id: student_id })
                            .then(choice => {
                                if (choice) {
                                    res.render('dashboard', {
                                        subjects,
                                        name,
                                        student_id,
                                        branch,
                                        cgpi,
                                        filled,
                                        choice
                                    });
                                } else {
                                    console.log('You Have Not Filled The Choices')
                                }
                            });
                    } else {
                        res.render('dashboard', {
                            subjects,
                            name,
                            student_id,
                            cgpi,
                            filled
                        });
                    }
                }
            }
            showDashboard();
        } else {
            var { name, student_id, cgpi, alloted } = Userr;
            res.render('allotment', {
                name,
                student_id,
                cgpi,
                alloted
            });
        }
    }
});

router.get('/admin_dashboard', ensureAuthenticated, (req, res) => {
    var User = req.session.passport.user;
    if (User.type === 1) {
        res.render('admin_dashboard', { name: req.user.name });
    } else {
        req.logout();
        res.redirect('/');
    }
});

module.exports = router;
