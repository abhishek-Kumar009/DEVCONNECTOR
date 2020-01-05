const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretkey = require('../../config/default');
const {
    check,
    validationResult
} = require('express-validator');


router.post('/', [
    check('name', 'Name field is required').not().isEmpty(),
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'password should be atleast 6 characters ').isLength({
        min: 6
    })

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const {
            name,
            email,
            password
        } = req.body;
        let user = await User.findOne({
            email
        });

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: "User already exists!"
                }]
            });
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm',

        });

        user = new User({
            name,
            email,
            avatar,
            password
        });

        //Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        //save it to database

        await user.save();

        const payload = {
            user: {
                id: user.id

            }

        }

        jwt.sign(payload, secretkey.jwtSecretkey, {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err
            res.json({
                token
            })
        })




    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!');
    }
});

module.exports = router;