let deckZoneElem = document.querySelector(".deck-zone")
let inventoryZoneElem = document.querySelector(".inventory-zone")
let deckMenuElem = document.querySelector(".deck-menu")
let deckNameElem = document.querySelector(".deck-name")
let editBtn = document.querySelector(".edit-btn")
let deleteDeckBtn = document.querySelector(".delete-deck-btn")
let createDeckBtn = document.querySelector(".create-deck-btn")
let saveBtn = document.querySelector(".save-btn")


loadDecks()

let deckIdToBeLoaded;
let deckCards = []
let inventoryCards = []



// Load the Decks (from database)
async function loadDecks() {
    const res = await fetch('/deck/loadDecks', {
        method: 'GET'
    })
    if (res.ok) {
        let dbDecks = await res.json()
        deckMenuElem.innerHTML = ""
        for (let dbDeck of dbDecks) {
            deckMenuElem.innerHTML = deckMenuElem.innerHTML + /*HTML*/`
            <li><button class="dropdown-item user-deck" id="deck-${dbDeck.id}" type="button">${dbDeck.deck_name}</button></li>
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
                await manipulateCards()
                console.log("load deck completed")
            })
            userDeckElem.addEventListener('click', async () => {
                let deckIdToBeLoaded = userDeckElem.id.slice(5)
                deckNameElem.innerHTML = userDeckElem.innerHTML
                deckNameElem.setAttribute("id", `deck-${deckIdToBeLoaded}`)

                deckCards = []
                inventoryCards = []

                await loadDeckCards(deckIdToBeLoaded)
                await manipulateCards(deckIdToBeLoaded)
                console.log("load deck completed")
            })
        }

    } else {
        console.log("load decks fail")
    }
}


// Load the Cards (from database)
async function loadDeckCards(deckId) {

    let currentDeckCardQtyList = []
    const res = await fetch(`/deck/loadDeckCards/${deckId}`, {
        method: 'GET'
    })

    if (res.ok) {
        let dbCards = await res.json()

        deckZoneElem.innerHTML = ""
        console.log("11111111 raw dbCards: ", dbCards)
        for (let dbCard of dbCards) {
            deckCards.push(dbCard)
        }


        for (let deckCard of deckCards) {
            deckZoneElem.innerHTML = deckZoneElem.innerHTML + /*HTML*/`
                <div class="card my-deck my-deck-card" id="user-card-${deckCard.user_card_id}">
                    <img src="/cardAssets/${deckCard.image}" class="card-image">
                    <div class="remove-card my-deck hide-btn" id="user-card-${deckCard.user_card_id}">
                        <div>-</div>
                    </div>
                    <div class="card-qty my-deck" id="user-card-${deckCard.user_card_id}">${deckCard.card_in_deck_quantity}</div>
                </div>
            `

        }



        for (let deckCard of deckCards) {
            let cardId = deckCard.card_id
            let qtyInDeck = deckCard.card_in_deck_quantity
            currentDeckCardQtyList.push({
                cardId: cardId,
                qtyInDeck: qtyInDeck
            })
        }

        await loadInventoryCards(deckCards)

    } else {
        console.log("load cards fail")
    }

}


async function loadInventoryCards(deckCards) {
    console.log("current deck content:", deckCards)

    const res = await fetch(`/deck/loadInventoryCards`, {
        method: 'GET'
    })

    if (res.ok) {
        let dbCards = await res.json()
        console.log("dbCards: ", dbCards)

        inventoryZoneElem.innerHTML = ""

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

        console.log("inventoryCards: ", inventoryCards)
        console.log("deckCards: ", deckCards)


        for (let inventoryCard of inventoryCards) {
            let currentInventoryQty = 3;

            for (let deckCard of deckCards) {
                if (deckCard.user_card_id == inventoryCard.id) {
                    currentInventoryQty = parseInt(inventoryCard.quantity) - parseInt(deckCard.card_in_deck_quantity)
                    break
                }
                currentInventoryQty = parseInt(inventoryCard.quantity)

            }

            inventoryZoneElem.innerHTML = inventoryZoneElem.innerHTML + /*HTML*/`
                <div class="card my-inventory my-inventory-card" id="user-card-${inventoryCard.id}">
                    <img src="/cardAssets/${inventoryCard.image}" class="card-image">
                    <div class="add-card my-inventory hide-btn" id="user-card-${inventoryCard.id}">
                        <div>+</div>
                    </div>
                    <div class="card-qty my-inventory" id="user-card-${inventoryCard.id}">${currentInventoryQty}</div>
                </div>
            `

        }
    }
}

// Edit the deck cards
async function manipulateCards() {

    let addCardBtns = document.querySelectorAll(".add-card")
    let removeCardBtns = document.querySelectorAll(".remove-card")
    let cardQtyElems = document.querySelectorAll(".card-qty")
    let myDeckCardElems = document.querySelectorAll(".my-deck-card")

    // Enter and Leave Edit Mode
    editBtn.addEventListener("click", () => {

        for (let addCardBtn of addCardBtns) {
            addCardBtn.classList.toggle("hide-btn")
        }
        for (let removeCardBtn of removeCardBtns) {
            removeCardBtn.classList.toggle("hide-btn")
        }

    });


    // Add Cards to My Deck
    for (let addCardBtn of addCardBtns) {
        addCardBtn.addEventListener("click", () => {

            console.log("deckCards @manipulateCards(): ", deckCards)

            // handle the quantity changes in My Inventory
            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == addCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {

                    let inventoryCardQty = parseInt(cardQtyElem.innerHTML)

                    if (inventoryCardQty != 0) {
                        inventoryCardQty -= 1
                        cardQtyElem.innerHTML = inventoryCardQty
                    }
                    // 點擊inventory卡的加號的時候，判斷在deck裡有沒有
                    let isExistedInDeck = false
                    console.log({ deckCards })
                    console.log({ cardQtyElem })

                    if (deckCards.length > 0) {
                        console.log("cardQtyElem.id.slice(10): ", cardQtyElem.id.slice(10))
                        for (let deckCard of deckCards) {
                            if (deckCard.user_card_id == cardQtyElem.id.slice(10)) {
                                console.log("isExistedInDeck 1: ", isExistedInDeck)
                                isExistedInDeck = true
                                break
                            }
                            else {
                                console.log("isExistedInDeck 2: ", isExistedInDeck)
                                isExistedInDeck = false

                            }
                        }
                    } else {
                        console.log("the deck content is empty.")
                        isExistedInDeck = false
                    }

                    // 假如deck裡沒有，就插入一張卡
                    if (isExistedInDeck == false) {
                        for (let inventoryCard of inventoryCards) {
                            if (inventoryCard.id == cardQtyElem.id.slice(10)) {
                                deckZoneElem.innerHTML = deckZoneElem.innerHTML + /*HTML*/`
                                    <div class="card my-deck my-deck-card" id="user-card-${inventoryCard.id}">
                                        <img src="/cardAssets/${inventoryCard.image}" class="card-image">
                                        <div class="remove-card my-deck" id="user-card-${inventoryCard.id}">
                                            <div>-</div>
                                        </div>
                                        <div class="card-qty my-deck" id="user-card-${inventoryCard.id}">0</div>
                                    </div>
                                `
                                deckCards.push(inventoryCard)
                                console.log("deckCards after adding:", deckCards)

                                cardQtyElems = document.querySelectorAll(".card-qty")

                                // 新加的 Remove Qty Btn 補返 event listeners
                                let newRemoveCardBtns = document.querySelectorAll(".remove-card")
                                let newDeckCardElems = document.querySelectorAll(".my-deck-card")
                                for (let newRemoveCardBtn of newRemoveCardBtns) {
                                    newRemoveCardBtn.addEventListener("click", () => {


                                        for (let cardQtyElem of cardQtyElems) {
                                            if (cardQtyElem.id == newRemoveCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {

                                                let inventoryCardQty = parseInt(cardQtyElem.innerHTML)

                                                if (inventoryCardQty != 3) {
                                                    inventoryCardQty += 1
                                                    cardQtyElem.innerHTML = inventoryCardQty
                                                }

                                            }
                                        }

                                        for (let cardQtyElem of cardQtyElems) {
                                            if (cardQtyElem.id == newRemoveCardBtn.id && cardQtyElem.classList.contains("my-deck")) {
                                                let deckCardQty = parseInt(cardQtyElem.innerHTML)

                                                if (deckCardQty != 0) {
                                                    deckCardQty -= 1
                                                    cardQtyElem.innerHTML = deckCardQty
                                                }

                                                if (deckCardQty == 0) {
                                                    for (let newDeckCardElem of newDeckCardElems) {
                                                        if (newDeckCardElem.id == newRemoveCardBtn.id) {
                                                            // myDeckCardElem.style.display = "none"
                                                            newDeckCardElem.style.opacity = "30%"
                                                            // newDeckCardElem.remove()
                                                            console.log("remove a card in deck zone")
                                                        }
                                                    }
                                                }

                                            }

                                        }

                                    })
                                }

                            }
                        }
                    }
                }
            }


            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == addCardBtn.id && cardQtyElem.classList.contains("my-deck")) {

                    let deckCardQty = parseInt(cardQtyElem.innerHTML)

                    if (deckCardQty != 3) {
                        deckCardQty += 1
                        cardQtyElem.innerHTML = deckCardQty
                    }

                    if (deckCardQty != 0) {
                        for (let myDeckCardElem of myDeckCardElems) {
                            if (myDeckCardElem.id == addCardBtn.id) {
                                // myDeckCardElem.style.display = "block"
                                myDeckCardElem.style.opacity = "100%"
                            }
                        }
                    }

                }

            }
        })
    }


    // Remove Cards from My Deck


    for (let removeCardBtn of removeCardBtns) {
        removeCardBtn.addEventListener("click", () => {

            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == removeCardBtn.id && cardQtyElem.classList.contains("my-inventory")) {

                    let inventoryCardQty = parseInt(cardQtyElem.innerHTML)

                    if (inventoryCardQty != 3) {
                        inventoryCardQty += 1
                        cardQtyElem.innerHTML = inventoryCardQty
                    }
                }
            }

            for (let cardQtyElem of cardQtyElems) {
                if (cardQtyElem.id == removeCardBtn.id && cardQtyElem.classList.contains("my-deck")) {
                    let deckCardQty = parseInt(cardQtyElem.innerHTML)

                    if (deckCardQty != 0) {
                        deckCardQty -= 1
                        cardQtyElem.innerHTML = deckCardQty
                    }

                    if (deckCardQty == 0) {
                        for (let myDeckCardElem of myDeckCardElems) {
                            if (myDeckCardElem.id == removeCardBtn.id) {
                                // myDeckCardElem.style.display = "none"
                                myDeckCardElem.style.opacity = "30%"

                            }
                        }
                    }

                }

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
    console.log("about to delete deck. deckIdToBeLoaded: ", deckIdToBeLoaded)
    let res = await fetch('/deck/deleteDeck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userDeckId: deckIdToBeLoaded
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
    let res = await fetch('/deck/createDeck', {
        method: 'GET'
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
    console.log("deckIdToBeLoaded at this point: ", deckIdToBeLoaded)
    console.log(deckCards)
    let editedDeckCards = []
    let deckToSave = []
    let editedDeckCardElems = document.querySelectorAll(".my-deck-card")
    let qtyElems = document.querySelectorAll(".card-qty")
    console.log("qtyElems: ", qtyElems)

    for (let editedDeckCardElem of editedDeckCardElems) {
        let id = parseInt(editedDeckCardElem.id.slice(10))
        let deckId = parseInt(deckNameElem.id.slice(5))

        let qty;
        for (let qtyElem of qtyElems) {
            if (qtyElem.id == editedDeckCardElem.id && qtyElem.classList.contains("my-deck")) {
                qty = parseInt(qtyElem.innerHTML)
                editedDeckCards.push({
                    userDeckId: deckId,
                    userCardId: id,
                    cardInDeckQuantity: qty

                })
            }
        }
    }
    console.log("editedDeckCards: ", editedDeckCards)

    for (let editedDeckCard of editedDeckCards) {
        if (editedDeckCard.cardInDeckQuantity != 0) {
            deckToSave.push(editedDeckCard)
        }
    }
    console.log("deckToSave: ", deckToSave)




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
    } else {
        console.log("fail to save")
    }




}