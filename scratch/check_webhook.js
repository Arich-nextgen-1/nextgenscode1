
const token = '8702632225:AAGEm2HaezN2Ns7MRRZ--51A1wekt-5ClZw';

async function getWebhookInfo() {
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Webhook Info:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error getting webhook info:', error.message);
  }
}

getWebhookInfo();
