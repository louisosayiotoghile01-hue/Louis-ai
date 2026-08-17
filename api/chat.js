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

        const conversation = Array.isArray(history)
            ? history.slice(-10)
            : [];

        const input = [
            ...conversation.map(item => ({
                role: item.role === "assistant" ? "assistant" : "user",
                content: item.message
            }))
        ];

        if (
            input.length === 0 ||
            input[input.length - 1].content !== message
        ) {
            input.push({
                role: "user",
                content: message
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + process.env.OPENAI_API_KEY
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
                error:
                    data.error?.message ||
                    "AI request failed"
            });
        }

        let reply = data.output_text;

        if (!reply && data.output) {

            for (const item of data.output) {

                if (item.content) {

                    for (const content of item.content) {

                        if (
                            content.type === "output_text" &&
                            content.text
                        ) {
                            reply = content.text;
                            break;
                        }
                    }
                }

                if (reply) break;
            }
        }

        if (!reply) {
            return res.status(500).json({
                error: "OpenAI returned no text response."
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("API ERROR:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}
