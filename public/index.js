document.querySelector('form#register')
  .addEventListener('submit', (event) => {
    event.preventDefault()
    if (validate()) {
      const captchaEl = document.querySelector('.g-recaptcha')
      if (captchaEl) {
        const captcha = document.querySelector('.g-recaptcha-response').value
        const name = document.querySelector('input[name="name"]').value
        const email = document.querySelector('input[name="email"]').value
        const password = document.querySelector('input[name="password"]').value

        fetch('/register', {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ name, email, password, captcha })
        })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            document.querySelector('p.validate').innerText += 'Retry CAPTCHA'
          }
        })
      }
      document.querySelector('form#register').submit()
    }
  })

function validate () {
  const fields = [
    { 
      id: 'name',
      validator: (v) => !(v === undefined || v === null || v === ''),
      msg: 'Name Can\'t be Empty'
    }, {
      id: 'email',
      validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
      msg: 'Invalid Email'
    }, {
      id: 'password',
      validator: (v) => {
        if ((v === undefined || v === null || v === '')) {
          return false
        } else if (v.length < 6) {
          return false
        }
        return true
      },
      msg: 'Password Needs to be atleast 6 characters'
    }
  ]

  const msgs = fields
    .filter(t => !t.validator(document.querySelector(`input[name="${t.id}"]`).value))
    .map(t => t.msg)
  
  if (msgs.length === 0) {
    document.querySelector('p.validate').innerText = ''
    return true
  } else {
    document.querySelector('p.validate').innerText = msgs.join('\n')
    return false
  }
}