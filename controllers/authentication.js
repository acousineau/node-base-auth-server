const jwt = require('jwt-simple');
const User = require('../models/user');

const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, process.env.SECRET);
};

exports.signin = (req, res, next) => {
    // User has already had their email and password auth'd
    // We just need to give them a token
    res.send({ token: tokenForUser(req.user) });
};

exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // TODO: Add more logic to ensure email is actually an email instead of
    // any old string
    if (!email || !password) {
        return res
            .status(422)
            .send({ error: 'You must provide email and password' });
    }

    // See if a user with given email exists
    User.findOne({ email: email }, (err, existingUser) => {
        if (err) { return next(err); } // Case where DB failed

        // If a user with email does exist, return error
        if (existingUser) {
            return res
                .status(422) // Unprocessable entity - email for user that already exists
                .send({ error: 'Email is in use' });
        }

        // If a user with email does NOT exist, create and save user record
        const user = new User({
            email: email,
            password: password,
        });

        // Save record to the DB
        user.save((err) => {
            if (err) { return next(err); } // User failed to save

            // Respond to request indicating the user was created
            res
                .status(200)
                .json({ token: tokenForUser(user) });
        });

    });
};
