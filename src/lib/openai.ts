import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export interface SafetyResult {
    safe: boolean;
    issues: string[];
    suggestedTags: string[];
}

export const safetyCheck = async (title: string, useCase: string, prompt: string): Promise<SafetyResult> => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a specialized AI safety officer for a corporate prompt library. Analyze the provided prompt content for: 1. PII (emails, names, phone numbers), 2. Secrets (API keys, passwords), 3. Internal company data, 4. Inappropriate content. Return a JSON object with 'safe' (boolean), 'issues' (array of strings), and 'suggestedTags' (array of 3-5 keywords)."
            },
            {
                role: "user",
                content: JSON.stringify({ title, useCase, prompt })
            }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{"safe": false, "issues": ["Error parsing response"]}') as SafetyResult;
};

export const findPrompts = async (query: string, availablePrompts: any[]) => {
    const promptContext = availablePrompts.map(p => ({
        id: p.id,
        title: p.title,
        use_case: p.use_case,
        tags: p.tags
    }));

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant for a Prompt Library. A user is looking for a specific type of prompt. Analyze their request and the list of available prompts. Return a JSON object with: 1. 'answer' (a helpful sentence explaining your recommendation), 2. 'recommendedIds' (array of IDs from the context that match best), 3. 'suggestedSearch' (a simpler search keyword if no exact match is found)."
            },
            {
                role: "user",
                content: `User query: "${query}"\n\nAvailable prompts: ${JSON.stringify(promptContext)}`
            }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{"answer": "I couldn\'t find a match.", "recommendedIds": []}');
};
