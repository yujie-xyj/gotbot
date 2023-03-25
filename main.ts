// main.ts

import axios, { AxiosResponse } from 'axios'
import {
    config,
    Wechaty,
    log,
    ScanStatus, 
    WechatyBuilder,
    Message
} from 'wechaty'

async function onMessage(message: Message) {
    try {
        const room = message.room()
        const sender = message.talker()
        const content = message.text()

        if (message.self() || (room && !content.startsWith("@gpt bot"))) {
            return
        }

        var realMessage = getMessage(content);
        if (realMessage === "ding"){
          await message.say("dong")
        }
    } catch (e) {
        console.error(e)
    }
}

function getMessage(message: string): string{
  if (message.startsWith("@gpt bot")){
    return message.substring("@gpt bot".length)
  }

  return message;
}

function pushLoginUrl(url: string){
  axios.get("https://gptresp.azurewebsites.net/GPT/setLoginUrl?url=" + url);
}

function getGPTMessage(question: string): Promise<AxiosResponse>{
  return axios.get("https://gptresp.azurewebsites.net/GPT/getResponse?question=" + question)
}

const bot = WechatyBuilder.build({
    name: "gptbot"
  })
    .on("scan", (qrcode, status) => {
      if (status === ScanStatus.Waiting && qrcode) {
        const qrcodeImageUrl = [
          'https://wechaty.js.org/qrcode/',
          encodeURIComponent(qrcode),
        ].join('')
  
        log.info(`onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);
  
        // require('qrcode-terminal').generate(qrcode, {small: true})  // show qrcode on console
        pushLoginUrl(qrcodeImageUrl);
      } else {
        log.info(`onScan: ${ScanStatus[status]}(${status})`);
      }
    })
  
    .on("login", (user) => {
      log.info(`${user} login`);
    })
  
    .on("logout", (user, reason) => {
      log.info(`${user} logout, reason: ${reason}`);
    })
  
    .on('message', onMessage)
  
  
  bot.start().then(() => {
    log.info("started.");
  });
