const { Command } = require('commander');
const { Configuration, OpenAIApi } = require('openai');

const program = new Command();

program
  .option('-p, --prompt <text>', 'Text prompt for the API')
  .option('-n, --num <number>', 'Number of interactions with the API', parseInt)
  .parse(process.argv);

if (!program.prompt || !program.num) {
  console.error('Both prompt and num options are required.');
  process.exit(1);
}

const config = new Configuration({
  apiKey: process.env.CHATGPT_API_KEY,
});

const openai = new OpenAIApi(config);

async function getResponses(prompt, num) {
  const responses = [];

  for (let i = 0; i < num; i++) {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
    });

    responses.push(response.data.choices[0]?.message?.content);
  }

  return responses;
}

async function main() {
  const responses = await getResponses(program.prompt, program.num);
  const concatenatedResponses = responses.join(' ');

  const summaryResponse = await openai.createCompletion({
    model: 'gpt-3.5-turbo',
    prompt: concatenatedResponses,
    max_tokens: 50,
  });

  console.log('Original Responses:', responses);
  console.log('Concatenated Responses:', concatenatedResponses);
  console.log('Summary:', summaryResponse.data.choices[0]?.text);
}

main();
