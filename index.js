const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fetch = require('isomorphic-fetch')
const url = require('url')

const config = require('./config')

// Mongo Setup
const mongoURI = `mongodb+srv://${config.mongo.USER}:${config.mongo.PASS}@${config.mongo.ADDRESS}`
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})

// User Model
const User = mongoose.model('User', { 
  name: String,
  email: String,
  password: String,
  date: { 
    type: Date,
    default: Date.now 
  }, 
  ip: String 
})

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.get('/', async (req, res) => {
  const ip = getIP(req)

  const isCaptcha = !(await ipCheck(ip))
  if (isCaptcha) {
    return res.render('register', { isCaptcha })
  }
  return res.render('register')
})

app.get('/register', async (req, res) => {
  const { heading, msg, url, title } = req.query
  return res.render('msg', { heading, msg, url, title })
})

app.post('/register', async (req, res) => {
  const ip = getIP(req)

  const preUser = await checkUserWithEmail(req.body.email)
  if (preUser) {
    return res.redirect(url.format({
       pathname: '/register',
       query: {
          msg: `User with Email [${req.body.email}] already exists`,
          heading: 'Duplicate Email',
          url: '/',
          title: 'Register'
        }
     }))
  }

  // If more requests than 3 times a day
  const isCaptcha = !(await ipCheck(ip))
  if (isCaptcha) {
    if (!(await captchaVerify(req))) {
      return res.send({msg: 'Retry Captcha', success: false})
    }
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ip: ip,
  })
  try {  
    const savedUser = await user
      .save()
    return res.redirect(url.format({
       pathname: '/register',
       query: {
          msg: `You have been successfully registered`,
          heading: 'Registration Successful',
          url: '/',
          title: 'Register'
        }
     }))
  } catch (error) {
    console.log(error)
  }
    
})

const server = app.listen(config.app.PORT, config.app.ADDRESS, function () {
  const port = server.address().port

  console.log(`Server Listening on port ${port}`)
})

function getIP(req) {
  return (req.headers['x-forwarded-for'] || '').split(',').pop() || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    req.connection.socket.remoteAddress
}

const checkUserWithEmail = async (email) => {
  const user = await User.
    findOne({email})
  return user
}

const ipCheck = async (ip) => {
  const users = await User
    .find({
      ip: ip,
      date: { $gte : (new Date((new Date()).getTime() - (10 * 24 * 60 * 60 * 1000))) }
    })
  return users.length <= 3
}

const captchaVerify = async (req) => {
  const captcha = req.body.captcha

  if (
    captcha === undefined ||
    captcha === null ||
    captcha === ''
  ) {
    return false
  }

  // Google Api Url
  const url = `https://google.com/recaptcha/api/siteverify?secret=${config.captcha.KEY}&response=${captcha}&remoteip=${req.connection.remoteAddress}`
  // Verify
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (!data) {
      return false
    } else {
      return data.success
    }
  } catch (error) {
    return false
  }

  return false
}