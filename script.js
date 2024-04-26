const apiKeyForm = document.getElementById('apiKeyForm');
const apiKeyInput = document.getElementById('apiKeyInput');
const errorMessage = document.getElementById('errorMessage');

apiKeyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value.trim();
    if (apiKey.length === 0) {
        errorMessage.textContent = 'Please enter your OpenAI API key';
        return;
    }
    // Validate the API key (you may need to implement this logic)
    const isValidApiKey = validateApiKey(apiKey);
    if (isValidApiKey) {
        localStorage.setItem('openaiApiKey', apiKey);

        window.location.href = '/user/user.html';
    } else {
        errorMessage.textContent = 'Invalid OpenAI API key';
    }
});

function validateApiKey(apiKey) {
    return typeof apiKey === 'string' && /^[a-zA-Z0-9-]{51}$/.test(apiKey);
}
