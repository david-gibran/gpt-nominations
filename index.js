require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Endpoint to evaluate nomination messages
app.post('/evaluate', async (req, res) => {
  const { message, company_id, language } = req.body;

  try {
    // Fetch company guidelines
    const result = await pool.query(
      `SELECT REGEXP_REPLACE(string_agg(guideline, ', '), '[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ.,;:()\-]', '', 'g' ) as guidelines 
      FROM company_guidelines
      WHERE company_id = $1`,
      [company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const guidelines = result.rows[0].guidelines;

    const prompt = `
Company Guidelines:
${guidelines}

Nomination message:
"${message}"

Evaluate whether the message complies with the guidelines.
Return your response ONLY in valid JSON with the following structure:
{
  "statusCode": 1, // 1 = valid, 2 = warning, 3 = critical
  "message": "If statusCode is not 1, respond with a very short and friendly explanation (max 2 sentences).",
  "score": 0–100
}

Notes:
- Consider a message valid if it expresses gratitude or appreciation, even in simple or brief form.
- Messages such as "Thank you for your effort at the event" or similar should be accepted as valid if they clearly communicate recognition.
- Only return a warning if the message is extremely vague and provides no context at all (e.g. "Thanks", "Good job").
- Only use warning (2) if the message lacks clarity or feels too vague to be meaningful.
- In case of a warning, include a friendly suggestion to improve the message and end with:
  "Would you still like to send it?"
- Critical (3) should only be used in cases of offensive, inappropriate, or sensitive content.
- The explanation must be written in the following language: ${language}.
- Do not include any text before or after the JSON.
- Do not use markdown or backticks. Just return plain raw JSON.
Also include a "score" field (from 0 to 100) indicating how well the message complies with the guidelines.
- A score of 100 means the message is complete, well-written, and fully compliant.
- A score of 0 means the message is completely inadequate or inappropriate.
- A typical valid message should score above 80.
- Weak but acceptable messages might score 60–79.
- Below 60 means the message needs significant improvement or might be invalid.
`;

    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: `${process.env.OPENAI_MODEL}`, 
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiReply = response.data.choices[0].message.content.trim();
    const parsed = JSON.parse(aiReply);

    res.json(parsed);

  } catch (error) {
    console.error('Evaluation error:', error.message);
    res.status(500).json({ error: 'An error occurred during evaluation' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT || 3000}`);
});