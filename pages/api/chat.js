import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fallbackResponses = [
  "I'm sorry, I didn't quite understand that. Can you rephrase your question?",
  "I'm here to assist you, but I need a bit more information. Could you clarify your question?",
  "I'm not sure how to answer that, but I can help with other queries. What else can I do for you?",
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });

      let botMessage = completion.choices[0].message.content.trim();

      if (!botMessage || botMessage.length < 3) {
        botMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      let link = "";
      let image = "";

      if (message.toLowerCase().includes("website")) {
        link = "https://www.greenstone.software";
      }

      if (message.toLowerCase().includes("product")) {
        image = "https://via.placeholder.com/150";
      }

      res.status(200).json({ response: botMessage, link, image });
    } catch (error) {
      console.error('Error in chat API:', error);
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      res.status(500).json({ error: 'Internal Server Error', response: fallbackResponse });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}