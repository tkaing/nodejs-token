const cryptoRandomString = require("crypto-random-string");

class PartyUtils {

    static generateUID = async (collection) => {
        const uniqueId = cryptoRandomString({ length: 10, type: 'url-safe' });
        const party = await collection.findOne({ uniqueId: uniqueId });
        return party ? this.generateUID(collection) : uniqueId;
    }
}

module.exports = PartyUtils;