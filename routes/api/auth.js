const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');

const jwt = require('jsonwebtoken');
const secretKey = require('../../config/default');
const bcrypt = require('bcryptjs');
// @router GET /api/auth
// desc: authentication

router.get('/', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);


    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!')
    }

});

router.post('/', [

    check('email', 'Invalid email').isEmail(),
    check('password', 'Password is required').exists()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const {
            email,
            password
        } = req.body;

        let user = await User.findOne({
            email
        });


        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials'
                }]
            });
        }


        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials '
                }]
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        }


        jwt.sign(
            payload,
            secretKey.jwtSecretkey, {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err
                res.json({
                    token
                });
            }
        )

    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!')
    }



})

module.exports = router;