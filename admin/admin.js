window.addEventListener('load', () => {
    const btnEl = document.querySelector('#btn-submit');
    const messageInput = document.querySelector('#prompt');
    const savedPromptBehaviorAi = localStorage.getItem('savedPromptBehaviorAi');

    if(savedPromptBehaviorAi){
        messageInput.value = savedPromptBehaviorAi;
        console.log(typeof savedPromptBehaviorAi)
    }

    btnEl.addEventListener('click', (event) => {
        event.preventDefault();
        const prompt = messageInput.value;
        localStorage.setItem('savedPromptBehaviorAi', prompt);

        alert('Prompt saved !');
    });
});