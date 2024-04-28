const OPENAI_API_KEY = localStorage.getItem("openaiApiKey");
const conservationEl = document.querySelector("#conversation");
const inputEl = document.querySelector("#userInput");
const btnEl = document.querySelector("#send-btn");
const containerConversationEl = document.querySelector(
  "#conversation-list-container"
);

//Contient une liste d'array/ de conversation. chaque conversation à des objets (interactions entre 2 acteurs).
let allConversation = [];

/**
 * Par défaut, on a l'id de la dernière conversation.
 * Au changement de la conversation, on récupère l'id de celle çi.
 * A click de l'envoie d'un message, on enverra le message à la conversation selectionnée.
 */

const getLastConversationIndex = () => allConversation.length - 1;
let currentConversationId = getLastConversationIndex();

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
  if (
    !OPENAI_API_KEY ||
    typeof OPENAI_API_KEY !== "string" ||
    OPENAI_API_KEY.length !== 51
  ) {
    window.location.href = "../index.html";
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

const displayListConversation = async () => {
  containerConversationEl.innerHTML = "";
  allConversation.forEach((_, index) => {
    containerConversationEl.innerHTML += `<button class="chat-btn" onclick="displayConversationAtIndex(${index})">Conversation ${index}</button>`;
  });
};

/**
 * 1. On crée une conversation
 * 2. On met à jour la liste des conversations
 * 3. On affiche visuellement la nouvelle conversation
 */
const createNewConversation = async () => {
  await createConversation();
  await displayListConversation();
  await displayConversationAtIndex(getLastConversationIndex());
};

/**
 * Récupère dans le Local Storage et affiche la conversation sur user.html
 * @param { number } index -- Index de la conversation actuelle
 */
const displayConversationAtIndex = async (index) => {
  currentConversationId = index;
  const conversation = allConversation[currentConversationId].messages;
  const conversationList = document.createElement("ul");
  conversationList.classList.add("conversation-list");

  const initialMessageIndex = localStorage.getItem("savedPromptBehaviorAi")
    ? 1
    : 0;

  conversation.slice(initialMessageIndex).forEach((message) => {
    const messageItem = document.createElement("li");
    messageItem.textContent = message.content;
    messageItem.classList.add(`${message.role}-message`);
    messageItem.style.width = `${getTextWidth(message.content)}px`;
    conversationList.appendChild(messageItem);
  });

  conservationEl.innerHTML = "";
  conservationEl.appendChild(conversationList);
};
/**
 * Création d'un conversation
 * Si on à un prompt pour définir le comportement de l'ia en Local storage, on le récupère et on commence la conversation
 * Sinon on commence la conversation sans prompt définissant le comportement de l'ia
 */
const createConversation = async () => {
  const newConversation = { id: allConversation.length, messages: [] };
  const savedPromptBehaviorAi = localStorage.getItem("savedPromptBehaviorAi");
  if (savedPromptBehaviorAi) {
    newConversation.messages.push({
      role: "system",
      content: savedPromptBehaviorAi,
    });
  }
  newConversation.messages.push({
    role: "system",
    content: "Hello, how can I help you ?",
  });
  allConversation.push(newConversation);
  localStorage.setItem("messageConversation", JSON.stringify(allConversation));
};

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
const send = async (index, userMessage) => {
  const currentConversation = allConversation[index].messages;
  currentConversation.push({ role: "user", content: userMessage });

  const messages = currentConversation.map(({ role, content }) => ({ role, content }));
  const requestBody = {
    model: "gpt-3.5-turbo-0125",
    messages,
    max_tokens: 300,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    const answerAi = data.choices[0].message;
    currentConversation.push(answerAi);
    localStorage.setItem("messageConversation", JSON.stringify(allConversation));
    displayConversationAtIndex(currentConversationId);
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Fonction pour calculer la largeur du texte en pixels
 * @param { string } text -- Attend un texte user ou assistant(AI)
 */
const getTextWidth = (text) => {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  context.font = "16px Arial"; // Définir la police et la taille de la police
  return context.measureText(text).width; // Mesurer la largeur du texte
};
