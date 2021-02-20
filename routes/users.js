const COLLECTION = 'users';

const md5 = require('md5');
const JWT = require('jsonwebtoken');
const router = require('express').Router();
const { ObjectId } = require('mongodb');

const AuthUtils = require('../utils/auth-utils');
const MongoDBUtils = require('../utils/mongodb-utils');
const ValidatorUtils = require('../utils/validator-utils');

router.get('/fetch-by-token',
    AuthUtils.parseToken,
    async (request, response) => {

        JWT.verify(request.token, AuthUtils.JWT_KEY, async (jwt_error, jwt_data) => {

            if (jwt_error)
                return response.status(403).json("Invalid token.");

            try {

                const user_from_db = await MongoDBUtils.fetchOne(COLLECTION, { _id: ObjectId(jwt_data._id) });

                if (!user_from_db)
                    return response.status(404).json('Unable to find user.');

                return response.json(user_from_db);

            } catch (e) {

                return response.status(500).json(e.stack);
            }
        });
    });

router.post('/sign-up',
    ValidatorUtils.schema.user(),
    async (request, response) => {

        const errors = ValidatorUtils.validate(request);

        if (!errors.isEmpty())
            return response.status(400).json({ errors: errors.array() });

        try {

            const data = request.body;

            const user_from_db = await MongoDBUtils.fetchOne(COLLECTION, {
                username: data.username.toLowerCase()
            });

            if (user_from_db)
                return response.status(403).json('Un utilisateur avec cet identifiant existe déjà !');

            const user_will_insert = await MongoDBUtils.insertOne(COLLECTION, {
                username: data.username.toLowerCase(),
                password: md5(data.password)
            });

            JWT.sign(user_will_insert.ops[0], AuthUtils.JWT_KEY, { expiresIn: AuthUtils.EXPIRES_IN }, (error, token) => {
                return response.json({ token: token });
            });

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

router.post('/sign-in',
    ValidatorUtils.schema.user(),
    async (request, response) => {

        const errors = ValidatorUtils.validate(request);

        if (!errors.isEmpty())
            return response.status(400).json({ errors: errors.array() });

        try {

            const data = request.body;

            const user_from_db = await MongoDBUtils.fetchOne(COLLECTION, {
                username: data.username.toLowerCase(),
                password: md5(data.password)
            });

            if (!user_from_db)
                return response.status(404).json('L\'identifiant ou le mot de passe est incorrect !');

            JWT.sign(user_from_db, AuthUtils.JWT_KEY, { expiresIn: AuthUtils.EXPIRES_IN }, (error, token) => {
                return response.json({ token: token });
            });

        } catch (e) {
            console.log(e.stack);
        }
    });

module.exports = router;
