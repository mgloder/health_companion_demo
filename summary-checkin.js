import OpenAI from 'openai';

export async function handler(req, res) {
  try {
    const { summary } = req.body;
    const { dispatcher } = req;

    if (!summary) {
      throw new Error('Summary is required');
    }

    if (!dispatcher) {
      throw new Error('Dispatcher is required');
    }

    // Create OpenAI client with custom fetch using our dispatcher
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, { ...options, dispatcher });
          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
          return response;
        } catch (error) {
          console.error('OpenAI API fetch error:', {
            url,
            error: error.message,
            stack: error.stack
          });
          throw new Error(`Failed to connect to OpenAI API: ${error.message}`);
        }
      }
    });

    console.log('Making OpenAI request for summary:', summary);
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a parser that converts exercise summaries into structured JSON arrays. 
          The output should be an array of objects, where each object has an exercise name as the key and contains frequency and duration properties, without any unit or other information.`
        },
        {
          role: "user",
          content: `format it into json： "${summary}"`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const result = JSON.parse(completion.choices[0].message.content);

    console.log('Successfully parsed exercise data:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('Exercise parsing error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Specific error messages for different scenarios
    if (error.message.includes('OpenAI API')) {
      res.status(503).json({
        error: 'OpenAI service unavailable',
        details: error.message
      });
    } else if (error.message.includes('Invalid')) {
      res.status(422).json({
        error: 'Invalid data received',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}
