async function login() {
    const loginForm = document.querySelector('#loginForm')
    loginForm.addEventListener('submit', async (e) => {

        e.preventDefault()

        let formElement = e.target
        let requestObj = {
            username: formElement.username.value,
            password: formElement.password.value
        }

        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestObj)
        })

        if (res.ok) {
            // alert("login successful")
            console.log("login successful")

            // window.location.href = '/index/index.html'
            // window.location.href = '/lobbyroom/lobby2.html'
            window.location.href = '/lobbyroom/lobby.html'

        } else {
            let data = await res.json()
            alert(data.message)


        }

    })
}

login()

async function register() {
    const loginForm = document.querySelector('#loginForm')
    const registration = loginForm.querySelector('#register')
    registration.addEventListener('click', async (e) => {

        e.preventDefault()

        let formElement = document.querySelector('#loginForm')

        let requestObj = {
            username: formElement.username.value,
            password: formElement.password.value
        }

        const res = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestObj)
        })

        if (res.ok) {
            // alert("register successful")
            let data = await res.json()
            // console.log(msg)
            alert(data.message)

        } else {
            let data = await res.json()
            alert(data.message)

        }

    })
}

register()