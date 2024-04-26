const OPENAI_API_KEY = localStorage.getItem('openaiApiKey');
const conservationEl = document.querySelector("#conversation");
const inputEl = document.querySelector("#userInput");
const btnEl = document.querySelector("#send-btn");
const containerConversationEl = document.querySelector("#conversation-list-container");

//Contient une liste d'array/ de conversation. chaque conversation à des objets (interactions entre 2 acteurs).
let allConversation = [];

/**
 * Par défaut, on a l'id de la dernière conversation. 
 * Au changement de la conversation, on récupère l'id de celle çi. 
 * A click de l'envoie d'un message, on enverra le message à la conversation selectionnée.
 */
let currentConversationId = getLastConversationIndex();

//Pour récuperer l'index de la dernière conversation dans l'array de toute les conversations
function getLastConversationIndex() {
  return allConversation.length - 1;
}

/**
 * Début application :
 * IF
 * Au chargement de la page : Créer conversation OU recupérer une conversation
 * Si créer conversation, alors ajout conversation[] dans allconversation[] + local storage
 * 
 * ELSE
 * Afficher la liste des conversations
 * Afficher la dernière conversation
 */
window.addEventListener("load", async () => {
  if (!OPENAI_API_KEY || typeof OPENAI_API_KEY !== 'string' || OPENAI_API_KEY.length !== 51) {
    window.location.href = '../index.html';
  } else {
    let getConversationHistory = JSON.parse(
      localStorage.getItem("messageConversation")
    );
    if (getConversationHistory) {
      allConversation = getConversationHistory;
      await displayListConversation();
      await displayConversationAtIndex(getLastConversationIndex());
    } else {
      await createConversation();
      await displayConversationAtIndex(getLastConversationIndex());
    }
  }
});

// Affiche la liste des conversations avec un bouton pour chaque conversation
async function displayListConversation() {
  containerConversationEl.innerHTML = '';
  for (let i = 0; i < allConversation.length; i++) {
      containerConversationEl.innerHTML +=
          `<button class="chat-btn" onclick="displayConversationAtIndex(${i})">Conversation ${i}</button>`;
  }
}

/**
 * 1. On crée une conversation
 * 2. On met à jour la liste des conversations
 * 3. On affiche visuellement la nouvelle conversation
 */
async function createNewConversation() {
  await createConversation();
  displayListConversation();
  displayConversationAtIndex(getLastConversationIndex());
}

/**
 * Récupère dans le Local Storage et affiche la conversation sur user.html
 * @param { number } index -- Index de la conversation actuelle
 */
async function displayConversationAtIndex(index) {
  currentConversationId = index;
  let conversation = allConversation[currentConversationId].messages;
  let conversationList = document.createElement("ul");
  conversationList.classList.add("conversation-list");

  let initialMessageIndex = localStorage.getItem("savedPromptBehaviorAi")
    ? 1
    : 0;

  for (let i = initialMessageIndex; i < conversation.length; i++) {
    let message = conversation[i];
    let messageItem = document.createElement("li");
    messageItem.textContent = message.content;

    if (message.role === "user") {
      messageItem.classList.add("user-message");
    } else if (message.role === "assistant") {
      messageItem.classList.add("assistant-message");
    } else {
      messageItem.classList.add("system-message");
    }

    // Calcul de la largeur du texte du message
    let textWidth = getTextWidth(message.content);

    // Définition de la largeur de l'élément <li> en pixels
    messageItem.style.width = textWidth + "px";

    conversationList.appendChild(messageItem);
  }

  conservationEl.innerHTML = "";
  conservationEl.appendChild(conversationList);
}

/**
 * Création d'un conversation
 * Si on à un prompt pour définir le comportement de l'ia en Local storage, on le récupère et on commence la conversation
 * Sinon on commence la conversation sans prompt définissant le comportement de l'ia
 */
async function createConversation() {
  let newConversation = { id: allConversation.length, messages: [] };
  allConversation.push(newConversation);
  let savedPromptBehaviorAi = localStorage.getItem("savedPromptBehaviorAi");
  if (savedPromptBehaviorAi) {
    newConversation.messages.push(
      { role: "system", content: savedPromptBehaviorAi },
      { role: "system", content: "Hello, how can I help you ?" }
    );
  } else {
    newConversation.messages.push({
      role: "system",
      content: "Hello, how can I help you ?",
    });
  }
}


// RECUPERATION ET ENVOIE MESSAGE UTILISATEUR A L'IA

/**
 * Au click on récupère le prompt utilisateur pour le passer à la methode send() + reset de l'input
 */
btnEl.addEventListener("click", async (event) => {
  event.preventDefault();
  await send(currentConversationId, inputEl.value);
  inputEl.value = "";
});

/**
 * Envoie un message à l'api + stock les messages user + Ai
 * @param { integer } index -- Attend l'id de la conversation
 * @param { string } userMessage -- Attend prompt utilisateur
 */
async function send(index, userMessage) {
  let currentConversation = allConversation[index].messages;
  currentConversation.push({ role: "user", content: userMessage });
  conservationEl.innerHTML +=
    currentConversation[currentConversation.length - 1].content;

  let messages = currentConversation.map((obj) => ({
    role: obj.role,
    content: obj.content,
  }));

  const requestBody = {
    model: "gpt-3.5-turbo-0125",
    messages: [...messages],
    max_tokens: 300,
  };

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => response.json())
    .then((data) => {
      const answerAi = data.choices[0].message;
      currentConversation.push({
        role: answerAi.role,
        content: answerAi.content,
      });
      localStorage.setItem(
        "messageConversation",
        JSON.stringify(allConversation)
      );
      displayConversationAtIndex(currentConversationId);
    })
    .catch((error) => console.error("Error:", error));
}

/**
 * Fonction pour calculer la largeur du texte en pixels
 * @param { string } text -- Attend un texte user ou assistant(AI)
 */
function getTextWidth(text) {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  context.font = "16px Arial"; // Définir la police et la taille de la police
  let width = context.measureText(text).width; // Mesurer la largeur du texte
  return width;
}


