const { prisma } = require('../prisma/prisma-client');

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res.status(400).json({ error: 'Нельзя подписаться на себя' });
    }

    try {
      let exitingSubscription = null;
      try {
        exitingSubscription = await prisma.follows.findFirst({
          where: {
            AND: [{ followerId: userId }, { followingId }],
          },
        });
      } catch (error) {
        return res.status(400).json({ error: 'Нельзя подписаться на этого пользователя' });
      }

      if (exitingSubscription) {
        return res.status(400).json({ error: 'Вы уже подписаны на этого пользователя' });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: 'Подписка создана' });
    } catch (error) {
      console.error('Error in followUser', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
  unFollowUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: 'Вы не подписаны на этого пользователя' });
      }

      await prisma.follows.delete({
        where: {
          id: follows.id,
        },
      });

      res.status(201).send({ message: 'Подписка отменена' });
    } catch (error) {
      console.error('Error in unFollowUser', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
};

module.exports = FollowController;
