const User = require('../models/User');

/**
 * Send a Friend Request
 */
exports.sendFriendRequest = async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.session.userId;

  if (!targetUserId || targetUserId === currentUserId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({ error: 'Invalid target user' });
    }
    req.session.error = 'Invalid target user.';
    return res.redirect('/social');
  }

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(404).json({ error: 'User not found' });
      }
      req.session.error = 'User not found.';
      return res.redirect('/social');
    }

    const currentFriends = currentUser.profile.friends || [];
    const targetRequests = targetUser.profile.friendRequests || [];

    if (currentFriends.includes(targetUserId)) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Already friends' });
      }
      req.session.info = 'You are already friends with this student.';
      return res.redirect('/social');
    }

    if (!targetRequests.includes(currentUserId)) {
      targetUser.profile = {
        ...targetUser.profile,
        friendRequests: [...targetRequests, currentUserId]
      };
      await targetUser.save();
    }

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ success: true, message: 'Friend request sent!' });
    }

    req.session.success = 'Friend request sent successfully!';
    res.redirect('/social');
  } catch (error) {
    console.error('Send Friend Request Error:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    req.session.error = 'An error occurred while sending friend request.';
    res.redirect('/social');
  }
};

/**
 * Accept a Friend Request
 */
exports.acceptFriendRequest = async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.session.userId;

  if (!targetUserId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(400).json({ error: 'Invalid target user' });
    }
    req.session.error = 'Invalid target user.';
    return res.redirect('/social');
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(404).json({ error: 'User not found' });
      }
      req.session.error = 'User not found.';
      return res.redirect('/social');
    }

    const myRequests = (currentUser.profile.friendRequests || []).filter(id => id !== targetUserId);
    const myFriends = currentUser.profile.friends || [];
    const targetFriends = targetUser.profile.friends || [];

    if (!myFriends.includes(targetUserId)) {
      myFriends.push(targetUserId);
    }
    if (!targetFriends.includes(currentUserId)) {
      targetFriends.push(currentUserId);
    }

    currentUser.profile = {
      ...currentUser.profile,
      friends: myFriends,
      friendRequests: myRequests
    };

    targetUser.profile = {
      ...targetUser.profile,
      friends: targetFriends
    };

    await currentUser.save();
    await targetUser.save();

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ success: true, message: 'Friend request accepted!' });
    }

    req.session.success = `You are now friends with ${targetUser.profile.fullName}!`;
    res.redirect('/social');
  } catch (error) {
    console.error('Accept Friend Request Error:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    req.session.error = 'An error occurred while accepting friend request.';
    res.redirect('/social');
  }
};

/**
 * Reject or Cancel Friend Request
 */
exports.rejectFriendRequest = async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.session.userId;

  try {
    const currentUser = await User.findById(currentUserId);
    if (currentUser) {
      const myRequests = (currentUser.profile.friendRequests || []).filter(id => id !== targetUserId);
      currentUser.profile = {
        ...currentUser.profile,
        friendRequests: myRequests
      };
      await currentUser.save();
    }

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ success: true, message: 'Friend request declined' });
    }

    req.session.info = 'Friend request declined.';
    res.redirect('/social');
  } catch (error) {
    console.error('Reject Friend Request Error:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.redirect('/social');
  }
};

/**
 * Remove Friend
 */
exports.removeFriend = async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.session.userId;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (currentUser) {
      currentUser.profile = {
        ...currentUser.profile,
        friends: (currentUser.profile.friends || []).filter(id => id !== targetUserId)
      };
      await currentUser.save();
    }

    if (targetUser) {
      targetUser.profile = {
        ...targetUser.profile,
        friends: (targetUser.profile.friends || []).filter(id => id !== currentUserId)
      };
      await targetUser.save();
    }

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({ success: true, message: 'Friend removed' });
    }

    req.session.info = 'Friend removed.';
    res.redirect('/social');
  } catch (error) {
    console.error('Remove Friend Error:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.redirect('/social');
  }
};

/**
 * Get Direct Chat & Discussion History between current user and friend
 */
exports.getChatHistory = async (req, res) => {
  const { friendId } = req.params;
  const currentUserId = req.session.userId;

  try {
    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const myMessages = currentUser.profile.chatMessages || [];
    const friendMessages = friendUser.profile.chatMessages || [];

    // Filter messages exchanged between these two users
    const allExchanged = [...myMessages, ...friendMessages].filter(msg =>
      (msg.senderId === currentUserId && msg.receiverId === friendId) ||
      (msg.senderId === friendId && msg.receiverId === currentUserId)
    );

    // Deduplicate by message id
    const uniqueMessagesMap = new Map();
    allExchanged.forEach(msg => {
      uniqueMessagesMap.set(msg.id || `${msg.timestamp}-${msg.senderId}`, msg);
    });

    const sortedMessages = Array.from(uniqueMessagesMap.values()).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    return res.json({
      friend: {
        id: friendUser._id,
        fullName: friendUser.profile.fullName,
        careerGoal: friendUser.profile.careerGoal,
        githubUsername: friendUser.profile.githubUsername,
        linkedinUsername: friendUser.profile.linkedinUsername
      },
      messages: sortedMessages
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Send Direct Chat & Discussion Message to a Friend
 */
exports.sendChatMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const currentUserId = req.session.userId;

  if (!receiverId || !text || !text.trim()) {
    return res.status(400).json({ error: 'Receiver ID and message text are required.' });
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const receiverUser = await User.findById(receiverId);

    if (!currentUser || !receiverUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure they are friends before allowing direct discussion
    const isFriend = (currentUser.profile.friends || []).includes(receiverId);
    if (!isFriend) {
      return res.status(403).json({ error: 'You can only chat and discuss with your connected friends.' });
    }

    const newMsg = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
      senderId: currentUserId,
      senderName: currentUser.profile.fullName || 'Student',
      receiverId,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Store message in both profiles for persistence
    const myChat = currentUser.profile.chatMessages || [];
    const receiverChat = receiverUser.profile.chatMessages || [];

    currentUser.profile = {
      ...currentUser.profile,
      chatMessages: [...myChat, newMsg]
    };

    receiverUser.profile = {
      ...receiverUser.profile,
      chatMessages: [...receiverChat, newMsg]
    };

    await currentUser.save();
    await receiverUser.save();

    return res.json({
      success: true,
      message: newMsg
    });
  } catch (error) {
    console.error('Send Chat Message Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
