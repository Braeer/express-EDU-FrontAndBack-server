const { prisma } = require('../prisma/prisma-client');

const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ error: 'Все поля обязательны к заполнению' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId,
        },
      });

      if (existingLike) {
        return res.status(400).json({ error: 'Вы уже поставили лайк этому посту' });
      }

      const like = await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error('Error in likePost', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
  unlikePost: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: 'Вы уже поставили дизлайк' });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: id,
          userId,
        },
      });

      if (!existingLike) {
        return res.status(400).json({ error: 'Нельзя удалить лайк' });
      }

      const like = await prisma.like.deleteMany({
        where: {
          postId: id,
          userId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error('Error in unlikePost', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
};

module.exports = LikeController;
