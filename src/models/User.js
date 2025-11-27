const mongoose = require('mongoose');
const { roles } = require('../utils/roles');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    teams: { type: [ String ] },
    role: { type: String, enum: roles, default: "user", required: true },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);