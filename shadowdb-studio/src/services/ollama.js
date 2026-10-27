const OLLAMA_HOST = "http://127.0.0.1:11434";

export async function checkOllamaStatus() {
    try {
        const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: "GET" });
        return res.ok;
    } catch {
        return false;
    }
}

export function extractSqlFromResponse(text) {
    const match = text.match(/```sql\s*([\s\S]*?)\s*```/i);
    if (match) return match[1].trim();
    return text.replace(/```/g, "").trim();
}

export async function generateSQL(schemaDDL, userQuestion) {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "shadowdb",
            messages: [
                {
                    role: "user",
                    content: `### Database Schema:\n${schemaDDL.trim()}\n\n### User Question:\n${userQuestion.trim()}`
                }
            ],
            stream: false,
            options: {
                temperature: 0.0
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.message.content;
    return {
        raw: rawText,
        sql: extractSqlFromResponse(rawText)
    };
}