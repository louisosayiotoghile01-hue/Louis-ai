export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is missing."
            });
        }

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
                    input: message
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "OpenAI request failed"
            });
        }

        // Get the text from the Responses API output
        let reply = "";

        if (data.output) {

            for (const item of data.output) {

                if (item.content) {

                    for (const content of item.content) {

                        if (content.type === "output_text" && content.text) {
                            reply += content.text;
                        }

                    }
                }
            }
        }

        if (!reply) {
            return res.status(500).json({
                error: "OpenAI returned no text.",
                response: data
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("API ERROR:", error);

        return res.status(500).json({
            error: error.message || "Server error"
        });
    }
}
