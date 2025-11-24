const userRepo = require('../data/userRepo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function signUp(name, password) {
    const hashed = await bcrypt.hash(password, 10);
    return await userRepo.createUser({ name, password: hashed });
}

async function getUserById(id){
    const user = await userRepo.getUserById(id);
    return user;
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
            id: user._id,
            username: user.username,
            point: user.point,
            budget: user.budget,
            role: user.role,
        }
    };
}

async function updateUser(id, userdata) {
    const updatedUser = await userRepo.updateUser(id, userdata);
    return updatedUser;
}
module.exports = {
    signUp,
    getUserById,
    updateUser,
    login,
};