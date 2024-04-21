const { prisma } = require('../prisma/prisma-client');

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Все поля обязательны к заполнению' });
    }
    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch {
      console.error('Error in createPost', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },

  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    try {
      const posts = await prisma.post.findMany({
        include: {
          // author: {
          //   select: {
          //     id: true,
          //     name: true,
          //     avatarUrl: true,
          //   },
          // },
          author: true,
          likes: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const postWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error('Error in getAllPosts', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },

  getPostById: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          author: true,
          likes: true,
        },
      });

      if (!post) {
        return res.status(404).json({ error: 'Пост не найден' });
      }
      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error('Error in getPostById', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },

  deletePost: async (req, res) => {
    const { id } = req.params;

    let post = null;

    try {
      post = await prisma.post.findUnique({ where: { id } });
    } catch {
      return res.status(400).json({ error: 'Пост не найден' });
    }

    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      console.error('Error in deletePost', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
};

module.exports = PostController;
