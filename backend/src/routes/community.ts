import { Router, Request, Response } from 'express';
import CommunityPost from '../models/CommunityPost';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/posts', protect, async (_req: Request, res: Response) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(20)
      .populate('userId', 'name avatar ecoPoints')
      .populate('comments.userId', 'name avatar');
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error });
  }
});

router.post('/posts', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await CommunityPost.create({ userId: req.user?.id, ...req.body });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post', error });
  }
});

router.post('/posts/:id/like', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    const userId = req.user?.id as any;
    const liked = post.likes.some(l => l.toString() === userId);
    if (liked) post.likes = post.likes.filter(l => l.toString() !== userId);
    else post.likes.push(userId);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like post', error });
  }
});

router.post('/posts/:id/comment', protect, async (req: AuthRequest, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    post.comments.push({ userId: req.user?.id as any, content: req.body.content, createdAt: new Date() });
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add comment', error });
  }
});

export default router;
