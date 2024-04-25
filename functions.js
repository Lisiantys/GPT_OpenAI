const { OpenAI } = require("openai");

const OPEN_AI_KEY = new OpenAI({
  apiKey: "",
});

//Contient une liste d'array/ de conversation.
let allConversation = [];

async function init() {
  let newConversation = { id: allConversation.length, messages: [] };
  allConversation.push(newConversation);
  newConversation.messages.push({ role: "system", content: "Hello, how can I help you ?"});
  console.log(newConversation)
}

async function send(index, userMessage) {
  //Contient la conversation actuelle, 1 interaction = 1 objet (key: role, content)
  let currentConversation = allConversation[index].messages
  currentConversation.push({ role: "user", content: userMessage });
  let messages = currentConversation.map((obj) => ({
    role: obj.role,
    content: obj.content,
  }));
  const stream = await OPEN_AI_KEY.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [...messages],
    stream: true,
  });

  let responseAI = "";
  for await (const chunk of stream) {
    responseAI += chunk.choices[0]?.delta?.content || "";
  }
  currentConversation.push({ role: "assistant", content: responseAI });

}


async function callTest(){
  await init();

  await send(allConversation.length - 1, `What is my current number: ${allConversation.length - 1}`);
  await send(allConversation.length - 1, `Can you repeat your last sentence in french`);
  
console.log("Tableau de toute les conversations : ")
console.log(allConversation[0].messages)
console.log(allConversation[0])

console.log(allConversation)



}

callTest();

