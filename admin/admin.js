const btnEl = document.querySelector('#btn-submit');
const OPENAI_API_KEY = localStorage.getItem('openaiApiKey');
const messageInput = document.querySelector('#prompt');
const savedPromptBehaviorAi = localStorage.getItem('savedPromptBehaviorAi');

window.addEventListener('load', () => {

    if (!OPENAI_API_KEY || typeof OPENAI_API_KEY !== 'string' || OPENAI_API_KEY.length !== 51) {
        window.location.href = '../index.html';
      } else {
        if(savedPromptBehaviorAi){
            messageInput.value = savedPromptBehaviorAi;
        }
        btnEl.addEventListener('click', (event) => {
            event.preventDefault();
            const prompt = messageInput.value;
            localStorage.setItem('savedPromptBehaviorAi', prompt);
    
            alert('Prompt saved !');
        });
      }
});