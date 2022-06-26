require('dotenv').config();
const Mastodon = require('mastodon-api');
const fs = require('fs');

const M = new Mastodon({
  client_key: process.env.CLIENT_KEY,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
  api_url: 'https://loa.masto.host/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

const listener = M.stream('streaming/user');

listener.on('message', msg => {
  // fs.writeFileSync(`data${new Date().getTime()}.json`, JSON.stringify(msg, null, 2));
  console.log(msg);
  
  if (msg.data.type === 'mention') {
    const acct = msg.data.account.acct;
    const id = msg.data.account.id;
    const name = msg.data.account.username;
    const stat = msg.data.status.id;
    const content = msg.data.status.content;
    const replyToId = msg.data.status.in_reply_to_id;

    const regexSaludo = /hola|hello|hi|buenos días|buenas tardes|saludos/i;
    const regexConsigna = /consigna/i;

    if (regexSaludo.test(content)) {
      saludo(stat, acct, name);
    } else if (replyToId && regexConsigna.test(content)) {
      consigna(stat, acct, name, replyToId)
    }

    console.log(`stat: ${stat}`);
    console.log(`acct: ${acct}`);
    console.log(`name: ${name}`);
    console.log(`regexSaludo: ${regexSaludo.test(content)}`);
    console.log(`regexConsigna:${regexConsigna.test(content)}`);
    console.log(`replyToId: ${replyToId}`);
  }
})



function consigna(stat, acct, name, replyToId) {
  M.get(`statuses/:${replyToId}`, {}).then(resp => {
    console.log(resp.data)
  })
}

function saludo(stat, acct, name) {
  const params = {
    in_reply_to_id: stat,
    status: `@${acct}, hola, ${name}.`,
    visibility: 'public',
  }
  
  M.post('statuses', params, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      // fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      console.log(`ID ${data.id}`);
    } 
  })
}
