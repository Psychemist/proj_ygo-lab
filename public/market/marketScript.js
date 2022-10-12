// get countDown from server
socket.on('timerFromServer', (data) => {
    let countDown = data.timer
    let timerDiv = document.querySelector("#countDown")
    // console.log(countDown)

    if (countDown > 0) {
        timerDiv.innerHTML = countDown + " seconds to refill"
    } else if (countDown == 0) {
        timerDiv.innerHTML = "Refilling.."
    } else if (countDown == -1) {
        timerDiv.innerHTML = "Refilling..."
    } else if (countDown == -2) {
        timerDiv.innerHTML = "Refilled!"
    }

})

// generate navBar
document.querySelector('#header').innerHTML = /*HTML */
    `
            <section class="menu-bar">
            <div class="topnav">
            <div id="LHS">
                <a class="active" href="../lobbyroom/lobby.html">Lobby</a>
                
                <a href="../deckBuilding/deckBuilding.html">Deck Building</a>
                <a href="../market/market.html">Market</a>
            </div>

    
            <div class="RHS">
                <div id="user">
                    Welcome,
                </div>
                <a id="logOut" href="/logout">
                    Logout
                </a>
            </div>
            
        </div>

            </section>`


async function getUserProfile() {
    let res = await fetch('/me')
    if (!res.ok) {
        console.log('get user fail')
        return
    }

    let user = await res.json()

    gotUsername = user.data.username
    let userDiv = document.querySelector('#user')
    userDiv.innerHTML += gotUsername + "!"


}

getUserProfile()

// pop up a div that can get cash

let getCash = document.querySelector('#getMoreCash')

let getCashWindow = document.querySelector('#getCashDiv')

let openedCashWindow = false

let displayOnlinePayment = false

let closeGetCashDiv = () => {
    openedCashWindow = !openedCashWindow
    if (openedCashWindow) {
        getCashWindow.style.display = 'block'
        if (!displayOnlinePayment) {
            displayOnlinePayment = true
            onlinePayment()
        }

    } else if (!openedCashWindow) {
        getCashWindow.style.display = 'none'
    }
}

getCash.addEventListener('click', () => {
    // console.log('clicked')
    closeGetCashDiv()
})

let closeBtn = document.querySelector('#closeCashDiv')

closeBtn.addEventListener('click', () => {
    // console.log('button clicked')
    closeGetCashDiv()
})

let catImage = document.querySelector('#catImg')

catImage.addEventListener('click', async () => {
    console.log('cat petted')
    let res = await fetch('/petCatEarnCash')
    if (!res.ok) {
        console.log('get user fail')
        return
    }
    upDateWallet()
})

