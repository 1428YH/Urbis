export function validateModeration(data: unknown): string | null {
    if (typeof data !== "object" || data === null) {
        return "data is not an object";
    }
    
    const d = data as Record<string, unknown>;
    
    const action = d.action as string;
    if (!["publish", "review", "reject"].includes(action)) {
        return "invalid action";
    }
    
    const lvl = d.lvl as number;
    if (![1, 2, 3].includes(lvl)) {
        return "invalid level";
    }
    
    const text = d.text as string;
    if (typeof text !== "string") {
        return "invalid text";
    }
    if (action !== "reject" && text.trim() === "") {
        return "invalid text: empty text on non-reject";
    }
    
    const reason = d.reason as string;
    if (typeof reason !== "string" || reason.trim() === "") {
        return "invalid reason";
    }
    
    return null;
}