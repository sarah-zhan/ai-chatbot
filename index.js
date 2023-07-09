import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get, remove } from 'firebase/database';
import { Configuration, OpenAIApi } from 'openai';
import { process, firebase } from './env';

// config
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: firebase.env.FIREBASE_API_KEY,
	authDomain: firebase.env.FIREBASE_AUTH_DOMAIN,
	databaseURL: firebase.env.FIREBASE_DATABASE_URL,
	projectId: firebase.env.FIREBASE_PROJECT_ID,
	storageBucket: firebase.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: firebase.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: firebase.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// database
const db = getDatabase(app);

// conversation in db
const conversationRef = ref(db);

// new instance of OpenAIApi
const openai = new OpenAIApi(configuration);

const chatbotConversation = document.getElementById('chatbot-conversation');

// object to save all the answers
const dialogObject = {
	role: 'system',
	content: 'You are a nice assistance with thoughtful mindset.', //chatbot personality
};

document.addEventListener('submit', e => {
	e.preventDefault();
	const userInput = document.getElementById('user-input');
	//database push method
	push(conversationRef, {
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

const fetchAnswer = () => {
	get(conversationRef).then(async snapshot => {
		if (snapshot.exists()) {
			const dialogArray = Object.values(snapshot.val());
			dialogArray.unshift(dialogObject);
			const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: dialogArray,
				//stay between -1 and 1
				presence_penalty: 0,
				frequency_penalty: 0.3, //number too high, make it too difficult to generate content, bad grammar
			});
			// console.log('fetch response', response);
			push(conversationRef, response.data.choices[0].message);
			renderTypewriterText(response.data.choices[0].message.content);
			// console.log(response.data.choices[0].message.content);
		} else {
			console.log('No data available');
		}
	});
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

document.getElementById('clear-btn').addEventListener('click', () => {
	remove(conversationRef);
	chatbotConversation.innerHTML =
		'<div class="speech speech-ai">How can I help you?</div>';
});

const renderConversationFromDb = () => {
	get(conversationRef).then(async snapshot => {
		if (snapshot.exists()) {
			const dialogArray = Object.values(snapshot.val());
			dialogArray.forEach(dialog => {
				const newSpeechBubble = document.createElement('div');
				newSpeechBubble.classList.add('speech');
				if (dialog.role === 'assistant') {
					newSpeechBubble.classList.add('speech-ai');
				} else if (dialog.role === 'user') {
					newSpeechBubble.classList.add('speech-human');
				}
				chatbotConversation.appendChild(newSpeechBubble);
				newSpeechBubble.textContent = dialog.content;
			});
		} else {
			console.log('No data available');
		}

		chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
	});
};

renderConversationFromDb();
