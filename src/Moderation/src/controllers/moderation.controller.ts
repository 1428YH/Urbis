import type { Request, Response, NextFunction } from 'express'
import { callAgent } from "../agent/mistral.js"
import { safeParse } from '../utilities/parse.js'
import { validateModeration } from '../service/validate/moderation.validate.js'
import { SystemPromptModerate } from '../utilities/prompts/moderation.prompt.js'


export const moderation = async (req: Request, res: Response, next: NextFunction ) => {
    const body = req.body as { title: string; description?: string; lvl: number }
    if (!body) {
        res.status(400).json({ error: 'title is required' })
        return
    }

    try {
    const userMessage = [
        `Заголовок: ${body.title}`,
        `Описание: ${body.description ?? "не указано"}`,
        `Уровень (от пользователя): ${body.lvl}`,
    ].join("\n")

    const result = await callAgent({
        userMessage, 
        systemPrompt: SystemPromptModerate, 
        temperature: 0.2
    })

    if (!result) {
        res.status(500).json({ error: 'AGENT_RETURNED_EMPTY' })
        return
    }

    const parse = safeParse(result);
    if (parse === false) {
        res.status(500).json({ error: 'ERROR_PARSE_FAILED' })
        return
    }

    const error = validateModeration(parse);
    if (error) {
        res.status(500).json({ error:'ERROR_VALIDATE_FAILED'});
        return;
    }

    res.json({reply: parse})

    } catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Moderation error:", errorMessage);
    res.status(500).json({ error: 'MODERATION_FAILED', details: errorMessage })
    }
}