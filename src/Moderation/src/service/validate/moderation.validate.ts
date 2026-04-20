export function validateModeration(data: unknown): string | null {
    if (typeof data !== "object" || data === null) return "data is not an object";
    
    const d = data as Record<string, unknown>;
    
    const action = d.action as string;
    if (!["publish", "review", "reject"].includes(action)) return "invalid action";
    if (![1, 2, 3].includes(d.level as number)) return "invalid level";
    if (typeof d.fake !== "number" || d.fake < 0 || d.fake > 1) return "invalid fake";
    
    if (typeof d.text !== "string") return "invalid text";
    if (action !== "reject" && d.text.trim() === "") return "invalid text: empty text on non-reject";
    
    if (typeof d.reason !== "string" || d.reason.trim() === "") return "invalid reason";
    
    return null;
}