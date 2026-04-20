import { Mistral } from "@mistralai/mistralai";
import { loadConfig } from "../config/load.js";

export interface CallAgentOptions {
    userMessage: string;
    systemPrompt: string;
    temperature: number; 
    maxTokens?: number
}

let _client: Mistral | null = null;

async function getClient(): Promise<Mistral> {
    if (!_client) {
        const config = await loadConfig();
        _client = new Mistral({apiKey: config.mistralKey});
    }

    return _client;
}

export async function callAgent(opts: CallAgentOptions) {
    const config = await loadConfig();
    let client = await getClient();
    
    try {
        const response = await client.chat.complete({
            model: config.mistralModel,
            temperature: opts.temperature,
            maxTokens: opts.maxTokens ?? 8192,
            messages: [
                {role: "system", content: opts.systemPrompt},
                {role: "user", content: opts.userMessage}
            ]
        })

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response");

        return content as string
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Mistral API error:", errorMessage);
        return;
    }
}