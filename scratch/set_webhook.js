
const token = '8702632225:AAGEm2HaezN2Ns7MRRZ--51A1wekt-5ClZw';
const webhookUrl = 'https://flogging-padded-limeade.ngrok-free.dev/api/telegram/webhook';
const secretToken = 'arman12nurik1209';

async function setWebhook() {
  const url = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}&secret_token=${secretToken}`;
  console.log('Setting webhook:', url.replace(token, 'BOT_TOKEN'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error setting webhook:', error.message);
  }
}

setWebhook();
