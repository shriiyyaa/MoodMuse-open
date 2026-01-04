/**
 * MoodMuse - LLM Prompts for Mood Analysis
 * 
 * These prompts are carefully crafted to extract nuanced emotional
 * information from user inputs. The prompts ask the LLM to return
 * structured JSON matching our MoodVector schema.
 * 
 * Design Philosophy:
 * - Be empathetic, not clinical
 * - Detect nuance (e.g., "I'm fine" might mask sadness)
 * - Consider cultural context for emojis
 * - Return consistent, structured output
 */

/**
 * System prompt that establishes the LLM's role and output format.
 */
export const MOOD_SYSTEM_PROMPT = `You are an empathetic mood analyst for MoodMuse, a music companion app.
Your job is to understand the emotional state behind what users share.

You must return a JSON object with this exact structure:
{
  "vector": {
    "valence": <number -1 to 1>,      // negative to positive
    "energy": <number 0 to 1>,         // calm to energetic
    "tension": <number 0 to 1>,        // relaxed to anxious
    "melancholy": <number 0 to 1>,     // none to deep sadness
    "nostalgia": <number 0 to 1>,      // present to longing for past
    "hope": <number 0 to 1>,           // despair to optimistic
    "intensity": <number 0 to 1>,      // subtle to overwhelming
    "social": <number -1 to 1>         // seeking solitude to seeking connection
  },
  "primaryMood": "<2-4 word description>",
  "confidence": <number 0 to 1>
}

Guidelines:
- Be nuanced. "I'm fine" with sad emojis suggests masking.
- Consider the FULL context of all inputs together.
- Primary mood should be poetic but accurate (e.g., "quiet melancholy", "restless hope").
- Confidence reflects how clear the emotional signal is.

Return ONLY valid JSON, no explanation.`;

/**
 * Generates the user prompt for analyzing text input.
 */
export function createTextAnalysisPrompt(text: string): string {
    return `Analyze this emotional expression:

"${text}"

What is this person feeling? Return the mood vector as JSON.`;
}

/**
 * Generates the user prompt for analyzing emoji input.
 */
export function createEmojiAnalysisPrompt(emojis: string): string {
    return `These emojis express someone's current mood:

${emojis}

Interpret the emotional meaning holistically, not emoji-by-emoji.
Consider: cultural context, combinations, repetition patterns.
A string of the same emoji often indicates intensity.
Some emojis have different meanings (🙃 often means "dying inside").

Return the mood vector as JSON.`;
}

/**
 * Generates the user prompt for analyzing combined text + emoji input.
 */
export function createCombinedAnalysisPrompt(text: string, emojis: string): string {
    return `Someone shared their feelings using text and emojis together:

Text: "${text}"
Emojis: ${emojis}

Analyze these TOGETHER as a unified expression.
Look for:
- Do the emojis reinforce or contradict the text?
- Is there emotional masking? (saying "fine" with sad emojis)
- What's the overall emotional truth?

Return the mood vector as JSON.`;
}

/**
 * Generates an empathetic headline for the results page.
 * This is called after we have the mood and matched songs.
 */
export function createHeadlinePrompt(primaryMood: string): string {
    return `Create a short, empathetic headline (5-8 words max) for someone feeling "${primaryMood}".

The headline should:
- Feel warm and understanding
- Possibly include one fitting emoji
- Not be cheesy or generic
- Acknowledge their emotional state

Examples:
- "For your quiet storm ☁️"
- "When words fall short 🌙"
- "For the restless nights ✨"
- "Something for the ache 💜"

Return ONLY the headline text, nothing else.`;
}

/**
 * Generates an explanation for why a specific song matches the mood.
 */
export function createSongExplanationPrompt(
    songTitle: string,
    songArtist: string,
    songThemes: string[],
    primaryMood: string
): string {
    return `Write a 1-2 sentence explanation for why "${songTitle}" by ${songArtist} fits someone feeling "${primaryMood}".

Song themes: ${songThemes.join(', ')}

The explanation should:
- Feel warm and personal, not clinical
- Use "you" language (speak to them directly)
- Connect the song to their emotional state
- Avoid words like "algorithm", "match", "data", "recommendation"
- Sound like a thoughtful friend, not a robot

Examples of good explanations:
- "This one wraps around you like a familiar blanket — for when you need something that understands without asking."
- "Sometimes anger needs a voice. This track screams so you don't have to."
- "For staring at the ceiling at 3am, when your thoughts won't quiet down."

Return ONLY the explanation text, nothing else.`;
}
