import dotenv from "dotenv"
dotenv.config()

export interface AppConfig {
    mistralKey: string;
    mistralModel: string;
    agentPort: Number;
}

export async function loadKey(): Promise<string> {
    const key = process.env.MISTRAL_KEY;
    if (!key) throw new Error("API_KEY_LOAD_ERROR");
    
    return key;
}

export async function loadConfig(): Promise<AppConfig> {
    const key = await loadKey();

    return {
        mistralKey: key,
        mistralModel: process.env.MISTRAL_MODEL ?? "mistral-small-latest",
        agentPort: Number(process.env.AGENT_PORT) ?? 3000
    }
}

