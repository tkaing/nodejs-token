const { body, validationResult } = require('express-validator');

// Wildcards (cf. https://express-validator.github.io/docs/wildcards.html)
String.prototype.px = function (_) {
    return _ + this;
};

class ValidatorUtils {

    static IS_EMAIL = 'Ce n\'est pas une adresse email valide...';
    static IS_FLOAT = 'Ce n\'est pas un type float...';
    static NOT_EMPTY = 'Ça ne peut pas être vide...';

    static IS_LENGTH = (min, max = min) => `Entre ${ min } et ${ max } caractères...`;
    static IS_LENGTH_MIN = (min) => `${ min } caractères minimum...`;

    static schema = {
        user: (_ = "") => [
            body('username'.px(_))
                .notEmpty().withMessage(ValidatorUtils.NOT_EMPTY)
                .isLength({ min: 2, max: 20 }).withMessage(ValidatorUtils.IS_LENGTH(2, 20)),
            body('password'.px(_))
                .notEmpty().withMessage(ValidatorUtils.NOT_EMPTY)
                .isLength({ min: 4 }).withMessage(ValidatorUtils.IS_LENGTH_MIN(4))
        ],
        party: (_ = "") => [
            body('title'.px(_))
                .notEmpty().withMessage(ValidatorUtils.NOT_EMPTY),
            body('amount'.px(_))
                .isFloat({ min: 0, locale: "fr-FR" }).withMessage(ValidatorUtils.IS_FLOAT),
            body('creator'.px(_))
                .isEmail().withMessage(ValidatorUtils.IS_EMAIL)
        ],
    };

    static validate = validationResult;
}

module.exports = ValidatorUtils;