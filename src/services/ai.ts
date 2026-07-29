const AI_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const AI_API_KEY = "sk-VEeGua9LQf8sg6lJpB3sEodxeUlNt5ii46Cr8AyO9TRhNSnWwm79SdbOElxsFM5V";
const AI_MODEL = "minimax-m3";

export async function aiChat(
  messages: { role: "user" | "system"; content: string }[],
  jsonMode = false
): Promise<string | null> {
  try {
    const body: Record<string, unknown> = {
      model: AI_MODEL,
      messages,
      max_tokens: jsonMode ? 500 : 800,
      temperature: jsonMode ? 0.1 : 0.3,
    };
    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    return rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || null;
  } catch {
    return null;
  }
}
