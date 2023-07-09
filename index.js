import { Configuration, OpenAIApi } from 'openai';
import { process } from './env';

// config
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

// new instance of OpenAIApi
const openai = new OpenAIApi(configuration);

const chatbotConversation = document.getElementById('chatbot-conversation');

// array to save all the answers
const dialogArray = [
	{
		role: 'system',
		content: 'You are always available to help.', //chatbot personality
	},
];

document.addEventListener('submit', e => {
	e.preventDefault();
	const userInput = document.getElementById('user-input');
	dialogArray.push({
		role: 'user',
		content: userInput.value,
	});
	// console.log(dialogArray);
	fetchAnswer();

	const newSpeechBubble = document.createElement('div');
	newSpeechBubble.classList.add('speech', 'speech-human');
	chatbotConversation.appendChild(newSpeechBubble);
	newSpeechBubble.textContent = userInput.value;
	userInput.value = '';
	chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

const fetchAnswer = async () => {
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: dialogArray,
		//stay between -1 and 1
		presence_penalty: 0,
		frequency_penalty: 0.3, //number too high, make it too difficult to generate content, bad grammar
	});
	// console.log('fetch response', response);
	dialogArray.push(response.data.choices[0].message);
	// renderTypewriterText(response.data.choices[0].message.content);
	console.log(response.data.choices[0].message.content);
};

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
