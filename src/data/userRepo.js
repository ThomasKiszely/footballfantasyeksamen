const User = require('../models/user');

async function createUser(userData) {
    const user = new User(userData);
    return await user.save();
}

async function getAllUsers() {
    return await User.find({});
}

async function getUserById(id) {
    return await User.findById(id);
}

async function getUserByName(username) {
    user = await User.findOne({username});
    return user;
}
async function addTeamToUser(userId, teamId) {
    return await User.findByIdAndUpdate(
        userId,
        { $push: { teams: teamId.toString() } },
        { new: true }
    );
}

async function updateUser(userId, userData){
    const updatedUser = User.findOneAndUpdate(userId, userData, {new: true, runValidators: true});
    return updatedUser;
}

async function deleteUser(userId) {
    const deleted = await User.findByIdAndDelete(userId);
    return deleted;
}


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByName,
    updateUser,
    deleteUser,
    addTeamToUser
};