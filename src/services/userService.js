const userRepo = require('../data/userRepo');
const bcrypt = require('bcrypt');

async function signUp(name, password) {
    const hashed = await bcrypt.hash(password, 10);
    return await userRepo.createUser({ name, password: hashed });
}



module.exports = {
    signUp
};