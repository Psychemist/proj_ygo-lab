let deckChoosingInterfaceElem = document.querySelector(".deck-choosing-interface")
let deckListWrapperElem = document.querySelector(".deck-list-wrapper")
let deckZoneElem = document.querySelector(".deck-zone")
let inventoryZoneElem = document.querySelector(".inventory-zone")
let deckMenuElem = document.querySelector(".deck-menu")
let deckNameElem = document.querySelector(".deck-name")
let editBtn = document.querySelector(".edit-btn")
let deleteDeckBtn = document.querySelector(".delete-deck-btn")
let createDeckBtn = document.querySelector(".create-deck-btn")
let saveBtn = document.querySelector(".save-btn")
let content = document.querySelector('[contenteditable]');
let modalZoneElem = document.querySelector(".modal-zone")
let modalImageWrapperElem = document.querySelector(".modal-image-wrapper")


let userInfo;
let deckIdToBeLoaded;
let deckCards = []
let hiddenCards = []
let inventoryCards = []




// Get the User ID
getUserInfo()

async function getUserInfo() {
    let res = await fetch('/me', {
        method: 'GET'
    })
    if (res.ok) {
        console.log("asked for user info")
        userInfo = await res.json()
        console.log(userInfo)
        loadDecks()
    } else {
        console.log("fail to get user info")
    }

}

// Set up Modal Zone
modalZoneElem.addEventListener("click", () => {
    modalZoneElem.style.display = "none"
})





