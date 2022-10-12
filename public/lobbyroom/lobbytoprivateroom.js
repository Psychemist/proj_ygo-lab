const socket = io.connect();
//for countdown animation
let onhold = true; //for user to have synchronize pre-animation before join
let pickicon = false;
let divforanimationonly = document.querySelector('.foranimationonly')
let divforanimationonly2 = document.querySelector('.foranimationonly2')
let hcount = document.querySelector('.count')
let startcountindex = 3;
//for user select icon animation
let randintlst = []
let selectedrandintlst = []
let selectedicon;
for (let i = 3; i < 26; i++) {
    randintlst.push(i)
}
let selectedconfirm;
let opponenticon = document.querySelector('.opponenticon')


// the rest stuffs here
let currentuser = { 'username': null, 'id': null };
let opponent = { 'username': null, 'id': null };
let tradebool = {
    'currentuserconfirmed': false, 'opponentconfirmed': false,
    'opponentconfirmedcard': null, 'currentuserconfirmedcard': null,
    'currentusercantrade': false, 'opponentcantrade': false
}
let forbgimg = document.querySelector('.forbgimg')
let quit = document.querySelector('.quit')
let upperchat = document.querySelector('.upperchathead');
let decknames;
let mydeckwithitems;
let opponentdeckwithitems;
let cards;
let chatarea;
let welcomeuser;
//start room left and right section
let leftsec = document.querySelector('.left');
let rightsec = document.querySelector('.right');
let innerright;
let innerleft;
let submit;
let inputtxt;
let decksec;
let innerdecksec;
let lowerinnerdecksec;
let mydeckbutton;
let hisdeckbutton;
// trade area
let tradedeckbutton;
let mydeck;
let hisdeck;
let allcardsdeck;
// all buttons in upper area
let tradeconfirmbutton;
let tradecancelbutton;
let tradetradebutton;




// runs when the browser gets to it.
window.onload = async () => {
    await fetchusers();
    //[back here][ask] => if this needs await
}





//starting coutndown animation
if (onhold) {
    document.body.style.backgroundColor = "black";
    async function start() {
        for (let i = 0; i < 4; i++) {
            await deductStartIndex()
        }
        onhold = false;
        // to let user pick img
        hcount.innerHTML = ''
        divforanimationonly.innerHTML = ''
    }
    letpickicon()
    start()
}
function deductStartIndex() {
    return new Promise(function resandrej(resolve, reject) {
        setTimeout(function () {
            hcount.innerHTML = startcountindex
            resolve();
            startcountindex -= 1;
        }, 800);
    }
    )
};


