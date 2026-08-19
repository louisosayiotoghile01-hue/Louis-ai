let lastUserMessage = "";
let lastAIMessage = "";
let lastTopic = "";
let lastQuestion = "";
let topicHistory = [];
let conversation = JSON.parse(localStorage.getItem("conversation")) || [];
let learnedFacts = JSON.parse(localStorage.getItem("learnedFacts")) || {};
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let chatMemory = JSON.parse(localStorage.getItem("chatMemory")) || [];
let personalMemory =
    JSON.parse(localStorage.getItem("personalMemory")) || {};
function savePersonalMemory(key, value){

    personalMemory[key] = value;

    localStorage.setItem(
        "personalMemory",
        JSON.stringify(personalMemory)
    );
}


function getPersonalMemory(key){

    return personalMemory[key] || null;

}


function getAllPersonalMemory(){

    return personalMemory;

}
const synonyms = {
    "js": "javascript",
    "artificial intelligence": "ai",
    "hypertext markup language": "html",
    "cascading style sheets": "css"
};
const personality = {
    greetings: [
        "Hello! I'm Louis AI. How can I help you today?",
        "Hi! It's great to see you again!",
        "Welcome back! What would you like to do today?",
        "Hello! I'm ready to help with anything you need.",
        "Hi there! Let's build something amazing together."
    ],

    thanks: [
        "You're welcome!",
        "Happy to help!",
        "Anytime!",
        "I'm glad I could help.",
        "It's my pleasure."
    ],

    goodbye: [
        "Goodbye! Have a wonderful day.",
        "See you next time!",
        "Take care!",
        "Bye! I'll be here when you need me."
    ]
};
function randomResponse(list){
    return list[Math.floor(Math.random() * list.length)];
}

let knowledge = {};
let learnedQuestions = JSON.parse(localStorage.getItem("learnedQuestions")) || {};
function detectIntent(text){

    text = text.toLowerCase();

    if(text.includes("time"))
        return "time";

    if(text.includes("date"))
        return "date";

    if(text.includes("note"))
        return "notes";

    if(text.includes("task"))
        return "tasks";

    if(text.startsWith("search "))
        return "search";

    if(text.includes("hello") ||
       text.includes("hi") ||
       text.includes("hey"))
        return "greeting";

    if(text.includes("thank"))
        return "thanks";

    if(text.includes("bye") ||
       text.includes("goodbye"))
        return "goodbye";

    if(text.includes("who") ||
       text.includes("what") ||
       text.includes("where") ||
       text.includes("when") ||
       text.includes("why") ||
       text.includes("tell me") ||
       text.includes("explain"))
        return "knowledge";

    return "chat";
}
function getSavedMemory(){

    let memory = [];

    let userName = localStorage.getItem("userName");
    let favoriteColor = localStorage.getItem("favoriteColor");
    let favoriteFood = localStorage.getItem("favoriteFood");
    let birthday = localStorage.getItem("birthday");
    let hobby = localStorage.getItem("hobby");
    let userCity = localStorage.getItem("userCity");
    let favoriteAnimal = localStorage.getItem("favoriteAnimal");
let favoriteFootballTeam =
    localStorage.getItem("favoriteFootballTeam");
    if(userName){
        memory.push("User's name: " + userName);
    }

    if(favoriteColor){
        memory.push("User's favourite color: " + favoriteColor);
    }

    if(favoriteFood){
        memory.push("User's favourite food: " + favoriteFood);
    }

    if(birthday){
        memory.push("User's birthday: " + birthday);
    }

    if(hobby){
        memory.push("User's hobby: " + hobby);
    }

    if(userCity){
        memory.push("User lives in: " + userCity);
    }

    if(favoriteAnimal){
        memory.push("User's favourite animal: " + favoriteAnimal);
    }
if(favoriteFootballTeam){
    memory.push(
        "User's favourite football team: " +
        favoriteFootballTeam
    );
}
    return memory.join("\n");
}
async function getAIResponse(message){

    const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

body: JSON.stringify({
    message: message,
    history: chatMemory,
    memory: {
    personal: getAllPersonalMemory(),
    longTerm: getLongTermMemory()
}
})
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.error || "API request failed");
    }

    return data.reply;
}
async function loadKnowledge() {

    try {

        const response = await fetch("knowledge.json");

        if (response.ok) {
            knowledge = await response.json();
            console.log("Knowledge loaded successfully.");
        }

    } catch (error) {
        console.log("Could not load knowledge.json");
    }

}
function saveLongTermMemory(text){

    let memories =
        JSON.parse(localStorage.getItem("longTermMemory")) || [];

    memories.push({
        memory: text,
        date: new Date().toISOString()
    });

    localStorage.setItem(
        "longTermMemory",
        JSON.stringify(memories)
    );

    return "I'll remember that.";
}


