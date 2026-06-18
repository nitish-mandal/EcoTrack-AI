import { Request, Response } from 'express';
import OpenAI from 'openai';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-openai-key' });

const SYSTEM_PROMPT = `You are EcoBot, an expert AI sustainability assistant for EcoTrack. 
You help users reduce their carbon footprint, learn about sustainability, and live eco-friendly lives.
Provide practical, actionable advice. Be encouraging, positive, and data-driven.
When asked about carbon reduction, provide specific numbers and percentages.
Always relate advice to the user's context when possible.`;

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    let session = sessionId ? await prisma.chatHistory.findUnique({ where: { id: sessionId } }) : null;
    if (!session) {
      session = await prisma.chatHistory.create({
        data: { userId, messages: [], sessionTitle: message.slice(0, 50) },
      });
    }

    const currentMessages = (session.messages as any[]) || [];
    const updatedMessages = [...currentMessages, { role: 'user', content: message, createdAt: new Date() }];

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...updatedMessages.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = openai.beta.chat.completions.stream({ model: 'gpt-4o-mini', messages, max_tokens: 1000 });

    let fullResponse = '';
    stream.on('chunk', (chunk) => {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    });

    const activeSession = session;
    stream.on('finalMessage', async () => {
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullResponse, createdAt: new Date() }];
      await prisma.chatHistory.update({
        where: { id: activeSession.id },
        data: { messages: finalMessages },
      });
      res.write(`data: ${JSON.stringify({ done: true, sessionId: activeSession.id })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'AI chat failed', error });
  }
};

export const getDailyTip = async (_req: Request, res: Response): Promise<void> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Give me one specific, actionable eco tip for today. Keep it under 100 words, make it inspiring.' },
      ],
      max_tokens: 150,
    });
    res.json({ success: true, tip: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tip', error });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

    const sessions = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get history', error });
  }
};

export const predictEmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentCO2, goals } = req.body;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Based on current CO2 of ${currentCO2}kg/day and goals: ${JSON.stringify(goals)}, predict my emissions trend for next 3 months and give specific reduction strategies. Return as JSON with: prediction (array of 3 monthly values), strategies (array of 3 tips), potentialSaving (number in kg CO2).` },
      ],
      response_format: { type: 'json_object' },
    });
    const prediction = JSON.parse(completion.choices[0].message.content || '{}');
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Prediction failed', error });
  }
};
