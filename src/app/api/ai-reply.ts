import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Reply to the following email message:' },
      { role: 'user', content: message },
    ],
  });

  const reply = chat.choices[0].message.content;
  res.status(200).json({ reply });
}
