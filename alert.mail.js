#!/home/monitor/.nvm/versions/node/v10.7.0/bin/node

const pid = "/run/monitor/monitor.alert.mail.pid"

const fs = require('fs')
fs.writeFileSync(pid,process.pid)

const usr = fs.readFileSync('./mail.user','utf8').trim()

const redis = require('redis')
const db = redis.createClient()

var mail = require("./mail")

var events = require('events');
var watcher = new events.EventEmitter();

watcher.on('alert',function(message) {
  console.log('mail send',message)
  const tab = message.split('|')
  const to     = tab[0]
  const object = tab[1]
  const msg    = tab[2]
  mail.send([usr,to],object,msg,function(error) {
    console.log('mail send error',error)
  })
})

const alerter = redis.createClient()
alerter.on('message',function(channel,message) {
  watcher.emit('alert',message)
})
alerter.subscribe('alert:mail')