// Load the Decks (from database)
async function loadDecks() {
    const res = await fetch('/deck/loadDecks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    })
    if (res.ok) {
        let dbDecks = await res.json()
        deckMenuElem.innerHTML = ""
        deckListWrapperElem.innerHTML = ""
        for (let dbDeck of dbDecks) {
            deckMenuElem.innerHTML = deckMenuElem.innerHTML + /*HTML*/`
            <li><button class="dropdown-item user-deck" id="deck-${dbDeck.id}" type="button">${dbDeck.deck_name}</button></li>
            `
            deckListWrapperElem.innerHTML = deckListWrapperElem.innerHTML +/*HTML*/`
            <div class="deck-on-interface" id="deck-${dbDeck.id}">
                <img class="deck-box-image" src="../assets/deckBox.png" alt="deckbox">
                <div>${dbDeck.deck_name}</div>
            </div>
            `
        }

        let userDeckElems = document.querySelectorAll(".user-deck")

        for (let userDeckElem of userDeckElems) {
            userDeckElem.removeEventListener('click', async () => {
                deckIdToBeLoaded = userDeckElem.id.slice(5)
                deckNameElem.innerHTML = userDeckElem.innerHTML

                deckCards = []
                inventoryCards = []

                await loadDeckCards(deckIdToBeLoaded)
                await loadInventoryCards(deckIdToBeLoaded)
                await manipulateCards(deckIdToBeLoaded)
                console.log("load deck completed")
            })
            userDeckElem.addEventListener('click', async () => {
                deckIdToBeLoaded = userDeckElem.id.slice(5)
                deckNameElem.innerHTML = userDeckElem.innerHTML
                deckNameElem.setAttribute("id", `deck-${deckIdToBeLoaded}`)

                deckCards = []
                inventoryCards = []


                await loadDeckCards(deckIdToBeLoaded)
                await loadInventoryCards(deckIdToBeLoaded)
                await manipulateCards(deckIdToBeLoaded)
                console.log("load deck completed")
            })
        }

        let deckOnInterfaceElems = document.querySelectorAll(".deck-on-interface")
        for (let deckOnInterfaceElem of deckOnInterfaceElems) {
            deckOnInterfaceElem.removeEventListener('click', async () => {
                deckChoosingInterfaceElem.style.display = "none"
                deckIdToBeLoaded = deckOnInterfaceElem.id.slice(5)
                deckNameElem.innerHTML = deckOnInterfaceElem.innerHTML

                deckCards = []
                inventoryCards = []

                await loadDeckCards(deckIdToBeLoaded)
                await loadInventoryCards(deckIdToBeLoaded)
                await manipulateCards(deckIdToBeLoaded)
                console.log("load deck completed")
            })
            deckOnInterfaceElem.addEventListener('click', async () => {
                deckChoosingInterfaceElem.style.display = "none"
                deckIdToBeLoaded = deckOnInterfaceElem.id.slice(5)
                deckNameElem.innerHTML = deckOnInterfaceElem.getElementsByTagName('div')[0].innerHTML
                deckNameElem.setAttribute("id", `deck-${deckIdToBeLoaded}`)

                deckCards = []
                inventoryCards = []


                await loadDeckCards(deckIdToBeLoaded)
                await loadInventoryCards(deckIdToBeLoaded)
                await manipulateCards(deckIdToBeLoaded)
                console.log("load deck completed")
            })
        }

    } else {
        console.log("load decks fail")
    }
}


// Load the Deck Cards (from database)
async function loadDeckCards(deckId) {
    const res = await fetch(`/deck/loadDeckCards/${deckId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    })

    if (res.ok) {
        let dbCards = await res.json()

        for (let dbCard of dbCards) {
            if (dbCard.quantity > 0) {
                deckCards.push(dbCard)
            }
        }
        console.log("deckCards array got from DB: ", deckCards)


    } else {
        console.log("load cards fail")
    }

}



function loadDeckCardsFromArray(deckIdToBeLoaded) {

    // 創建一個 hidden cards array
    let existingDeckCardId = []
    for (let deckCard of deckCards) {
        existingDeckCardId.push(deckCard.id)
    }

    hiddenCards = []

    for (let inventoryCard of inventoryCards) {
        if (!existingDeckCardId.includes(inventoryCard.id)) {
            hiddenCards.push(inventoryCard)
        }
    }
    for (let hiddenCard of hiddenCards) {
        hiddenCard["card_in_deck_quantity"] = 0
        hiddenCard["user_deck_id"] = parseInt(deckIdToBeLoaded)

    }


    deckZoneElem.innerHTML = ""

    for (let deckCard of deckCards) {
        deckZoneElem.innerHTML = deckZoneElem.innerHTML + /*HTML*/`
            <div class="card my-deck my-deck-card" id="user-card-${deckCard.id}">
                <img src="/cardAssets/${deckCard.image}" class="card-image" id="user-card-${deckCard.id}">
                <div class="remove-card my-deck hide-btn" id="user-card-${deckCard.id}">
                    <div>-</div>
                </div>
                <div class="card-qty my-deck" id="user-card-${deckCard.id}">${deckCard.card_in_deck_quantity}</div>
            </div>
        `

    }
    for (let hiddenCard of hiddenCards) {
        deckZoneElem.innerHTML = deckZoneElem.innerHTML + /*HTML*/`
            <div class="card my-deck my-deck-card" id="user-card-${hiddenCard.id}" style ="display:none">
                <img src="/cardAssets/${hiddenCard.image}" class="card-image" id="user-card-${hiddenCard.id}">
                <div class="remove-card my-deck hide-btn" id="user-card-${hiddenCard.id}">
                    <div>-</div>
                </div>
                <div class="card-qty my-deck" id="user-card-${hiddenCard.id}">${hiddenCard.card_in_deck_quantity}</div>
            </div>
        `
    }



    // Merge the deckCards and HiddenCards
    let mergedArr = deckCards.concat(hiddenCards)
    deckCards = mergedArr
    for (let deckCard of deckCards) {
        deckCard["user_deck_id"] = parseInt(deckIdToBeLoaded)
    }
    console.log("deckCards: ", deckCards)
}

async function loadInventoryCards(deckIdToBeLoaded) {
    const res = await fetch(`/deck/loadInventoryCards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    })

    if (res.ok) {
        let dbCards = await res.json()

        // 去除重複的紀錄
        const uniqueInventoryCards = []
        inventoryCards = dbCards.filter(element => {
            const isDuplicate = uniqueInventoryCards.includes(element.id);

            if (!isDuplicate) {
                uniqueInventoryCards.push(element.id);

                return true;
            }

            return false;
        });

        loadInventoryCardsFromArray()
    }

    loadDeckCardsFromArray(deckIdToBeLoaded)


}


function loadInventoryCardsFromArray() {
    inventoryZoneElem.innerHTML = ""

    console.log("inventoryCards at the beginning of loading into innerHTML: ", inventoryCards)
    console.log("deckCards at the beginning of loading into innerHTML: ", deckCards)

    for (let inventoryCard of inventoryCards) {
        let currentInventoryQty;

        // 如果是新建的 Deck(空Array)，就只取 inventoryCard 本身的 quantity
        // 否則，就用 Quantity in Deck 減 Quantity
        if (deckCards.length > 0) {
            for (let deckCard of deckCards) {
                if (deckCard.id == inventoryCard.id) {
                    currentInventoryQty = parseInt(inventoryCard.quantity) - parseInt(deckCard.card_in_deck_quantity)
                    break
                }
                currentInventoryQty = parseInt(inventoryCard.quantity)

            }
        } else {
            currentInventoryQty = parseInt(inventoryCard.quantity)
        }

        if (currentInventoryQty > 0) {
            inventoryZoneElem.innerHTML = inventoryZoneElem.innerHTML + /*HTML*/`
                <div class="card my-inventory my-inventory-card" id="user-card-${inventoryCard.id}">
                    <img src="/cardAssets/${inventoryCard.image}" class="card-image" id="user-card-${inventoryCard.id}">
                    <div class="add-card my-inventory hide-btn" id="user-card-${inventoryCard.id}">
                        <div>+</div>
                    </div>
                    <div class="card-qty my-inventory" id="user-card-${inventoryCard.id}">${currentInventoryQty}</div>
                </div>
            `
        } else {
            inventoryZoneElem.innerHTML = inventoryZoneElem.innerHTML + /*HTML*/`
                <div class="card my-inventory my-inventory-card" id="user-card-${inventoryCard.id}" style="opacity:0.4">
                    <img src="/cardAssets/${inventoryCard.image}" class="card-image" id="user-card-${inventoryCard.id}">
                    <div class="add-card my-inventory hide-btn" id="user-card-${inventoryCard.id}">
                        <div>+</div>
                    </div>
                    <div class="card-qty my-inventory" id="user-card-${inventoryCard.id}">${currentInventoryQty}</div>
                </div>
            `
        }

    }
    console.log("inventoryCards: ", inventoryCards)

}