function letpickicon() {
    //random selecting img
    for (let i = 0; i < 4; i++) {
        let randomnumber = getRandomInt(randintlst.length)
        selectedrandintlst.push(randintlst[randomnumber])
        let selected = randintlst.indexOf(randintlst[randomnumber])
        randintlst.splice(selected, 1)
    }
    divforanimationonly2.innerHTML += `<div class="pickimgsec">
                <h1 class="selecticonforuser"> Select Icon! </h1>
            <img class="pickedimg" index="${selectedrandintlst[0]}" src="icons/${selectedrandintlst[0]}.jpg" />
            <img class="pickedimg" index="${selectedrandintlst[1]}" src="icons/${selectedrandintlst[1]}.jpg" />
            <img class="pickedimg" index="${selectedrandintlst[2]}" src="icons/${selectedrandintlst[2]}.jpg" />
            <img class="pickedimg" index="${selectedrandintlst[3]}" src="icons/${selectedrandintlst[3]}.jpg" />
        </div>
        <div class="wholewidth">
            <button type="button" class="confirmicon">Confirm</button>
        </div>`
    let confirmicon = document.querySelector('.confirmicon')
    let pickedimgs = document.querySelectorAll('.pickedimg')
    for (let img of pickedimgs) {
        img.addEventListener('click', function (event) {
            let element = event.target;
            let imgindex = element.getAttribute('index');
            selectedicon = imgindex;
            //set all image shadow to 0 before
            for (let img of pickedimgs) {
                img.style.boxShadow = ''
            }
            img.style.boxShadow = "0px 0px 73px 27px rgba(191,191,191,1)";
            //when clicked => select img, other imgs style = ''
            selectedconfirm = document.querySelector('.confirmicon')
            confirmicontouser()
        })
    }
}
//max dont count => e.g. 0-6 6 dont count
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function confirmicontouser() {
    selectedconfirm.addEventListener('click', async function () {
        divforanimationonly2.innerHTML = ''
        divforanimationonly2.style.width = 0;
        divforanimationonly2.style.height = 0;
        document.body.style.backgroundColor = "rgba(206, 179, 154, 0.26)";
        const respond = await fetch('/getopponenticon', {
            method: 'POST',
            body: JSON.stringify({
                selectedicon: selectedicon,
                opponent: opponent['username']
            }),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        //[start room activites]
        innerleft = document.querySelector('.innerleft')
        innerright = document.querySelector('.innerright')
        addinnerrighthtml()
        mydeck.innerHTML = await assignSelect(decknames['mydecks'])
        hisdeck.innerHTML = await assignSelect(decknames['opponentdecks'])
        checkMyDeck()
        checkHisDeck()
        checkTrade()
        showallcards(cards['opponentcards']) //default show his cards

    })

}

function addinnerrighthtml() {
    //assign items inside innerHTML at beginning after room starts
    // forbgimg.innerHTML += '<img src="roombg.jpeg" class="lobbybgimg"/>'
    innerright.innerHTML +=
        `<div class="decksec">
                    <div class="mydeck">
                        <p>My deck</p>
                    </div>
                    <div class="selectdecksec">
                        <select name="selectmydeck">
                            <option value="All">All</option>
                        </select>
                    </div>
                    <div class="hisdeck">
                        <p>His deck</p>
                    </div>
                    <div class="selectdecksec">
                        <select name="selecthisdeck">
                            <option value="All">All</option>
                            <!-- <option value="Deck 1">Deck 1</option>
                            <option value="Deck 2">Deck 2</option>
                            <option value="Deck 3">Deck 3</option>
                            <option value="Deck 4">Deck 4</option> -->
                        </select>
                    </div>
                    <div class="tradedeck">
                        <p>Trade</p>
                    </div>

                </div>
                <div class="decks">
                </div>`
    innerleft.innerHTML += `            
            <div class="scroll">
            </div>
            <input type="text" class="inputtxt" name="inputtxt">
            <button type="button" class="sendtxt">Send</button>`
    chatarea = document.querySelector('.scroll')
    submit = document.querySelector('.sendtxt')
    inputtxt = document.querySelector('.inputtxt')
    decksec = document.querySelector('.decks')
    mydeckbutton = document.querySelector('.mydeck')
    hisdeckbutton = document.querySelector('.hisdeck')
    tradedeckbutton = document.querySelector('.tradedeck')
    mydeck = document.querySelector('[name="selectmydeck"]')
    hisdeck = document.querySelector('[name="selecthisdeck"]')
    welcomeuser = document.querySelector('.welcomeuser');
    upperchat.innerHTML = opponent['username']
    welcomeuser.innerHTML = `<h1>Welcome, ${currentuser['username']} <img class="playericon" index="${selectedicon}" src="icons/${selectedicon}.jpg" /></h1>`
    sendText()
    leftsec.style.width = "30%";
    leftsec.style.height = "97vh";
    rightsec.style.width = "70%";
    rightsec.style.height = "100vh";
}


//get current user and opponent
async function fetchusers() {
    const respond = await fetch('/joinedroomsync', {
        method: 'POST'
    })
    if (respond.status === 200) {
        const data = await respond.json()
        opponent['username'] = data['opponent'];
        opponent['id'] = data['opponentid'];
        currentuser['username'] = data['currentuser'];
        currentuser['id'] = data['currentuserid'];
        cards = data['cards'];
        decknames = data['decknames'];
        mydeckwithitems = data['mydeckwithitems'];
        opponentdeckwithitems = data['opponentdeckwithitems'];
    }
}

//currentuser press quit current room
quit.addEventListener('click', function () {
    quitownroom()
})
async function quitownroom() {
    const respond = await fetch('/endroom', {
        method: 'POST',
        body: JSON.stringify({
            currentuser: currentuser['username'],
            opponent: opponent['username']
        }),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
}



function sendText() {
    submit.addEventListener('click', async function (event) {
        let currenttxt = inputtxt.value //text that user input
        const respond = await fetch('/privateroomchat', {
            method: 'POST',
            body: JSON.stringify({
                opponent: opponent['username'],
                msg: currenttxt
            }),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (respond.ok) {
            chatarea.innerHTML += `<p class="mytxt">${currenttxt}</p><br>`
            currenttxt = ''
        }
    })
}



//back here, this is for decks => arrange here after windows onload
function receiveText(msg) {
    chatarea.innerHTML += `<p class="opponenttxt">${msg}</p><br>`
}


function checkMyDeck() {
    mydeckbutton.addEventListener('click', function () {
        if (!tradebool['currentuserconfirmed']) {
            let value = mydeck.options[mydeck.selectedIndex].value;
            if (value == 'All') {
                showallcards(cards['mycards'])
            } else {
                showallcards(mydeckwithitems[value])
            }
            hisdeckbutton.style.opacity = "0.2";
            mydeckbutton.style.opacity = "1";
            tradedeckbutton.style.opacity = "0.2";
        }



    })
}
function checkHisDeck() {
    hisdeckbutton.addEventListener('click', function () {
        if (!tradebool['currentuserconfirmed']) {
            let value = hisdeck.options[hisdeck.selectedIndex].value;
            if (value == 'All') {
                showallcards(cards['opponentcards'])
            } else {
                showallcards(opponentdeckwithitems[value])
            }
            mydeckbutton.style.opacity = "0.2";
            tradedeckbutton.style.opacity = "0.2";
            hisdeckbutton.style.opacity = "1";
        }

    })
}

//showing all cards for his deck or my deck 'option'
function showallcards(array) {
    decksec.innerHTML = ''
    for (let c of array) {
        decksec.innerHTML += `<img src="../cardAssets/${c}" class="card" >`
    }
}

// show cards for 'trade' section
function checkTrade() {
    tradedeckbutton.addEventListener('click', function () {
        if (!tradebool['currentuserconfirmed']) {
            showtradesec()
        }
    })
}

// if opponentusername clicked clicked confirm:
function receiveConfirmCard(imgname) {
    chatarea.innerHTML += `<p class="opponenttxt">User ${opponent['username']} confirmed card: </p>
            <img src="../cardAssets/${imgname}" class="card" class="opponenttxt" /><br>`
}

function showtradesec() {
    hisdeckbutton.style.opacity = "0.2";
    mydeckbutton.style.opacity = "0.2";
    tradedeckbutton.style.opacity = "1";
    // set innerHTML for decksec
    let index = 0;
    decksec.innerHTML = '<div class="innerdecksec"> </div> <div class="lowerinnerdecksec">'
    innerdecksec = document.querySelector('.innerdecksec')
    lowerinnerdecksec = document.querySelector('.lowerinnerdecksec')

    innerdecksec.innerHTML = `<button type="button" class="tbconfirm">Confirm</button><button type="button" class="tbcancel">Cancel his card</button><button type="button" class="tbtrade">Trade</button>`
    tradeconfirmbutton = document.querySelector('.tbconfirm');
    tradecancelbutton = document.querySelector('.tbcancel');
    tradetradebutton = document.querySelector('.tbtrade');
    for (let c of cards['allmycards']) {
        lowerinnerdecksec.innerHTML += `<img src="../cardAssets/${c}" class="all-card" index=${index}>`
        index++
    }
    allcardsdeck = document.querySelectorAll('.all-card')
    for (let card of allcardsdeck) {
        card.addEventListener('click', function (e) {
            //reset all cards' shadow
            if (!tradebool['currentuserconfirmed']) {
                for (let c of allcardsdeck) {
                    c.style.boxShadow = ''
                }
                let element = e.target
                let imgindex = element.getAttribute('index')
                card.style.boxShadow = '10px 10px 25px 12px rgba(0,0,0,0.75)';
                tradebool['currentuserconfirmedcard'] = imgindex;
            }
        })
    }
    tradeconfirmbutton.addEventListener('click', async function () {
        if (tradebool['currentuserconfirmedcard']) {

            if (tradeconfirmbutton.innerHTML == 'Confirm') {
                tradebool['currentuserconfirmed'] = true;
                tradebool['currentuserconfirmedcard'] = cards['allmycards'][tradebool['currentuserconfirmedcard']]
                const respondd = await fetch('/userconfirmedcard', {
                    method: 'POST',
                    body: JSON.stringify({
                        'opponentusername': opponent['username'], 'opponentid': opponent['id'],
                        'card': tradebool['currentuserconfirmedcard']
                    }),
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                tradeconfirmbutton.innerHTML = 'Card confirmed!!!'
            }


        }
    })
    tradecancelbutton.addEventListener('click', async function () {
        if (tradebool['opponentconfirmed']) {
            tradebool['opponentconfirmedcard'] = null;
            tradebool['opponentconfirmed'] = false;
            tradebool['opponentcantrade'] = false;
            await fetch('/cancelopponentcard', {
                method: 'POST',
                body: JSON.stringify({ 'opponentusername': opponent['username'], 'opponentid': opponent['id'] }),
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            })
            chatarea.innerHTML += `<p class="opponenttxt">${opponent['username']}'s card has been cancelled! </p>`

        }
    })
    //[back here]
    //     let tradebool = {
    //     'currentuserconfirmed': false, 'opponentconfirmed': false,
    //     'opponentconfirmedcard': null, 'currentuserconfirmedcard': null,
    //     'currentusercantrade':false, 'opponentcantrade':false
    // }
    tradetradebutton.addEventListener('click', async function () {
        if (tradebool['currentuserconfirmed'] && tradebool['opponentconfirmed']) {
            if (tradetradebutton.innerHTML == 'Trade') {
                tradebool['currentusercantrade'] = true;
                await fetch('/tradeopponentcard', {
                    method: 'POST',
                    body: JSON.stringify({ 'opponentusername': opponent['username'], 'opponentid': opponent['id'] }),
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                chatarea.innerHTML += `<p class="mytxt">You confirmed trade!</p><br>`
                tradetradebutton.innerHTML = 'Traded!'

            }
            if (tradebool['opponentcantrade']) {
                tradebothsideconfirmed()
            }
        }
    })

}
//if card is cancelled by the other side
function card_unconfirm() {
    tradebool['currentuserconfirmed'] = false;
    tradebool['currentuserconfirmedcard'] = null;
    tradebool['currentusercantrade'] = false;
    tradetradebutton.innerHTML = 'Trade';
    for (let card of allcardsdeck) {
        card.style.boxShadow = ''
    }
    tradeconfirmbutton.innerHTML = 'Confirm'
    chatarea.innerHTML += `<p class="mytxt">Your Card has been cancelled by ${opponent['username']}!</p><br>`
}

//assign select for mydeck and hisdeck [back here]
function assignSelect(deckarray) {
    let decknameinnerH = '<option value="All">All</option>'
    for (let dname of deckarray) {
        decknameinnerH += `<option value="${dname}">${dname}</option>`
    }
    return decknameinnerH
}

// when both side clicked trade => fetch api to backend and reset everything
async function tradebothsideconfirmed() {
    const respond = await fetch('/bothconfirmedtrade', {
        method: 'POST',
        body: JSON.stringify({
            'opponentusername': opponent['username'], 'opponentid': opponent['id'],
            'opponentconfirmedcard': tradebool['opponentconfirmedcard'],
            'currentuserconfirmedcard': tradebool['currentuserconfirmedcard']
        }),
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
    chatarea.innerHTML += `<p class="imp">Trade success! </p>
            <p class="hint">Please click 'Trade' button to start trading! again</p>`

    // remove current user card from 'trade-all cards' [back here]
    let currentusercard = cards['allmycards'].indexOf(tradebool['currentuserconfirmedcard']);
    cards['allmycards'].splice(currentusercard, 1);


    // add opponent card to 'trade-all cards'
    cards['allmycards'].push(tradebool['opponentconfirmedcard'])

    lowerinnerdecksec.innerHTML = ''
    index = 0;
    for (let c of cards['allmycards']) {
        lowerinnerdecksec.innerHTML += `<img src="../cardAssets/${c}" class="all-card" index=${index}>`
        index++
    }

    // reset everything
    tradeconfirmbutton.innerHTML = 'Confirm'
    tradetradebutton.innerHTML = 'Trade'
    tradebool = {
        'currentuserconfirmed': false, 'opponentconfirmed': false,
        'opponentconfirmedcard': null, 'currentuserconfirmedcard': null,
        'currentusercantrade': false, 'opponentcantrade': false
    }
    for (let card of allcardsdeck) {
        card.style.boxShadow = ''
    }
    // update current user and opponent all cards
    if (respond.ok) {
        const data = await respond.json()
        cards['mycards'] = data['cards']['mycards'];
        cards['opponentcards'] = data['cards']['opponentcards'];
    }
}


// this is for redirect => if anyone quit, everyone is back to lobby
socket.on('redirect', function (destination) {
    window.location.href = destination
})
//when currentuser receives opponent msg
socket.on('opponentsendsmsg', (data) => {
    receiveText(data)
})
// when currentuser/opponent confirmed card, sends card api info to opponent
socket.on('userconfirmedcard', (img) => {
    receiveConfirmCard(img)
    tradebool['opponentconfirmed'] = true;
    tradebool['opponentconfirmedcard'] = img;
})


socket.on('getopponenticon', (data) => {
    opponenticon.src = `icons/${data}.jpg`
})

//if card is cancelled by other side
socket.on('card-unconfirm', () => {
    card_unconfirm()
})
socket.on('card-trade', () => {
    tradebool['opponentcantrade'] = true;
    chatarea.innerHTML += `<p class="opponenttxt">User ${opponent['username']} confirmed trade! </p>`
    if (tradebool['currentusercantrade']) {
        tradebothsideconfirmed()
    }
})