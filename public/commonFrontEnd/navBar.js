// const { it } = require("node:test")

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
    // console.log('user data = ', user)
    gotUsername = user.data.username //username
    let userDiv = document.querySelector('#user')
    userDiv.innerHTML += gotUsername + "!"

    //send api to lobby for lobby to get username 
    await fetch('/lobbygetsusername', {
        method: 'POST',
        body: JSON.stringify({
            'username': user.data.username
        }),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
}


getUserProfile()