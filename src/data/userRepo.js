const User = require('../models/user');

async function createUser(userData) {
    const user = new User(userData);
    return await user.save();
}

async function getAllUsers() {
    return await User.find({});
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
    updateUser,
    deleteUser,
};