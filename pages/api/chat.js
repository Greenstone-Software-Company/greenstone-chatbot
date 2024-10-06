import OpenAI from 'openai';
import Cors from 'cors'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors)
  
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
      console.error("Error in chat API:", error);
      res.status(500).json({ error: "Internal server error", response: "I'm having trouble responding right now. Please try again later." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}