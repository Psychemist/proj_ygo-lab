import express from "express";
import { client } from "../utils/db";


// import { client } from "../utils/db";

export let deckRoutes = express.Router()
deckRoutes.use(express.json())



deckRoutes.post("/loadDecks", loadDecks)
deckRoutes.post('/loadDeckCards/:deckId', loadDeckCards)
deckRoutes.post('/loadInventoryCards', loadInventoryCards)
deckRoutes.post('/deleteDeck', deleteDeck)
deckRoutes.post('/createDeck', createDeck)
deckRoutes.post('/deckSaving', saveDeck)




async function loadDecks(req: express.Request, res: express.Response) {
    let userInfo = req.body
    console.log("userInfo: ", userInfo)

    let decks = await client.query(`
    select * from user_decks where user_id = ${userInfo.id}
    `)
    console.log(decks.rows)
    res.json(decks.rows)
}

async function loadDeckCards(req: express.Request, res: express.Response) {

    let userInfo = req.body
    console.log("userInfo: ", userInfo)

    const deckId = req.params.deckId;
    console.log("The deck ID the player wants is: ", deckId)

    let deckCards = await client.query(`
    select user_cards.id, quantity, user_id, name, image, user_deck_id, card_in_deck_quantity
    from user_cards
    inner join cards
    on user_cards.card_id = cards.id
    left join user_deck_cards
    on user_deck_cards.user_card_id = user_cards.id
    where user_cards.user_id = ${userInfo.id} and user_deck_id = ${deckId}
    `)
    console.log("The deck content request by the player: ", deckCards.rows)
    res.json(deckCards.rows)

}

async function loadInventoryCards(req: express.Request, res: express.Response) {

    let userInfo = req.body
    console.log("userInfo: ", userInfo)

    let inventoryCards = await client.query(`
    select user_cards.id, quantity, user_id, name, image, user_deck_id, card_in_deck_quantity
    from user_cards
    inner join cards
    on user_cards.card_id = cards.id
    left join user_deck_cards
    on user_deck_cards.user_card_id = user_cards.id
    where user_cards.user_id = ${userInfo.id} and user_cards.quantity > 0
    `)
    console.log("All the cards owned by the player: ", inventoryCards.rows)
    res.json(inventoryCards.rows)

}

async function deleteDeck(req: express.Request, res: express.Response) {
    let deckToDelete = req.body
    console.log(deckToDelete)


    await client.query(`
    DELETE FROM user_deck_cards
        where user_deck_id = ${deckToDelete.userDeckId}
    `)

    await client.query(`
        DELETE FROM user_decks
        where id = ${deckToDelete.userDeckId}
    `)
    res.end("A deck is deleted")
    // res.redirect("/deckBuilding.html")

}

async function createDeck(req: express.Request, res: express.Response) {

    let userInfo = req.body
    console.log("userInfo: ", userInfo)

    await client.query(`
    insert into user_decks
    (user_id, deck_name)
    values
    (${userInfo.id}, '(Unnamed deck)')
    `)
    console.log("A new deck is created")

    res.end("A new deck is created")

}


async function saveDeck(req: express.Request, res: express.Response) {
    let deckToSave = req.body
    console.log(deckToSave)
    let deckContent = deckToSave.deckContent
    let deckName = deckToSave.deckName
    console.log("deckConent: ", deckContent)
    console.log("deckName: ", deckName)

    await client.query(`
        DELETE FROM user_deck_cards
        where user_deck_id = ${deckContent[0]["user_deck_id"]}
    `)


    for (let row of deckContent) {
        await client.query(`
        INSERT INTO user_deck_cards 
        (user_deck_id, user_card_id, card_in_deck_quantity)
        values
        (${row["user_deck_id"]}, ${row["id"]}, ${row["card_in_deck_quantity"]})
        `)
    }

    await client.query(`
    UPDATE user_decks 
    SET deck_name = '${deckName}'
    WHERE id = ${deckContent[0]["user_deck_id"]}
    `)

    res.end("received data")

}









// http://localhost:8080/deckBuilding/deckBuilding.html