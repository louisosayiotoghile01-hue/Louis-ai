export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Keep only the most recent 10 messages
        const recentHistory = Array.isArray(history)
            ? history.slice(-10)
            : [];

        const input = [
            {
                role: "system",
                content: "You are Louis AI, a helpful personal AI assistant created by Louis. Be friendly, clear, helpful, and remember the conversation context provided to you."
            },
            ...recentHistory.map(item => ({
                role: item.role === "assistant" ? "assistant" : "user",
                content: String(item.message || "")
            })),
            {
                role: "user",
                content: message
            }
        ];

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + process.env.OPENAI_API_KEY
                },

                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    input: input
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "AI request failed"
            });
        }

let reply = "";

if (data.output_text) {
    reply = data.output_text;
} else if (data.output) {

    for (const item of data.output) {

        if (item.type === "message" && item.content) {

            for (const content of item.content) {

                if (content.type === "output_text") {
                    reply += content.text;
                }

            }
        }
    }
}

if (!reply) {
    reply = "I didn't receive a text response.";
}

return res.status(200).json({
    reply: reply
});

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Server error"
        });

    }
}
