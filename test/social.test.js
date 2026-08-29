const test = require('node:test');
const assert = require('node:assert');
const socialController = require('../controllers/socialController');

test('sendFriendRequest adds user ID to target friendRequests array', async () => {
  const req = {
    body: { targetUserId: 'user2' },
    session: { userId: 'user1' },
    xhr: true,
    headers: { accept: 'application/json' }
  };

  let resStatus = 200;
  let resJson = null;

  const res = {
    status(code) {
      resStatus = code;
      return this;
    },
    json(data) {
      resJson = data;
      return this;
    }
  };

  // Mock User.findById
  const User = require('../models/User');
  const originalFindById = User.findById;

  const user1 = { _id: 'user1', profile: { fullName: 'User One', friends: [], friendRequests: [] } };
  const user2 = { _id: 'user2', profile: { fullName: 'User Two', friends: [], friendRequests: [] }, save: async () => {} };

  User.findById = async (id) => {
    if (id === 'user1') return user1;
    if (id === 'user2') return user2;
    return null;
  };

  try {
    await socialController.sendFriendRequest(req, res);
    assert.strictEqual(resStatus, 200);
    assert.strictEqual(resJson.success, true);
    assert.ok(user2.profile.friendRequests.includes('user1'));
  } finally {
    User.findById = originalFindById;
  }
});

test('acceptFriendRequest connects two users as friends', async () => {
  const req = {
    body: { targetUserId: 'user2' },
    session: { userId: 'user1' },
    xhr: true,
    headers: { accept: 'application/json' }
  };

  let resStatus = 200;
  let resJson = null;

  const res = {
    status(code) {
      resStatus = code;
      return this;
    },
    json(data) {
      resJson = data;
      return this;
    }
  };

  const User = require('../models/User');
  const originalFindById = User.findById;

  const user1 = { _id: 'user1', profile: { fullName: 'User One', friends: [], friendRequests: ['user2'] }, save: async () => {} };
  const user2 = { _id: 'user2', profile: { fullName: 'User Two', friends: [], friendRequests: [] }, save: async () => {} };

  User.findById = async (id) => {
    if (id === 'user1') return user1;
    if (id === 'user2') return user2;
    return null;
  };

  try {
    await socialController.acceptFriendRequest(req, res);
    assert.strictEqual(resStatus, 200);
    assert.strictEqual(resJson.success, true);
    assert.ok(user1.profile.friends.includes('user2'));
    assert.ok(user2.profile.friends.includes('user1'));
    assert.strictEqual(user1.profile.friendRequests.includes('user2'), false);
  } finally {
    User.findById = originalFindById;
  }
});
