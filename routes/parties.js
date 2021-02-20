const COLLECTION = 'parties';

//const exec = require('child_process').exec;
const router = require('express').Router();
const { param } = require('express-validator');
const { ObjectId } = require('mongodb');

const AuthUtils = require('../utils/auth-utils');
const PartyUtils = require('../utils/party-utils');
const MongoDBUtils = require('../utils/mongodb-utils');
const ValidatorUtils = require('../utils/validator-utils');

router.get('/fetch-by-id-:id',
    param('id').customSanitizer(id => ObjectId(id)),
    AuthUtils.parseAndValidateToken,
    async (request, response) => {

        const id = request.params.id;

        try {

            const result = await MongoDBUtils.fetchOne(COLLECTION, { _id: id });

            if (result === null)
                return response.status(404).json(result);

            return response.json(result);

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

router.get('/fetch-list',
    AuthUtils.parseAndValidateToken,
    async (request, response) => {

        try {

            const listOfParties = await MongoDBUtils.fetchList(COLLECTION);

            return response.json(listOfParties);

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

router.post('/store',
    AuthUtils.parseAndValidateToken,
    ValidatorUtils.schema.party(),
    async (request, response) => {

        const errors = ValidatorUtils.validate(request);

        if (!errors.isEmpty())
            return response.status(400).json({ errors: errors.array() });

        try {

            const data = request.body;

            const result = await MongoDBUtils.insertOne(COLLECTION, {
                title: data.title,
                amount: data.amount,
                creator: data.creator,
                uniqueId: await PartyUtils.generateUID(collection),
                shuffled: false,
                createdAt: new Date()
            });

            return response.json(result);

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

router.patch('/update-by-id-:id',
    param('id').customSanitizer(id => ObjectId(id)),
    AuthUtils.parseAndValidateToken,
    ValidatorUtils.schema.party(),
    async (request, response) => {

        const id = request.params.id;

        const errors = ValidatorUtils.validate(request);

        if (!errors.isEmpty())
            return response.status(400).json({ errors: errors.array() });

        try {

            const data = request.body;

            const result = await MongoDBUtils.updateOne(COLLECTION, { _id: id },{
                title: data.title,
                amount: data.amount,
                creator: data.creator,
            });

            return response.json(result);

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

router.delete('/delete-by-id-:id',
    param('id').customSanitizer(id => ObjectId(id)),
    AuthUtils.parseAndValidateToken,
    async (request, response) => {

        const id = request.params.id;

        try {

            const result = MongoDBUtils.deleteOne(COLLECTION, { _id: id });

            return response.json(result);

        } catch (e) {

            return response.status(500).json(e.stack);
        }
    });

module.exports = router;
