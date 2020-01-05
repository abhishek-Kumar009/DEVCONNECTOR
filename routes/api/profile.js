const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');

// @router GET /api/profile
// desc: get the user profile
//access: private

// router.get('/me', auth, async (req, res) => {
//     try {
//         const profile = await Profile.findOne({
//             user: req.user.id
//         }).populate('user', ['name', 'avatar']);

//         if (!profile) {
//             return res.status(400).send({
//                 msg: 'There is no profile for this user!'
//             })

//         }
//         return res.status(200).json(profile);


//     } catch (err) {
//         res.status(500).send('Server error!')
//     }



// });

// @router POST /api/profile
// desc: POST the user profile
//access: private

router.post('/', [auth, [
    check('skills', 'Skills is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram
    } = req.body;

    const profileInfo = {};
    profileInfo.user = req.user.id;
    if (company) profileInfo.company = company
    if (website) profileInfo.website = website
    if (location) profileInfo.location = location
    if (status) profileInfo.status = status
    if (skills) {
        profileInfo.skills = skills.split(',').map(skill => skill.trim());
    }
    if (bio) profileInfo.bio = bio
    if (githubusername) profileInfo.githubusername = githubusername

    profileInfo.social = {};
    if (youtube) profileInfo.social.youtube = youtube
    if (twitter) profileInfo.social.twitter = twitter
    if (facebook) profileInfo.social.facebook = facebook
    if (linkedin) profileInfo.social.linkedin = linkedin
    if (instagram) profileInfo.social.instagram = instagram



    try {
        let profile = await Profile.findOne({
            user: req.user.id
        });

        //Update profile if it exist
        if (profile) {
            profile = await Profile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profileInfo
            }, {
                new: true
            })

            return res.status(200).json(profile)
        }

        //Create a profile if it doesn't exist

        profile = new Profile(
            profileInfo
        );


        await profile.save();
        console.log(profile);

        return res.status(200).json(profile);



    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!');
    }

});

// @router GET /api/profile/
// desc: GET all the user profiles
//access: public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!')

    }
});

// @router GET /api/profile/user/:user_id
// desc: GET a specific user profile
//access: public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({
                msg: 'Profile does not exist'
            });
        }
        return res.status(200).json(profile);

    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.json({
                msg: 'Profile does not exist'
            });
        }
        console.error(err.msg);
        return res.status(500).send('Server error!');

    }
})



module.exports = router;