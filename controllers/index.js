const UserController = require('./user-controller');
const CommentController = require('./comment-controller');
const LikeController = require('./like-controller');
const FollowController = require('./follow-controller');
const PostController = require('./post-controller');

module.exports = {
  UserController,
  PostController,
  CommentController,
  LikeController,
  FollowController,
};
