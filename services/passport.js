const dotenv = require('dotenv');
const passport = require('passport');
const User = require('../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Environment Setup
dotenv.config();

// Setup options for Local Strategy
const localOptions = {
    usernameField: 'email',
};

// Create local (email/password)
const localSignin = new LocalStrategy(localOptions, function(email, password, done) {
    // Verify this email and password, call done with the user
    // if it is correct email and password
    // otherwise, call done with false
    User.findOne({ email: email }, function(err, user) {
        if (err) { return done(err); }

        // User was not found
        if (!user) { return done(null, false); }

        // Compare passwords - is `password` === user.password
        user.comparePassword(password, function(err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false); }

            return done(null, user);
        });
    });
});

// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.SECRET,
};

// Create JWT Strategy
const jwtSignin = new JwtStrategy(jwtOptions, function(payload, done) {
    // See if the user ID in the payload exists in our DB
    // If it does, call 'done' with that user
    // otherwise, call done without a user object
    User.findById(payload.sub, function(err, user) {
        if (err) { return done(err, false); }

        if (user) {
            // No errors - found a user
            done(null, user);
        } else {
            // No errors - could not find a user
            done(null, false);
        }
    });
});

// Tell passport to use this strategy
passport.use(jwtSignin);
passport.use(localSignin);