// Edit the deck cards
async function manipulateCards() {

    let addCardBtns = document.querySelectorAll(".add-card")
    let removeCardBtns = document.querySelectorAll(".remove-card")
    let cardQtyElems = document.querySelectorAll(".card-qty")
    let myDeckCardElems = document.querySelectorAll(".my-deck-card")
    let myInventoryCardElems = document.querySelectorAll(".my-inventory-card")
    let cardImageElems = document.querySelectorAll(".card-image")

    // Enter and Leave Edit Mode
    editBtn.addEventListener("click", showBtn);

    function showBtn() {
        for (let addCardBtn of addCardBtns) {
            addCardBtn.classList.toggle("hide-btn")
        }
        for (let removeCardBtn of removeCardBtns) {
            removeCardBtn.classList.toggle("hide-btn")
        }

    }

    // Pop up Modal Image when triggered
    for (let cardImageElem of cardImageElems) {
        cardImageElem.addEventListener("click", () => {
            modalImageWrapperElem.innerHTML = ""
            for (let inventoryCard of inventoryCards) {
                if (cardImageElem.id.slice(10) == inventoryCard.id) {
                    modalImageWrapperElem.innerHTML = `
                    <img src="/cardAssets/${inventoryCard.image}" class="card-image card-image-in-modal luminaire" id="user-card-${inventoryCard.id}">
                    `

                    modalZoneElem.style.display = "flex"
                }

            }

        })
    }



    // Add Cards to My Deck
    for (let addCardBtn of addCardBtns) {
        addCardBtn.addEventListener("click", () => {

            let zeroInventory = false

            // handle the quantity changes in My Inventory
            let cardIdToChangeInInventory;
            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == addCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {
                    cardIdToChangeInInventory = cardQtyElem.id.slice(10)

                    if (cardQtyElem.innerHTML == 0) {
                        zeroInventory = true
                        console.log("The inventory number becomes zero. zeroInventory: ", zeroInventory)
                    }

                    console.log("cardIdToChangeInInventory: ", cardIdToChangeInInventory)

                    if (cardQtyElem.innerHTML != 0) {
                        let qty = parseInt(cardQtyElem.innerHTML)
                        qty -= 1
                        cardQtyElem.innerHTML = qty
                    }
                    if (cardQtyElem.innerHTML == 0) {
                        for (let myInventoryCardElem of myInventoryCardElems) {
                            if (myInventoryCardElem.id == cardQtyElem.id) {
                                myInventoryCardElem.style.opacity = 0.5
                            }
                        }
                    }
                }
            }

            let invIndex = inventoryCards.findIndex(item => item.id == cardIdToChangeInInventory)
            if (inventoryCards[invIndex].quantity != 0) {
                inventoryCards[invIndex].quantity -= 1
            }




            // handle the quantity changes in My Deck
            let cardIdToChangeInDeck;
            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == addCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {

                }
            }

            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == addCardBtn.id && cardQtyElem.classList.contains("my-deck")) {
                    cardIdToChangeInDeck = cardQtyElem.id.slice(10)
                    console.log("cardIdToChangeInDeck: ", cardIdToChangeInDeck)


                    if (cardQtyElem.innerHTML != 3 && zeroInventory == false) {
                        let qty = parseInt(cardQtyElem.innerHTML)
                        qty += 1
                        cardQtyElem.innerHTML = qty
                    }
                    if (cardQtyElem.innerHTML > 0) {
                        for (let myDeckCardElem of myDeckCardElems) {
                            if (myDeckCardElem.id == cardQtyElem.id) {
                                myDeckCardElem.style.display = "block"
                            }
                        }
                    }
                }
            }


            let deckIndex = deckCards.findIndex(item => item.id == cardIdToChangeInInventory)
            if (deckCards[deckIndex].card_in_deck_quantity != 3 && zeroInventory == false) {
                deckCards[deckIndex].card_in_deck_quantity += 1
            }

        })
    }


    // Remove Cards from My Deck


    for (let removeCardBtn of removeCardBtns) {
        removeCardBtn.addEventListener("click", () => {


            // handle the quantity changes in My Inventory
            let cardIdToChangeInInventory;
            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == removeCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {
                    cardIdToChangeInInventory = cardQtyElem.id.slice(10)

                    if (cardQtyElem.innerHTML != 3) {
                        let qty = parseInt(cardQtyElem.innerHTML)
                        qty += 1
                        cardQtyElem.innerHTML = qty
                    }
                    if (cardQtyElem.innerHTML > 0) {
                        for (let myInventoryCardElem of myInventoryCardElems) {
                            if (myInventoryCardElem.id == cardQtyElem.id) {
                                myInventoryCardElem.style.opacity = 1
                            }
                        }
                    }
                }
            }

            let invIndex = inventoryCards.findIndex(item => item.id == cardIdToChangeInInventory)
            if (inventoryCards[invIndex].quantity != 3) {
                inventoryCards[invIndex].quantity += 1
            }




            // handle the quantity changes in My Deck
            let cardIdToChangeInDeck;
            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == removeCardBtn.id && cardQtyElem.classList.contains("my-deck")) {
                    cardIdToChangeInDeck = cardQtyElem.id.slice(10)

                    if (cardQtyElem.innerHTML != 0) {
                        let qty = parseInt(cardQtyElem.innerHTML)
                        qty -= 1
                        cardQtyElem.innerHTML = qty
                    }
                    if (cardQtyElem.innerHTML == 0) {
                        for (let myDeckCardElem of myDeckCardElems) {
                            if (myDeckCardElem.id == cardQtyElem.id) {
                                myDeckCardElem.style.display = "none"
                            }
                        }
                    }


                }
            }


            let deckIndex = deckCards.findIndex(item => item.id == cardIdToChangeInInventory)
            if (deckCards[deckIndex].card_in_deck_quantity != 0) {
                deckCards[deckIndex].card_in_deck_quantity -= 1
            }

        })
    }




}


