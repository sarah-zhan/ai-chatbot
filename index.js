import { Configuration, OpenAIApi } from 'openai';
import { process } from './env';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chatbotConversation = document.getElementById('chatbot-conversation');

const dialogArray = [
	{
		role: 'system',
		content: 'You are always available to help.',
	},
];

document.addEventListener('submit', e => {
	e.preventDefault();
	const userInput = document.getElementById('user-input');
    dialogArray.push({
			role: 'user',
			content: userInput.value,
		});
    console.log(talkArray);

	const newSpeechBubble = document.createElement('div');
	newSpeechBubble.classList.add('speech', 'speech-human');
	chatbotConversation.appendChild(newSpeechBubble);
	newSpeechBubble.textContent = userInput.value;
	userInput.value = '';
	chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

const renderTypewriterText = text => {
	const newSpeechBubble = document.createElement('div');
	newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor');
	chatbotConversation.appendChild(newSpeechBubble);
	let i = 0;
	const interval = setInterval(() => {
		newSpeechBubble.textContent += text.slice(i - 1, i);
		if (text.length === i) {
			clearInterval(interval);
			newSpeechBubble.classList.remove('blinking-cursor');
		}
		i++;
		chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
	}, 50);
};
