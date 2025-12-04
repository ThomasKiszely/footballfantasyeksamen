const userRepo = require('../data/userRepo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function signUp(username, password) {
    if (!username || !password) {
        throw new Error("Brugernavn og adgangskode kræves");
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await userRepo.createUser({ username, password: hashed });
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN});
    return ({
        token,
        user: {
            _id: user._id,
            username: user.username,
            teams: user.teams,
            role: user.role,
        }
    });
}

async function getUserById(id){
    return await userRepo.getUserById(id);
}

async function login(username, password){
    const user = await userRepo.getUserByName(username);
    if (!user) {
        throw new Error('User or password is wrong');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('User or password is wrong');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return {
        token,
        user: {
            _id: user._id,
            username: user.username,
            teams: user.teams,
            role: user.role,
        }
    };
}

async function canAffordPlayer(userId, playerId) {
    const user = await userRepo.getUserById(userId);
    const playerRepo = require('../data/playerRepo');
    const player = await playerRepo.findById(playerId);

    if (!user || !player) {
        throw new Error('User or player not found');
    }

    if (user.budget >= player.price) {
        return true;
    } else {
        throw new Error('Insufficient budget to purchase player.');
    }
}

async function updateUser(id, userdata) {
    if (userdata.password !== '') {
        userdata.password = await bcrypt.hash(userdata.password, 10);
    } else {
        delete userdata.password;
    }
    return await userRepo.updateUser(id, userdata);
}

async function deleteUser(id) {
    return await userRepo.deleteUser(id);
}

module.exports = {
    signUp,
    getUserById,
    updateUser,
    login,
    deleteUser,
    canAffordPlayer,
};