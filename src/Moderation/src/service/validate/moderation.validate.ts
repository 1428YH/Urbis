export function validateModeration(data: unknown): string | null {
    if (typeof data !== "object" || data === null) return "data is not an object";
    const d = data as Record<string, unknown>;
    if (!["publish", "review", "reject"].includes(d.action as string)) return "invalid action";
    if (![1, 2, 3].includes(d.level as number)) return "invalid level";
    if (typeof d.fake !== "number" || d.fake < 0 || d.fake > 1) return "invalid fake";
    if (typeof d.text !== "string" || d.text.trim() === "") return "invalid text";
    if (typeof d.reason !== "string" || d.reason.trim() === "") return "invalid reason";
    return null;
}