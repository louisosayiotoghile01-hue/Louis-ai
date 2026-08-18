module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message, history, memory } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const conversation = Array.isArray(history)
            ? history.slice(-10)
            : [];

        const personalMemory =
            memory && typeof memory === "object"
                ? memory
                : {};

        const input = [
            {
    role: "developer",
    content: `
You are Louis AI, a helpful and intelligent personal AI assistant.

Your job is to have natural conversations with the user and remember relevant information from the conversation.

IMPORTANT CONVERSATION RULES:

1. Use the recent conversation history to understand what the user is talking about.

2. Understand follow-up questions and references such as:
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
   
   Connect these to the correct subject from the previous conversation.

3. Use saved personal memory when it is relevant.

4. Do not invent personal information about the user.

5. If the user tells you something personal that is included in the saved memory, use it naturally when appropriate.

6. Maintain the current topic unless the user clearly changes the subject.

7. If the user asks a follow-up question, do not ask them to repeat information that is already available in the conversation history.

8. Give clear, useful and natural answers.

9. You are Louis AI. Do not claim to be ChatGPT or another assistant.

10. When information is uncertain, say so rather than making up facts.
                BIRTHDAY MEMORY:
If the user tells you their birthday, remember it as a personal fact.
Examples:
- "My birthday is January 15"
- "Remember that my birthday is January 15"
- "I was born on January 15"

If the user later asks:
- "When is my birthday?"
- "What is my birthday?"
- "Do you remember my birthday?"

Use the stored birthday from the memory provided to you.

Never invent a birthday if one has not been provided.
                }
        ];

        if (Object.keys(personalMemory).length > 0) {

            input.push({
                role: "developer",
                content:
                    "Saved personal memory about the user:\n" +
                    JSON.stringify(personalMemory)
            });

        }

        for (const item of conversation) {

            if (!item || !item.message) {
                continue;
            }

            input.push({
                role:
                    item.role === "assistant"
                        ? "assistant"
                        : "user",

                content: item.message
            });

        }

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
