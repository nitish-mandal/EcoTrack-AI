import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/posts', protect, async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, ecoPoints: true },
        },
      },
    });

    const allCommentUserIds = Array.from(
      new Set(posts.flatMap(p => ((p.comments as any[]) || []).map(c => c.userId)))
    );

    const commentUsers = await prisma.user.findMany({
      where: { id: { in: allCommentUserIds } },
      select: { id: true, name: true, avatar: true },
    });

    const commentUserMap = new Map(commentUsers.map(u => [u.id, u]));

    const populatedPosts = posts.map(p => {
      const comments = ((p.comments as any[]) || []).map(c => ({
        ...c,
        user: commentUserMap.get(c.userId) || { id: c.userId, name: 'Eco User', avatar: '' },
      }));
      return {
        ...p,
        userId: p.user, // To match mongoose return structure where populated userId is the user object
        comments,
      };
    });

    res.json({ success: true, data: populatedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error });
  }
});

router.post('/posts', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const { content, imageUrl, tags, type, challengeId } = req.body;
    
    const post = await prisma.communityPost.create({
      data: {
        userId,
        content,
        imageUrl,
        tags: tags || [],
        type: type || 'post',
        challengeId,
      },
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post', error });
  }
});

router.post('/posts/:id/like', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    
    const liked = post.likes.includes(userId);
    const updatedLikes = liked ? post.likes.filter(l => l !== userId) : [...post.likes, userId];
    
    await prisma.communityPost.update({
      where: { id: post.id },
      data: {
        likes: {
          set: updatedLikes,
        },
      },
    });

    res.json({ success: true, likes: updatedLikes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like post', error });
  }
});

router.post('/posts/:id/comment', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    const currentComments = (post.comments as any[]) || [];
    const updatedComments = [...currentComments, { userId, content: req.body.content, createdAt: new Date() }];

    const updatedPost = await prisma.communityPost.update({
      where: { id: post.id },
      data: {
        comments: updatedComments,
      },
    });

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add comment', error });
  }
});

export default router;
