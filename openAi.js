const OpenAI = require("openai");

const openAi = async (req, res) => {
  const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
  });

  const stream = await client.responses.create({
    model: "gpt-4o",
    input: 'Say "Sheep sleep deep" ten times fast!',
    stream: true,
  });

  for await (const event of stream) {
    console.log(event);
  }

  res.json({ msg: "hello" });
};

module.exports = openAi;
