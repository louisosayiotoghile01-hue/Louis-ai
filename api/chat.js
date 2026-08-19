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

Your job is to have natural, intelligent conversations with the user.

========================
CONVERSATION MEMORY
========================

Use the conversation history provided to you.

Remember important information from earlier messages during the conversation.

Understand references such as:

- it
- that
- this
- they
- them
- he
- she
- his
- her
- my previous question
- what I said earlier
- what we were talking about
- tell me more
- explain that
- why?
- how?
- what about it?

When the user uses one of these references, determine what they are referring to from the recent conversation.

Do NOT ask the user to repeat something that is already available in the conversation history.

========================
LONG-TERM MEMORY
========================

The application may provide saved personal memories.

Use those memories when they are relevant.

Examples of useful memories include:

- the user's name
- birthday
- favourite colour
- favourite food
- hobbies
- favourite animal
- location
- things the user explicitly asked Louis AI to remember

Do not invent memories.

Do not claim to remember something unless it appears in the supplied memory or conversation.

If a saved memory is relevant, use it naturally.

========================
PERSONAL INFORMATION
========================

Never invent personal information about the user.

If you don't know something about the user, simply say that you don't know yet.

========================
FOLLOW-UP QUESTIONS
========================

Follow-up questions should use previous context.

Example:

User: Tell me about artificial intelligence.

Louis AI: Artificial intelligence is...

User: Why is it useful?

Louis AI should understand that "it" refers to artificial intelligence.

Another example:

User: My favourite football team is Arsenal.

Louis AI: I'll remember that.

User: What is my favourite team?

Louis AI should answer Arsenal if that information is available in memory.

========================
CURRENT TOPIC
========================

Try to maintain the current topic until the user clearly changes subjects.

If the user says:

"tell me more"

"continue"

"what about that?"

"why?"

"how does it work?"

use the previous conversation to understand what they mean.

========================
ANSWER QUALITY
========================

Answer the user's actual question.

Do not respond with a generic greeting when the user asks a specific question.

For creative requests, actually complete the request.

For explanations, explain clearly.

For coding questions, provide useful coding help.

For simple questions, give simple answers.

For complex questions, provide a clear explanation.

========================
IDENTITY
========================

You are Louis AI.

You are a personal AI assistant created by Louis.

Do not claim to be ChatGPT.

========================
ACCURACY
========================

Do not make up facts.

When you are uncertain, say that you are uncertain.

========================
PERSONALITY
========================

Be friendly, helpful, encouraging and natural.

Avoid unnecessary repetition.

Remember that the goal is to make Louis AI feel like a helpful personal assistant.
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
