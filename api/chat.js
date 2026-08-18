module.exports = async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message, history, memory } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Recent conversation
        const conversation = Array.isArray(history)
            ? history.slice(-10)
            : [];

        // Personal memory
        const personalMemory =
            memory && typeof memory === "object"
                ? memory
                : {};

        // Louis AI instructions
        const input = [

            {
                role: "developer",

                content: `
You are Louis AI, a helpful and intelligent personal AI assistant.

Your job is to have natural conversations with the user.

IMPORTANT RULES:

1. Give a direct answer to the user's current question.

2. Use recent conversation history to understand context.

3. Understand follow-up questions such as:
   - "it"
   - "that"
   - "this"
   - "they"
   - "he"
   - "she"
   - "what about it?"
   - "tell me more"
   - "why?"
   - "how?"

4. Connect follow-up questions to the correct subject from the previous conversation.

5. Use saved personal memory when it is relevant.

6. Never invent personal information about the user.

7. If the user tells you something personal and it is saved in memory, use it naturally when appropriate.

8. Maintain the current topic unless the user clearly changes the subject.

9. If the user asks a follow-up question, do not ask them to repeat information already available in the conversation.

10. Give clear, useful and natural answers.

11. You are Louis AI.

12. Do not claim to be ChatGPT or another assistant.

13. When information is uncertain, say so instead of making up facts.

14. For creative requests such as stories, poems, ideas or examples, actually complete the request.

15. Do not simply greet the user when they ask a specific question.

16. Keep responses reasonably concise unless the user asks for more detail.
`
            }

        ];

        // Add personal memory
        if (Object.keys(personalMemory).length > 0) {

            input.push({
                role: "developer",

                content:
                    "Saved personal memory about the user:\n" +
                    JSON.stringify(personalMemory)
            });

        }

        // Add recent conversation
        for (const item of conversation) {

            if (!item || !item.message) {
                continue;
            }

            input.push({

                role:
                    item.role === "assistant"
                        ? "assistant"
                        : "user",

                content: String(item.message)

            });

        }

        // Always make sure the current message is included
        input.push({
            role: "user",
            content: message
        });

        // Call OpenAI
        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        "Bearer " +
                        process.env.OPENAI_API_KEY
                },

                body: JSON.stringify({

                    model: "gpt-4.1-mini",

                    input: input

                })
            }
        );

        const data = await response.json();

        // OpenAI returned an error
        if (!response.ok) {

            console.error(
                "OpenAI ERROR:",
                JSON.stringify(data)
            );

            return res.status(response.status).json({

                error:
                    data.error?.message ||
                    "OpenAI request failed"

            });

        }

        // Get response text
        let reply = data.output_text || "";

        // Fallback parser
        if (!reply && Array.isArray(data.output)) {

            for (const item of data.output) {

                if (!Array.isArray(item.content)) {
                    continue;
                }

                for (const content of item.content) {

                    if (
                        content.type === "output_text" &&
                        content.text
                    ) {

                        reply = content.text;

                        break;
                    }

                }

                if (reply) {
                    break;
                }

            }

        }

        // No response
        if (!reply) {

            console.error(
                "No text returned from OpenAI:",
                JSON.stringify(data)
            );

            return res.status(500).json({

                error:
                    "OpenAI returned no text response."

            });

        }

        // Send response back to Louis AI
        return res.status(200).json({

            reply: reply.trim()

        });

    } catch (error) {

        console.error(
            "LOUIS AI SERVER ERROR:",
            error
        );

        return res.status(500).json({

            error:
                "Louis AI server error: " +
                error.message

        });

    }

};
