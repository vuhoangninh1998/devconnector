const express = require('express');
const router = express.Router();
// use express validator to value every information that the users provide
const { check, validationResult } = require('express-validator');
// get userGravatar
const gravatar = require('gravatar');
// encrypt the password using bcrypt
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// @route POST api/user
// @desc Register User
// @access Public
router.post('/', [
    check('username', 'username is required!!!').not().isEmpty(),
    check('email', 'Please include a valid email address').isEmail(),
    check('password', 'Please enter a password with 6 or more characters ').isLength({
        min: 6
    })
], async(req, res) => {
    // customize the error msg
    const errors = validationResult(req);
    // if there are errors,then throw these customized errors msg
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    try {
        // check if the user has already exists????
        let username = await User.findOne({ email });
        if (username) {
            res.status(400).json({ errors: [{ msg: 'User has already exists' }] });
        }
        // get User gravatar

        const avatar = gravatar.url(email, {
            // size of the image
            s: '200',
            // no inappropriate images allowed
            r: 'pg',
            d: 'mm'
        });
        // create an instance of the User
        user = new User({
            username,
            email,
            avatar,
            password
        });

        // encrypt userpassword
        // 10 rounds looping are recommended for genSalt
        const salt = await bcrypt.genSalt(10);
        // Creating HASHed Password
        // user created above, parse in the password enter, /// bcrypt.hash(the plain-txt password, salt)
        user.password = await bcrypt.hash(password, salt);
        // then save the userpassword the database using .save().then()
        // using await is much better, hence there is no need for promise=>>>.then()
        await user.save();




        // return webtoken
        res.send('User registered');
    } catch (err) {
        // server error
        console.err(err.message);
        res.status(500).send('Server error');
    }




});

module.exports = router;