// Delete the Deck
removeEventListenerFromDeleteBtn()
addEventListenerToDeleteBtn()

function removeEventListenerFromDeleteBtn() {
    deleteDeckBtn.removeEventListener("click", deleteDeck)

}

function addEventListenerToDeleteBtn() {
    deleteDeckBtn.addEventListener("click", deleteDeck)
}



async function deleteDeck() {
    let res = await fetch('/deck/deleteDeck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userDeckId: deckCards[0]["user_deck_id"]
        })

    })
    if (res.ok) {
        alert("You have deleted this deck!")
        deckMenuElem.innerHTML = ""
        loadDecks()

    } else {
        console.log("fail")
    }

}




// Create new Deck
createDeckBtn.addEventListener("click", async () => {
    deckChoosingInterfaceElem.style.display = "none"
    console.log("userInfo at create deck section", userInfo)

    let res = await fetch('/deck/createDeck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    })
    if (res.ok) {
        alert("You have created a new deck!")
        deckMenuElem.innerHTML = ""
        loadDecks()
    } else {
        console.log("fail")
    }

})



// Save the Deck 
removeEventListenerFromSaveBtn()
addEventListenerToSaveBtn()


async function removeEventListenerFromSaveBtn() {
    saveBtn.removeEventListener("click", saveDeck)
}

async function addEventListenerToSaveBtn() {
    saveBtn.addEventListener("click", saveDeck)
}

async function saveDeck() {
    console.log(deckCards)

    let deckToSave = []
    let deckContent = []
    for (let deckCard of deckCards) {
        if (deckCard["card_in_deck_quantity"] != 0) {
            deckContent.push(deckCard)
        }
    }
    console.log("the deck ready to be saved (without any card with quantity 0 in card): ", deckContent)

    console.log("deck name extracted from deckNameElem.innerHTML: ", deckNameElem.innerHTML)

    deckToSave = {
        "deckContent": deckContent,
        "deckName": deckNameElem.innerHTML
    }
    console.log(deckToSave)


    if (deckContent.length > 0) {
        // Send the JSON data to Server
        const res = await fetch('/deck/deckSaving', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deckToSave)
        })

        if (res.ok) {
            alert("saved successfully")
            console.log(res)
            loadDecks()
            console.log("just reloaded the deck menu")
        } else {
            console.log("fail to save")
        }

    } else {
        alert("Cannot save empty deck")
    }

}