function getLongTermMemory(){

    return JSON.parse(
        localStorage.getItem("longTermMemory")
    ) || [];
}
async function sendMessage(){

    const input = document.getElementById("userInput");
    const chat = document.getElementById("chat");

    const userText = input.value.trim();

if(userText === ""){
    return;
}

const lowerText = userText.toLowerCase();

    // Show user's message immediately
    chat.innerHTML += `
        <div class="user-message">
            ${userText}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    // Remember user's message
    lastUserMessage = userText;

    chatMemory.push({
        role: "user",
        message: userText
    });

    if(chatMemory.length > 20){
        chatMemory.shift();
    }

    localStorage.setItem(
        "chatMemory",
        JSON.stringify(chatMemory)
    );

    conversation.push({
        sender: "user",
        message: userText
    });

    if(conversation.length > 20){
        conversation.shift();
    }

    localStorage.setItem(
        "conversation",
        JSON.stringify(conversation)
    );

    // Clear input
    input.value = "";
// UNIVERSAL REMEMBER THAT MEMORY

const rememberText = userText.trim();
const rememberLower = rememberText.toLowerCase();

if(rememberLower.startsWith("remember that ")){

    const memoryContent = rememberText.substring(14).trim();

    const memoryLower = memoryContent.toLowerCase();

    let memoryKey = "";
    let memoryValue = "";

    // BIRTHDAY
    if(memoryLower.startsWith("my birthday is ")){

        memoryKey = "birthday";

        memoryValue = memoryContent.substring(15).trim();
    }

    // NAME
    else if(memoryLower.startsWith("my name is ")){

        memoryKey = "name";

        memoryValue = memoryContent.substring(11).trim();
    }

    // FAVOURITE FOOD
    else if(
        memoryLower.startsWith("my favourite food is ") ||
        memoryLower.startsWith("my favorite food is ")
    ){

        memoryKey = "favoriteFood";

        let start = memoryLower.startsWith("my favourite food is ")
            ? 21
            : 20;

        memoryValue = memoryContent.substring(start).trim();
    }
// FAVOURITE COLOUR MEMORY ANSWER

if(
    lowerText.includes("what is my favourite colour") ||
    lowerText.includes("what is my favorite color") ||
    lowerText.includes("what is my favourite color") ||
    lowerText.includes("what is my favorite colour") ||
    lowerText.includes("what's my favourite colour") ||
    lowerText.includes("what's my favorite color")
){

    const memories = getAllPersonalMemory();

    const color =
        memories.favoriteColor ||
        memories.favouriteColor ||
        memories["favorite_color"] ||
        memories["favourite_color"];

    if(color){

        chat.innerHTML += `
            <div class="ai-message">
                Your favourite colour is ${color}. 🎨
            </div>
        `;

    }else{

        chat.innerHTML += `
            <div class="ai-message">
                I don't have your favourite colour saved yet. 🎨
            </div>
        `;
    }

    chat.scrollTop = chat.scrollHeight;

    return;
}

    // HOBBY
    else if(memoryLower.startsWith("my hobby is ")){

        memoryKey = "hobby";

        memoryValue = memoryContent.substring(12).trim();
    }

    // FAVOURITE ANIMAL
    else if(
        memoryLower.startsWith("my favourite animal is ") ||
        memoryLower.startsWith("my favorite animal is ")
    ){

        memoryKey = "favoriteAnimal";

        let start = memoryLower.startsWith("my favourite animal is ")
            ? 23
            : 22;

        memoryValue = memoryContent.substring(start).trim();
    }

    // LOCATION
    else if(memoryLower.startsWith("i live in ")){

        memoryKey = "location";

        memoryValue = memoryContent.substring(10).trim();
    }
// UNIVERSAL PERSONAL MEMORY

if(!memoryKey && !memoryValue){

    const genericMemory = memoryContent.trim();

    const separators = [
        " is ",
        " are ",
        " likes ",
        " loves ",
        " supports ",
        " prefers "
    ];

    let foundSeparator = null;

    for(let separator of separators){

        if(genericMemory.toLowerCase().includes(separator)){
            foundSeparator = separator;
            break;
        }
    }

    if(foundSeparator){

        const position = genericMemory
            .toLowerCase()
            .indexOf(foundSeparator);

        const key = genericMemory
            .substring(0, position)
            .trim();

        const value = genericMemory
            .substring(position + foundSeparator.length)
            .trim();

        if(key && value){

            memoryKey = key;
            memoryValue = value;
        }
    }
}
    // SAVE MEMORY
    if(memoryKey && memoryValue){

        savePersonalMemory(memoryKey, memoryValue);

        chat.innerHTML += `
            <div class="ai-message">
                I'll remember that your ${memoryKey} is ${memoryValue}. 🧠
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
// BIRTHDAY MEMORY COMMAND

const lowerUserText = userText.toLowerCase();

if(
    lowerUserText.includes("my birthday is") ||
    lowerUserText.includes("remember that my birthday is") ||
    lowerUserText.includes("i was born on")
){

    let birthday = "";

    if(lowerUserText.includes("my birthday is")){

        birthday = userText.substring(
    lowerText.indexOf("my birthday is") + 14
).trim();

    }
    else if(lowerUserText.includes("i was born on")){

        birthday = userText.substring(
            lowerUserText.indexOf("i was born on") + 13
        ).trim();

    }

    if(birthday){

        savePersonalMemory("birthday", birthday);

        chat.innerHTML += `
            <div class="ai-message">
                I'll remember your birthday is ${birthday}. 🎂
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
                                  }
    // LONG-TERM MEMORY COMMAND
    if(userText.toLowerCase().startsWith("remember that ")){

        const memoryText = userText.substring(15).trim();

        if(memoryText !== ""){

            saveLongTermMemory(memoryText);

            chat.innerHTML += `
                <div class="ai-message">
                    I'll remember that.
                </div>
            `;

            chat.scrollTop = chat.scrollHeight;

            return;
        }
    }
    // GENERAL MEMORY RECALL

if(
    lowerText.includes("what do you remember about me") ||
    lowerText.includes("what do you remember about me?") ||
    lowerText.includes("what do you know about me") ||
    lowerText.includes("show my memories") ||
    lowerText.includes("show what you remember") ||
    lowerText.includes("what have you remembered about me")
){

    const memories = getLongTermMemory();

    if(memories.length === 0){

        chat.innerHTML += `
            <div class="ai-message">
                I don't have any long-term memories about you yet. 🧠
            </div>
        `;

    }else{

        let memoryList = "";

        memories.forEach((item, index) => {

            memoryList += `
                <div style="margin-bottom:10px;">
                    ${index + 1}. ${item.memory}
                </div>
            `;

        });

        chat.innerHTML += `
            <div class="ai-message">
                <strong>Here's what I remember about you: 🧠</strong>
                <br><br>
                ${memoryList}
            </div>
        `;
    }

    chat.scrollTop = chat.scrollHeight;

    return;
}
// DIRECT PERSONAL MEMORY ANSWERS
    
// FAVOURITE COLOUR MEMORY

if(
    lowerText.includes("what is my favourite colour") ||
    lowerText.includes("what is my favorite color") ||
    lowerText.includes("what is my favourite color") ||
    lowerText.includes("what is my favorite colour") ||
    lowerText.includes("what's my favourite colour") ||
    lowerText.includes("what's my favorite color")
){

    const memories = getAllPersonalMemory();

    const color =
        memories.favoriteColor ||
        memories.favouriteColor ||
        memories["favorite_color"] ||
        memories["favourite_color"];

    if(color){

        chat.innerHTML += `
            <div class="ai-message">
                Your favourite colour is ${color}. 🎨
            </div>
        `;

    }else{

        chat.innerHTML += `
            <div class="ai-message">
                I don't have your favourite colour saved yet. 🎨
            </div>
        `;
    }

    chat.scrollTop = chat.scrollHeight;

    return;
            }
if(
    lowerText.includes("what is my favorite color") ||
    lowerText.includes("what is my favourite color")
){

    const memories = getAllPersonalMemory();

    let color =
        memories.favoriteColor ||
        memories.favouriteColor ||
        memories["favorite color"] ||
        memories["favourite color"];

    if(color){

        chat.innerHTML += `
            <div class="ai-message">
                Your favorite color is ${color}. 💙
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
    // FAVORITE FOOD MEMORY

if(
    lowerText.includes("what is my favorite food") ||
    lowerText.includes("what is my favourite food")
){

    const memories = getAllPersonalMemory();

    let food =
        memories.favoriteFood ||
        memories.favouriteFood ||
        memories["favorite food"] ||
        memories["favourite food"];

    if(food){

        chat.innerHTML += `
            <div class="ai-message">
                Your favorite food is ${food}. 🍽️
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
    // BIRTHDAY MEMORY

if(
    lowerText.includes("my birthday is") ||
    lowerText.includes("remember that my birthday is") ||
    lowerText.includes("i was born on")
){

    let birthday = "";

    if(lowerText.includes("my birthday is")){
        birthday = text.substring(
            text.toLowerCase().indexOf("my birthday is") + 14
        ).trim();
    }

    else if(lowerText.includes("remember that my birthday is")){
        birthday = text.substring(
            text.toLowerCase().indexOf("remember that my birthday is") + 27
        ).trim();
    }

    else if(lowerText.includes("i was born on")){
        birthday = text.substring(
            text.toLowerCase().indexOf("i was born on") + 13
        ).trim();
    }

    if(birthday){

        personalMemory.birthday = birthday;

        localStorage.setItem(
            "personalMemory",
            JSON.stringify(personalMemory)
        );

        chat.innerHTML += `
            <div class="ai-message">
                I'll remember your birthday is ${birthday}. 🎂
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
    // NAME MEMORY

if(
    lowerText.includes("what is my name") ||
    lowerText.includes("what's my name")
){

    const memories = getAllPersonalMemory();

    let name =
        memories.name ||
        memories.userName ||
        memories["name"] ||
        localStorage.getItem("userName");

    if(name){

        chat.innerHTML += `
            <div class="ai-message">
                Your name is ${name}. 👋
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
    // HOBBY MEMORY

if(
    lowerText.includes("what is my hobby") ||
    lowerText.includes("what's my hobby")
){

    const memories = getAllPersonalMemory();

    let hobby =
        memories.hobby ||
        memories["hobby"];

    if(hobby){

        chat.innerHTML += `
            <div class="ai-message">
                Your hobby is ${hobby}. 🎯
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        return;
    }
}
    // BIRTHDAY MEMORY

if(
    lowerText.includes("when is my birthday") ||
    lowerText.includes("what is my birthday") ||
    lowerText.includes("do you remember my birthday") ||
    lowerText.includes("what's my birthday")
){

    const memories = getAllPersonalMemory();

    const birthday =
        memories.birthday ||
        memories["birthday"];

    if(birthday){

        chat.innerHTML += `
            <div class="ai-message">
                Your birthday is ${birthday}. 🎂🎉
            </div>
        `;

    }else{

        chat.innerHTML += `
            <div class="ai-message">
                I don't have your birthday saved yet. 🎂
            </div>
        `;

    }

    chat.scrollTop = chat.scrollHeight;

    return;
}
    // Show typing message
    chat.innerHTML += `
        <div id="typing">
            <b>Louis AI is thinking...</b>
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    try{

        // Ask the Vercel API
        const reply = await getAIResponse(userText);

        // Remove typing message
        const typing = document.getElementById("typing");

        if(typing){
            typing.remove();
        }

        // Remember AI reply
        lastAIMessage = reply;

        chat.innerHTML += `
            <div class="ai-message">
                ${reply}
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

        chatMemory.push({
            role: "assistant",
            message: reply
        });

        if(chatMemory.length > 20){
            chatMemory.shift();
        }

        localStorage.setItem(
            "chatMemory",
            JSON.stringify(chatMemory)
        );

        conversation.push({
            sender: "ai",
            message: reply
        });

        if(conversation.length > 20){
            conversation.shift();
        }

        localStorage.setItem(
            "conversation",
            JSON.stringify(conversation)
        );

        // Speak the reply
        if(typeof speechSynthesis !== "undefined"){
            const speech = new SpeechSynthesisUtterance(reply);
            speechSynthesis.speak(speech);
        }

    }catch(error){

    const typing = document.getElementById("typing");

    if(typing){
        typing.remove();
    }

    console.error("Louis AI API error:", error);

    // Use Louis AI's local brain if the API is unavailable
    const localReply = getReply(userText);

    lastAIMessage = localReply;

    chat.innerHTML += `
        <div class="ai-message">
            ${localReply}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    // Save local reply to memory
    chatMemory.push({
        role: "assistant",
        message: localReply
    });

    if(chatMemory.length > 20){
        chatMemory.shift();
    }

    localStorage.setItem(
        "chatMemory",
        JSON.stringify(chatMemory)
    );

    conversation.push({
        sender: "ai",
        message: localReply
    });

    if(conversation.length > 20){
        conversation.shift();
    }

    localStorage.setItem(
        "conversation",
        JSON.stringify(conversation)
    );

    // Speak the local reply
    if(typeof speechSynthesis !== "undefined"){
        const speech = new SpeechSynthesisUtterance(localReply);
        speechSynthesis.speak(speech);
    }
    }

    chat.scrollTop = chat.scrollHeight;
}
function handleGreeting(){

    return randomResponse(personality.greetings);

}
function handleTime(){

    return "The time is " + new Date().toLocaleTimeString();

}
function handleDate(){

    return "Today's date is " + new Date().toLocaleDateString();

}
function handleThanks(){

    return randomResponse(personality.thanks);

}
function handleGoodbye(){

    return randomResponse(personality.goodbye);

}
function handleCalculator(text){

    try{
        let answer = Function("return " + text)();
        return "The answer is " + answer;
    }catch(error){
        return "Sorry, I couldn't calculate that.";
    }

}
function handleNotes(text, userText){

    if(text.startsWith("note:")){

        let note = userText.substring(5).trim();

        if(note !== ""){
            notes.push(note);
            localStorage.setItem("notes", JSON.stringify(notes));
            return "I've saved your note.";
        }

        return "Please type a note after 'Note:'.";
    }

    if(text.includes("show my notes")){

        if(notes.length === 0){
            return "You don't have any saved notes.";
        }

        return "Your notes:\n\n" + notes.join("\n");
    }

    if(text.includes("clear my notes")){

        notes = [];
        localStorage.removeItem("notes");

        return "All your notes have been deleted.";
    }

    return null;

}
function handleTasks(text, userText){

    if(text.startsWith("task:")){

        let task = userText.substring(5).trim();

        if(task !== ""){
            tasks.push(task);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            return "Task added successfully.";
        }

        return "Please type a task after 'Task:'.";
    }

    if(text.includes("show my tasks")){

        if(tasks.length === 0){
            return "You don't have any tasks.";
        }

        let list = "Your tasks:\n\n";

        for(let i = 0; i < tasks.length; i++){
            list += (i + 1) + ". " + tasks[i] + "\n";
        }

        return list;
    }

    if(text.startsWith("complete task ")){

        let number = parseInt(text.replace("complete task ", ""));

        if(number >= 1 && number <= tasks.length){
            let completed = tasks.splice(number - 1, 1);
            localStorage.setItem("tasks", JSON.stringify(tasks));
            return "Completed: " + completed[0];
        }

        return "Task not found.";
    }

    return null;
}
function handleMemory(text, userText){

    if(text.startsWith("my name is ")){
        let name = userText.substring(11);
        localStorage.setItem("userName", name);
        return "Nice to meet you, " + name + "!";
    }

    if(text.includes("what is my name")){
        let name = localStorage.getItem("userName");

        if(name){
            return "Your name is " + name + ".";
        }

        return "I don't know your name yet.";
    }

    return null;
}
function getReply(userText){

    let text = userText.toLowerCase();
    lastQuestion = text;
    let intent = detectIntent(text);
    if(text.startsWith("rename category:")){

    let command = userText.substring(16).trim();

    if(command.includes("=")){

        let parts = command.split("=");

        let oldName = parts[0].trim().toLowerCase();
        let newName = parts[1].trim().toLowerCase();

        if(knowledge[oldName]){

            knowledge[newName] = knowledge[oldName];
            delete knowledge[oldName];

            localStorage.setItem("knowledge", JSON.stringify(knowledge));

            return "Category renamed from " + oldName + " to " + newName + ".";
        }

        return "I couldn't find the category " + oldName + ".";
    }

    return "Use this format: Rename category: old = new";
}
    if(text.startsWith("delete category:")){

    let category = userText.substring(16).trim().toLowerCase();

    if(knowledge[category]){
        delete knowledge[category];

        localStorage.setItem("knowledge", JSON.stringify(knowledge));

        return "The " + category + " category has been deleted.";
    }

    return "I couldn't find that category.";
}
    if(
    text.includes("what categories do you know") ||
    text.includes("list categories") ||
    text.includes("show categories")
){

    let categories = Object.keys(knowledge);

    if(categories.length === 0){
        return "I don't know any categories yet.";
    }

    return "I currently know these categories:\n\n" +
           categories.join("\n");
}
    if(text.startsWith("learn")){

    let lines = userText.split("\n");

    if(lines.length >= 4){

        let question = lines[1].replace("Question:", "").trim().toLowerCase();
        let answer = lines[2].replace("Answer:", "").trim();
        let category = lines[3].replace("Category:", "").trim().toLowerCase();

        learnedQuestions[question] = {
            answer: answer,
            category: category
        };

        localStorage.setItem(
            "learnedQuestions",
            JSON.stringify(learnedQuestions)
        );

        return "I have learned a new question in the " + category + " category.";
    }
}
if (
    text.includes("what topics do you know") ||
    text.includes("list topics") ||
    text.includes("show topics")
) {

    let result = "";

    for (let category in knowledge) {

        result += "\n\n" + category.toUpperCase() + ":\n";

        for (let topic in knowledge[category]) {
            result += "• " + topic + "\n";
        }
    }

    return result || "I don't know any topics yet.";
}
    if (
    text.includes("what topics do you know") ||
    text.includes("list topics") ||
    text.includes("show topics")
) {

    let topics = Object.keys(knowledge);

    if (topics.length === 0) {
        return "I don't know any topics yet. Teach me by typing: Learn: topic = answer";
    }

    return "I currently know these topics: " + topics.join(", ");
}
    if (
    text.includes("how many topics do you know") ||
    text.includes("how many topics")
) {
    return "Right now I know " + Object.keys(knowledge).length + " topics. You can teach me more by typing: Learn: topic = answer";
}
    for(let word in synonyms){
    text = text.replaceAll(word, synonyms[word]);
}
function rememberTopic(topic){

    lastTopic = topic;

    topicHistory.push(topic);

    if(topicHistory.length > 5){
        topicHistory.shift();
    }
}

if(text.includes("javascript")) rememberTopic("javascript");
if(text.includes("html")) rememberTopic("html");
if(text.includes("css")) rememberTopic("css");
if(text.includes("ai")) rememberTopic("ai");
    if(text.includes("what did we just talk about")){

    if(chatMemory.length >= 2){

        let previous = chatMemory[chatMemory.length - 2];

        return "We were talking about: " + previous.message;
    }

    return "We haven't talked much yet.";
}
    if(text.includes("javascript")) lastTopic = "javascript";
if(text.includes("html")) lastTopic = "html";
if(text.includes("css")) lastTopic = "css";
if(text.includes("louis ai")) lastTopic = "louis ai";
if(text.includes("ai")) lastTopic = "ai";

if(intent === "greeting"){
    return handleGreeting();
}
let tasksReply = handleTasks(text, userText);

if(tasksReply){
    return tasksReply;
}
let notesReply = handleNotes(text, userText);

if(notesReply){
    return notesReply;
}
if(text === "what is your name"){
        return "My name is Louis AI.";
    }

    if(text.includes("how are you")){
        return "I'm doing great!";
    }

if(intent === "time"){
    return handleTime();
}

if(intent === "date"){
    return handleDate();
}

let memoryReply = handleMemory(text, userText);

if(memoryReply){
    return memoryReply;
}

    if(text.startsWith("my favourite color is ")){
        let color = userText.substring(22);
        localStorage.setItem("favoriteColor", color);
        return "I'll remember your favourite color is " + color + ".";
    }

    if(text.includes("what is my favourite color")){
        let color = localStorage.getItem("favoriteColor");
        if(color){
            return "Your favourite color is " + color + ".";
        }else{
            return "You haven't told me your favourite color yet.";
        }
    }

    if(text.startsWith("my favourite food is ")){
        let food = userText.substring(21);
        localStorage.setItem("favoriteFood", food);
        return "Great! I'll remember that your favourite food is " + food + ".";
    }

    if(text.includes("what is my favourite food")){
        let food = localStorage.getItem("favoriteFood");
        if(food){
            return "Your favourite food is " + food + ".";
        }else{
            return "You haven't told me your favourite food yet.";
        }
    }

    if(text.startsWith("my birthday is ")){
        let birthday = userText.substring(15);
        localStorage.setItem("birthday", birthday);
        return "Great! I'll remember your birthday is " + birthday + ".";
    }

    if(text.includes("when is my birthday")){
        let birthday = localStorage.getItem("birthday");
        if(birthday){
            return "Your birthday is " + birthday + ".";
        }else{
            return "You haven't told me your birthday yet.";
        }
    }

    if(text.startsWith("my hobby is ")){
        let hobby = userText.substring(12);
        localStorage.setItem("hobby", hobby);
        return "Great! I'll remember that your hobby is " + hobby + ".";
    }

if(text.includes("what is my hobby")){
    let hobby = localStorage.getItem("hobby");
    if(hobby){
        return "Your hobby is " + hobby + ".";
        
    }else{
        return "You haven't told me your hobby yet.";
    }
}
if(text.includes("who are you")){
    return "I am Louis AI, your personal AI assistant created by Louis.";
}

if(text.includes("what can you do")){
    return "I can chat with you, remember your name, tell the date and time, and answer simple questions.";
}

if(intent === "thanks"){
    return handleThanks();
}

if(text.includes("good morning")){
    return "Good morning! I hope you have a wonderful day.";
}

if(text.includes("good night")){
    return "Good night! Sleep well and see you tomorrow.";
}

if(text.includes("how old are you")){
    return "I'm a digital AI, so I don't have an age like humans.";
}

if(
    text.includes("who created you") ||
    text.includes("who made you")
){
    return "I was created by Louis with help from ChatGPT.";
}

if(intent === "goodbye"){
    return handleGoodbye();
}

if(text.includes("what did i just say")){
    return "You just said: " + lastUserMessage;
}

if(text.includes("what did you just say")){
    return "I just said: " + lastAIMessage;
}

if (text.startsWith("learn ")) {

    let lesson = userText.substring(6).trim();

    if (!lesson.includes("=")) {
        return "Use this format: learn category: question = answer";
    }

    let parts = lesson.split("=");

    let left = parts[0].trim();
    let answer = parts[1].trim();

    if (!left.includes(":")) {
        return "Example: learn science: earth = Earth is the third planet from the Sun.";
    }

    let info = left.split(":");

    let category = info[0].trim().toLowerCase();
    let question = info[1].trim().toLowerCase();

    if (!knowledge[category]) {
        knowledge[category] = {};
    }

    knowledge[category][question] = answer;

    localStorage.setItem("knowledge", JSON.stringify(knowledge));

    return "I have learned a new " + category + " fact!";
}

if(text.startsWith("forget:")){

    let question = userText.substring(7).trim().toLowerCase();

    if(learnedFacts[question]){

        delete learnedFacts[question];
        localStorage.setItem("learnedFacts", JSON.stringify(learnedFacts));

        return "I've forgotten that.";
    }

    return "I don't know that yet.";
}
if(text.startsWith("i live in ")){

    let city = userText.substring(10);
    localStorage.setItem("userCity", city);

    return "I'll remember that you live in " + city + ".";
}

if(text.includes("where do i live")){

    let city = localStorage.getItem("userCity");

    if(city){
        return "You live in " + city + ".";
    }else{
        return "You haven't told me where you live yet.";
    }
}
    if(text.startsWith("my favourite football team is")){

let team = userText.substring(29).trim();

    localStorage.setItem(
        "favoriteFootballTeam",
        team
    );

    return "I'll remember that your favourite football team is " + team + ".";
    }
    if(text.includes("what is my favourite football team")){

    let team = localStorage.getItem(
        "favoriteFootballTeam"
    );

    if(team){
        return "Your favourite football team is " + team + ".";
    }else{
        return "You haven't told me your favourite football team yet.";
    }
    }
if(text.startsWith("my favourite animal is ")){

    let animal = userText.substring(24);
    localStorage.setItem("favoriteAnimal", animal);

    return "I'll remember that your favourite animal is " + animal + ".";
}

if(text.includes("what is my favourite animal")){

    let animal = localStorage.getItem("favoriteAnimal");

    if(animal){
        return "Your favourite animal is " + animal + ".";
    }else{
        return "You haven't told me your favourite animal yet.";
    }
}
for(let key in learnedFacts){

    if(text.includes(key)){
        return learnedFacts[key];
    }

}
if(text.startsWith("did we talk about ")){

    let topic = text.replace("did we talk about ", "").trim();

    for(let item of conversation){

        if(item.toLowerCase().includes(topic)){
            return "Yes. I found this:\n\n" + item;
        }

    }

    return "No, I couldn't find anything about " + topic + ".";
}
if(text.startsWith("what did i say about ")){

let topic = text
    .replace("what did i say about ", "")
    .replace("?", "")
    .trim();

    for(let i = conversation.length - 1; i >= 0; i--){

        if(
            conversation[i].startsWith("You:") &&
            conversation[i].toLowerCase().includes(topic)
        ){
            return "You said:\n\n" + conversation[i];
        }

    }

    return "I couldn't find anything you said about " + topic + ".";
}
if(text.includes("who created it")){

    if(lastTopic === "javascript"){
        return "JavaScript was created by Brendan Eich in 1995.";
    }

    if(lastTopic === "html"){
        return "HTML was created by Tim Berners-Lee.";
    }

    if(lastTopic === "css"){
        return "CSS was developed by Håkon Wium Lie.";
    }

    if(lastTopic === "ai"){
        return "Artificial Intelligence has many pioneers, including Alan Turing, John McCarthy, Marvin Minsky, and others.";
    }

    return "What topic are you referring to?";
}
let bestAnswer = "";
let highestScore = 0;
if(text === "when?" || text === "when"){

    if(lastTopic === "javascript"){
        return "JavaScript was created in 1995.";
    }

    if(lastTopic === "html"){
        return "HTML was introduced in 1991.";
    }

    if(lastTopic === "css"){
        return "CSS was first proposed in 1994.";
    }

    return "Could you tell me what you're referring to?";
}
for (let category in knowledge) {

    for (let key in knowledge[category]) {

let words = key.toLowerCase().replace(/[^\w\s]/g, "").split(" ");

let synonyms = {
    created: ["made", "built", "developed"],
    who: ["whom"],
    ai: ["assistant", "bot"],
    capital: ["city"],
    earth: ["world", "planet"]
};

let expandedWords = [];

for(let word of words){
    expandedWords.push(word);

    if(synonyms[word]){
        expandedWords.push(...synonyms[word]);
    }
}

words = expandedWords;
        let score = 0;

        for (let word of words) {
            if (text.includes(word)) {
                score++;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestAnswer = knowledge[category][key];
        }
    }
}

if (highestScore > 0) {
    return bestAnswer;
}

if(text.startsWith("did we talk about ")){

    let topic = text.replace("did we talk about ", "").trim();

    for(let i = conversation.length - 2; i >= 0; i--){

        if(conversation[i].toLowerCase().includes(topic)){
            return "Yes. I found this:\n\n" + conversation[i];
        }

    }

    return "No, I couldn't find anything about " + topic + ".";
}
if(text.startsWith("search ")){

    let keyword = text.substring(7).trim();

    let results = [];

    for(let category in knowledge){

        for(let question in knowledge[category]){

            let answer = knowledge[category][question];

            if(
                question.includes(keyword) ||
                answer.toLowerCase().includes(keyword)
            ){
                results.push("[" + category + "] " + question + " → " + answer);
            }
        }
    }

    if(results.length > 0){
        return results.join("\n\n");
    }else{
        return "I couldn't find anything about '" + keyword + "'.";
    }
}
// Simple Calculator
if(
    text.includes("+") ||
    text.includes("-") ||
    text.includes("*") ||
    text.includes("/")
){
    return handleCalculator(text);
}
if(text.includes("show conversation") || text.includes("conversation history")){
    return conversation.join("\n");
}

if(text.includes("help") || text.includes("commands")){

    return `I can:
- Chat with you
- Remember your name
- Remember your favourite colour
- Remember your favourite food
- Remember your birthday
- Remember your hobby
- Tell the date and time
- Solve simple maths
- Learn new facts
- Forget learned facts
- Show conversation history
- Speak my replies
- Listen to your voice`;

}
if(text.includes("what were we talking about") ||
   text.includes("what is the topic")){

    if(lastTopic){
        return "We were talking about " + lastTopic + ".";
    }else{
        return "We haven't started a specific topic yet.";
    }
}
if(text.startsWith("why ")){

    let question = text.substring(4).trim();

    for(let category in knowledge){

        for(let key in knowledge[category]){

            if(question.includes(key) || key.includes(question)){
                return knowledge[category][key] + " That's why.";
            }

        }

    }

    return "I don't know why yet. You can teach me.";
}
if(text.includes("summarize our conversation") || text.includes("conversation summary")){

    if(conversation.length === 0){
        return "We haven't talked yet.";
    }

    let summary = "Here's a summary of our conversation:\n\n";

    let start = Math.max(0, conversation.length - 10);

    for(let i = start; i < conversation.length; i++){
        summary += conversation[i] + "\n";
    }

    return summary;
}
if(
    text.includes("what were we talking about") ||
    text.includes("what is our current topic")
){

    if(topicHistory.length === 0){
        return "We haven't discussed any topic yet.";
    }

    return "We were talking about " + topicHistory[topicHistory.length - 1] + ".";
}
if(text.startsWith("show ")){

    let category = text.replace("show ", "").replace(" topics","").trim();

    if(knowledge[category]){

        let keys = Object.keys(knowledge[category]);

        if(keys.length === 0){
            return "There are no topics in " + category + ".";
        }

        return "Topics in " + category + ":\n\n" + keys.join("\n");
    }

    return "I don't have a category called " + category + ".";
}
if(
    text.includes("how many topics do you know") ||
    text.includes("how much do you know")
){

    let total = 0;

    for(let category in knowledge){
        total += Object.keys(knowledge[category]).length;
    }

    return "I currently know " + total + " topics in " +
           Object.keys(knowledge).length +
           " categories.";
}
    // NATURAL FOOTBALL TEAM MEMORY
if(
    text.startsWith("i support ") ||
    text.startsWith("i love ") ||
    text.startsWith("my team is ") ||
    text.includes("i'm a ") && text.includes(" fan") ||
    text.includes("i am a ") && text.includes(" fan")
){

    let team = "";

    if(text.startsWith("i support ")){
        team = userText.substring(10).trim();
    }

    else if(text.startsWith("i love ")){
        team = userText.substring(7).trim();
    }

    else if(text.startsWith("my team is ")){
        team = userText.substring(11).trim();
    }

    else if(text.includes("i'm a ") && text.includes(" fan")){
        team = userText.substring(7, text.indexOf(" fan")).trim();
    }

    else if(text.includes("i am a ") && text.includes(" fan")){
        team = userText.substring(7, text.indexOf(" fan")).trim();
    }

    if(team){
        localStorage.setItem("favoriteFootballTeam", team);

        return "I'll remember that you support " + team + ".";
    }
}
    // NATURAL FOOTBALL TEAM MEMORY QUESTIONS

if(
    text.includes("what football team do i support") ||
    text.includes("which football team do i support") ||
    text.includes("what team do i support") ||
    text.includes("which team do i support") ||
    text.includes("what team do i love") ||
    text.includes("which team do i love")
){

    let team = localStorage.getItem("favoriteFootballTeam");

    if(team){
        return "You support " + team + ".";
    }else{
        return "You haven't told me which football team you support yet.";
    }
            }
let randomReplies = [
    "I'm not sure about that yet. You can teach me by typing: Learn: question = answer",
    "I don't know the answer yet, but I'm learning every day.",
    "That's interesting. I hope you'll teach me the answer.",
    "I'm still growing smarter. Try teaching me something new!"
];

return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}
window.onload = async function(){

    await loadKnowledge();

    let chat = document.getElementById("chat");

    conversation.forEach(function(message){

        if(message.startsWith("You: ")){
            chat.innerHTML += "<div class='user-message'>" + message.replace("You: ", "") + "</div>";
        }else{
            chat.innerHTML += "<div class='ai-message'>" + message.replace("Louis AI: ", "") + "</div>";
        }

    });

    chat.scrollTop = chat.scrollHeight;
};
if(localStorage.getItem("darkMode") === "true"){
    document.body.classList.add("dark");
}
function clearChat(){

    localStorage.removeItem("conversation");
    conversation = [];

    document.getElementById("chat").innerHTML = "";

}
function toggleDarkMode(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

}
function startListening(){

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
        alert("Speech recognition is not supported on this browser.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function(){
        alert("Listening... Speak now.");
    };

    recognition.onresult = function(event){
        document.getElementById("userInput").value =
            event.results[0][0].transcript;

        sendMessage();
    };

    recognition.onerror = function(event){
        alert("Speech recognition error: " + event.error);
    };

    recognition.start();
}
