import OpenAI from 'openai'

// OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
})

export const analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body

    // Validation
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        message: 'No code provided.',
      })
    }

    if (code.length > 10000) {
      return res.status(400).json({
        message: 'Code is too long. Max 10000 characters.',
      })
    }

    // Prompt
    const prompt = `
You are an expert code reviewer.

Analyze this ${language} code and return ONLY valid JSON in this exact structure:

{
  "bugs": [],
  "optimizations": [],
  "readability": [],
  "summary": ""
}

Rules:
- bugs = possible bugs or risky code
- optimizations = performance improvements
- readability = cleaner code suggestions
- Max 4 items per array
- Keep points short and actionable
- No markdown
- No explanation outside JSON

Code:
\`\`\`${language}
${code}
\`\`\`
`

    console.log(`[AI] Reviewing ${language} code...`)

    // AI request
    const completion = await openai.chat.completions.create({
      model: 'openrouter/auto',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

      temperature: 0.3,
      max_tokens: 700,
    })

    // AI raw response
    const rawResponse =
      completion.choices[0].message.content.trim()

    console.log('[AI RAW RESPONSE]')
    console.log(rawResponse)

    // Parse AI JSON
    let analysis

    try {
      analysis = JSON.parse(rawResponse)
    } catch (parseError) {
      console.error('[AI JSON PARSE ERROR]')
      console.error(rawResponse)

      return res.status(500).json({
        message: 'AI returned invalid response.',
      })
    }

    // Safe response structure
    const result = {
      bugs: Array.isArray(analysis.bugs)
        ? analysis.bugs
        : [],

      optimizations: Array.isArray(
        analysis.optimizations
      )
        ? analysis.optimizations
        : [],

      readability: Array.isArray(
        analysis.readability
      )
        ? analysis.readability
        : [],

      summary:
        typeof analysis.summary === 'string'
          ? analysis.summary
          : 'Analysis completed.',
    }

    return res.status(200).json({
      analysis: result,
    })

  } catch (error) {
    console.error('[AI ERROR]')
    console.error(error)

    // Invalid API key
    if (error.status === 401) {
      return res.status(401).json({
        message: 'Invalid API key.',
      })
    }

    // Rate limits
    if (
      error.status === 429 ||
      error.code === 'insufficient_quota'
    ) {
      return res.status(429).json({
        message:
          'Rate limit reached. Try again later.',
      })
    }

    return res.status(500).json({
      message: 'AI analysis failed.',
    })
  }
}