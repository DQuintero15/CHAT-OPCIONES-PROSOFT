const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

const WEBHOOK_BASE = 'https://demos-n8n-webhook.ykgdwx.easypanel.host/webhook/CON?chatInput=';

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createMessageEl({role, text}){
  const wrapper = document.createElement('div');
  wrapper.className = role === 'user' ? 'flex justify-end' : 'flex';

  const bubble = document.createElement('div');
  bubble.className = role === 'user'
    ? 'max-w-[80%] bg-indigo-600 text-white px-4 py-3 rounded-xl rounded-br-none whitespace-pre-wrap text-sm'
  : 'max-w-[80%] bg-gray-100 text-gray-900 px-4 py-3 rounded-xl rounded-bl-none whitespace-pre-wrap text-sm';

  bubble.textContent = text;
  wrapper.appendChild(bubble);
  return wrapper;
}

async function fetchResponse(prompt){
  const url = WEBHOOK_BASE + encodeURIComponent(prompt);
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    // data.output is expected to be an array of strings
    return data.output || [JSON.stringify(data)];
  }catch(err){
    return [`Error: ${err.message}`];
  }
}

let isSending = false;

function setSending(flag){
  isSending = flag;
  input.disabled = flag;
  sendBtn.disabled = flag;
  sendBtn.textContent = flag ? 'Enviando...' : 'Enviar';
}

function renderTypingBubble(){
  const el = document.createElement('div');
  el.className = 'flex';
  const bubble = document.createElement('div');
  bubble.className = 'max-w-[80%] bg-gray-100 text-gray-900 px-4 py-3 rounded-xl rounded-bl-none whitespace-pre-wrap text-sm flex gap-2 items-center';
  bubble.innerHTML = '<span class="animate-pulse">•</span><span class="animate-pulse">•</span><span class="animate-pulse">•</span>';
  el.appendChild(bubble);
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const prompt = input.value.trim();
  if(!prompt || isSending) return;

  // render user
  messagesEl.appendChild(createMessageEl({role:'user', text: prompt}));
  input.value = '';
  scrollToBottom();

  setSending(true);
  const typingEl = renderTypingBubble();

  const outputs = await fetchResponse(prompt);

  // remove typing
  typingEl.remove();

  // render assistant messages (each item as paragraph)
  outputs.forEach((o)=>{
    messagesEl.appendChild(createMessageEl({role:'assistant', text: o}));
  });

  setSending(false);
  scrollToBottom();
});

// no hay botón de limpiar en la UI

// keyboard handling: shift+enter for newline
input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    form.requestSubmit();
  }
});

// initial welcome message
messagesEl.appendChild(createMessageEl({role:'assistant', text: 'Hola — pregunta por una opción o por "Kardex" para probar el demo.'}));
scrollToBottom();
