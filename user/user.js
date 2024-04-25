const OPENAI_API_KEY = "" //Enter your API KEY;
const conservationEl = document.querySelector('#conversation');
const inputEl = document.querySelector('#userInput');
const btnEl = document.querySelector('#send-btn');

//Contient une liste d'array/ de conversation.
let allConversation = [];

//Pour récuperer l'index de la dernière conversation dans l'array de toute les conversations
function getLastConversationIndex() {
    return allConversation.length - 1;
}

/**
 * Pour le moment chaque chargement de la page User crée une nouvelle conversation
 */
window.addEventListener("load", async () =>{
    await init();
    let currentIndex = getLastConversationIndex();  
    let systemMessage = allConversation[currentIndex].messages[1].content
    conservationEl.innerHTML += systemMessage
})

async function init() {
  let newConversation = { id: allConversation.length, messages: [] };
  allConversation.push(newConversation);
  newConversation.messages.push(
    { role: "system", content: localStorage.getItem("savedPromptBehaviorAi") }, 
    { role: "system", content: "Hello, how can I help you ?" }
  );
}

/**
 * Au click on récupère le prompt utilisateur pour le passer à la methode send() + reset de l'input
 */
btnEl.addEventListener('click', async (event) => {
    event.preventDefault();
    await send(getLastConversationIndex(), inputEl.value)
    inputEl.value = '';
})

/**
 * Envoie un message à l'api + stock les messages user + Ai
 * @param {integer} index -- Attend l'id de la conversation
 * @param {string} userMessage -- Attend prompt utilisateur
 */
async function send(index, userMessage) {
  let currentConversation = allConversation[index].messages
  currentConversation.push({ role: "user", content: userMessage });
  conservationEl.innerHTML += currentConversation[currentConversation.length -1].content
  
  let messages = currentConversation.map((obj) => ({
        role: obj.role,
        content: obj.content,
      }));

  const requestBody = {
    model: 'gpt-3.5-turbo-0125',
    messages: [...messages],
    max_tokens: 300
  };

  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  }).then(response => response.json())
    .then(data => {
        const answerAi = data.choices[0].message;
        currentConversation.push({ role: answerAi.role, content: answerAi.content });
        displayConversation()
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Récupère et affiche la conversation sur user.html
 */
async function displayConversation() {
    let currentIndex = getLastConversationIndex(); 
    let conversation = allConversation[currentIndex].messages;

    let conversationList = document.createElement('ul');
    conversationList.classList.add('conversation-list');

    for(let i = 1; i < conversation.length; i++){
      let message = conversation[i];
      let messageItem = document.createElement('li');
      messageItem.textContent = message.content;

      if(message.role === 'user'){
        messageItem.classList.add('user-message');
      } else if (message.role === 'assistant'){
        messageItem.classList.add('assistant-message');
      } else {
        messageItem.classList.add('system-message');
      }

      // Calcul de la largeur du texte du message
      let textWidth = getTextWidth(message.content);
        
      // Définition de la largeur de l'élément <li> en pixels
      messageItem.style.width = textWidth + 'px';
      
      conversationList.appendChild(messageItem);
   
    };
 
    conservationEl.innerHTML = '';
    conservationEl.appendChild(conversationList);
}

/**
* Fonction pour calculer la largeur du texte en pixels
*/ 
function getTextWidth(text) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  context.font = '16px Arial'; // Définir la police et la taille de la police
  let width = context.measureText(text).width; // Mesurer la largeur du texte
  return width;
}
