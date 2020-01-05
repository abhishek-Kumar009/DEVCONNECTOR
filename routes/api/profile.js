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

// @router PUT /api/profile/experience
// desc: Update an user experience
//access: private

router.put('/experience', [auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company field is required').not().isEmpty(),
    check('location', 'location is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {

        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.experience.unshift(newExp);

        await profile.save();

        return res.json(profile);

    } catch (err) {
        console.error(err.msg);
        res.send('Server error!');

    }


});

// @router DELETE /api/profile/experience/:exp_id
// desc: delete an experience
//access: private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        res.status(200).json(profile);


    } catch (err) {
        console.error(err.msg);
        res.send('Server error!');

    }


})


// @router GET /api/profile/education
// desc: add an education
//access: private

router.put('/education', [auth, [
    check('school', 'school field is empty').not().isEmpty(),
    check('degree', 'degree field is empty').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is empty').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);

    } catch (err) {
        console.log(err.msg);
        res.send('Server error!');

    }

});

// @router DELETE /api/profile/education/:edu_id
// desc: delete an education
//access: private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        res.json(profile);

    } catch (err) {
        console.error(err.msg);
        res.send('Server error!');

    }
})


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
});

// @router DELETE /api/profile/
// desc: DELETE USER PROFILE AND USER
//access: private

router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndDelete({
            user: req.user.id
        });
        await User.findOneAndDelete({
            _id: req.user.id
        });

        res.send('User deleted!');

    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Server error!');

    }


})



module.exports = router;