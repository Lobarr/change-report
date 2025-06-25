import {OpenAI, ClientOptions} from 'openai'

export const composeReport = async (
  daysCount: number,
  commitMessagesList: string[],
  modelName: string,
  maxTokens: number
): Promise<string> => {
  const opts: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY
  }
  if (process.env.OPENAI_API_BASE_URL) {
    opts.baseURL = process.env.OPENAI_API_BASE_URL
  }
  const client = new OpenAI(opts)

  const systemPrompt = `You are an AI-powered software delivery assistant, expertly integrated into a dynamic software development team.
    Your core mission is to synthesize comprehensive and engaging reports on our project's evolution over the past ${daysCount} days.
    These reports are crucial for internal team communication, designed to celebrate our successes and provide a clear overview of recent developments.
    You will be provided with a raw list of commit messages. Your task is to transform this data into a digestible, inspiring narrative.
    Beyond simply listing changes, aim to highlight **important and impactful contributions**, fostering a sense of pride and accomplishment within the team.
    Furthermore, subtly integrate a motivational element: if the detected activity level appears low, gently encourage greater future engagement without being overtly critical.
  `

  const userPrompt = `**Report Structure and Content:**
  1.  **Title:** Begin with a concise, catchy title that reflects the reporting period (e.g., "Last Week's Wins," "Sprint Review: Our Latest Achievements").
  2.  **Overall Summary:** Follow the title with a brief, high-level summary of the most significant and impactful changes across all categories. This should immediately convey the key takeaways.
  3.  **Categorization & Ordering:** Group related changes under clear, descriptive headings (e.g., "🚀 New Features & Enhancements," "🐛 Bug Squashes & Stability Improvements," "🧹 Refactorings & Technical Debt," "⚡ Performance Optimizations," "📝 Documentation Updates"). Order these categories by their perceived importance or impact on the project, with the most critical updates appearing first.
  4.  **Detail Level & Conciseness:** For individual updates within categories, provide enough detail to convey the essence of the change without being overly verbose. **Crucially, consolidate minor, trivial, or overly granular commit messages into more meaningful, summarized bullet points.** For example, multiple small bug fixes could be summarized as "Addressed various minor UI glitches across several components." Focus on the *what* and *why* of the change rather than just the *how*.
  5.  **Language and Tone:** Adopt a **simple, casual, and witty** tone. Use **active voice** throughout to emphasize our team's agency. Inject relevant and engaging **emojis** to enhance readability and make the report more visually appealing and friendly. Maintain a positive and encouraging voice.
  6.  **Plain Text Formatting:** The entire report, *excluding the Mermaid diagram section*, should be in **plain text**. Avoid any markdown (e.g., bolding, italics, bullet points beyond simple hyphens if necessary), HTML, or other special formatting. Use clear line breaks between sections and bullet points for readability.
  7.  **Length:** Keep the overall report **short and highly summarized**. If there are a large number of changes, prioritize summarization and focus on the most impactful items rather than listing everything. The goal is quick comprehension, not an exhaustive log.

  ---

  **Mermaid Diagram of System Evolution:**
  Following the main report, include a separate section titled "System Evolution Diagram (Mermaid)" which contains **only** the Mermaid syntax for a diagram illustrating how key components or modules of the system have evolved based on the major changes identified in the commit messages.

  -   Focus on high-level relationships and changes, not granular details.
  -   Use flowcharts or class diagrams if appropriate to show dependencies or new components.
  -   Represent major features, refactorings, or new integrations as nodes or processes.
  -   Use arrows to show dependencies or flow of changes.
  -   Keep the diagram concise and readable, representing the most significant architectural or component-level shifts.
  -   **The output for this section MUST be valid Mermaid syntax. Do not add any explanatory text around the Mermaid code within that section.**

  ---

  **Example of Desired Output Style (conceptual, remember no markdown for the main report):**
  Weekly Wins!
  We've had a productive week, rolling out some exciting new features, squashing critical bugs, and giving our performance a nice boost!

  🚀 New Features & Enhancements
  - Launched the redesigned user dashboard for a smoother experience.
  - Introduced a new notification system for real-time alerts.

  🐛 Bug Squashes & Stability Improvements
  - Fixed persistent login issues affecting some users.
  - Patched several critical security vulnerabilities.

  System Evolution Diagram (Mermaid)
  graph TD
      A[Old UI] --> B(New Dashboard Feature);
      C[Auth Module] --> D{New Notification System};
      E[Database] --> F[Performance Optimizations];
      B --> G[API Layer];
      D --> G;
      C --> B;
  `

  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user', content: userPrompt},
      {role: 'user', content: 'Commit messages:'},
      {role: 'user', content: commitMessagesList.join('\n')},
      {role: 'assistant', content: 'Report:'}
    ],
    max_tokens: maxTokens,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
    temperature: 0.5,
    top_p: 1,
    n: 1
  })

  return completion.choices[0].message?.content || ''
}
