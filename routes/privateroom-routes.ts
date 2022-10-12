import express, { Request, Response } from 'express'
import { fetchdeckcards, fetchcards } from './lobby-routes2';
import { appendFile } from 'fs';
import { stringify } from 'querystring';
// import { client, io } from '../server'
import { io } from '../utils/socket'
import { client } from "../utils/db";

export let privateroomRoutes = express.Router()


//redirect opponent back to lobby when currentuser pressed quit
privateroomRoutes.post('/endroom', (req, res) => {
    let opponent = req.body.opponent
    let currentuser = req.body.currentuser
    io.to(currentuser).emit('redirect', '/lobbyroom/lobby.html')
    io.to(opponent).emit('redirect', '/lobbyroom/lobby.html')
    //[test] alert function
    res.send()
    return
})

//private room: user receives msg and sends back
privateroomRoutes.post('/privateroomchat', (req, res) => {
    let opponent = req.body.opponent;
    let msg = req.body.msg;
    io.to(opponent).emit('opponentsendsmsg', msg) //io.to opponent.username = 你想收到對家的東西
    res.send()
    return
})

//if the other user picked icon
privateroomRoutes.post('/getopponenticon', (req, res) => {
    console.log(`privateroom test ussername - ${req.session['user']['username']}`)
    let opponent = req.body.opponent;
    let iconimg = req.body.selectedicon;
    io.to(opponent).emit('getopponenticon', iconimg)
    res.send()
    return
})

// if other user unconfirm card
privateroomRoutes.post('/cancelopponentcard', (req, res) => {
    let opponent = req.body.opponentusername
    io.to(opponent).emit('card-unconfirm', '')
    res.send()
    return
})

// when one side confirmed trade, fetch tradebool['cantrade'] = true
privateroomRoutes.post('/tradeopponentcard', (req, res) => {
    let opponent = req.body.opponentusername
    io.to(opponent).emit('card-trade', '')
    res.send()
    return
})

//when both side confirmed trade
privateroomRoutes.post('/bothconfirmedtrade', async (req, res) => {
    // body: JSON.stringify({
    //     'opponentusername': opponent['username'], 'opponentid': opponent['id'],
    //     'opponentconfirmedcard': tradebool['opponentconfirmedcard'],
    //     'currentuserconfirmedcard': tradebool['currentuserconfirmedcard']
    // }),
    let currentusercard = req.body.currentuserconfirmedcard;
    let opponentconfirmedcard = req.body.opponentconfirmedcard;
    let opponentid = req.body['opponentid']
    let mydeckwithitems = {}
    let opponentdeckwithitems = {}
    let decknames: any = { 'mydecks': [], 'opponentdecks': [] }
    let cards = { 'mycards': [], 'opponentcards': [] };
    await tradesuccess(req.session['user']['id'], currentusercard, opponentconfirmedcard)
    await fetchcards(req.session['user']['id'], cards['mycards'])
    await fetchcards(opponentid, cards['opponentcards'])
    await fetchdeckcards(req.session['user']['id'], decknames['mydecks'], mydeckwithitems);
    await fetchdeckcards(opponentid, decknames['opponentdecks'], opponentdeckwithitems);
    res.status(200).json({
        cards, decknames, mydeckwithitems, opponentdeckwithitems
    })
    return
})


async function tradesuccess(currentuserid: number, currentusercard: string,
    opponentcard: string) {
    let all = await client.query(`select * from cards inner join user_cards on 
    user_cards.card_id = cards.id where user_cards.user_id = ${currentuserid};`)
    let allcards = all.rows;
    for (let card of allcards) {
        if (card['image'] == currentusercard) {
            console.log(card, '=card')
            if (card['quantity'] == 1) {
                await client.query(`update user_cards set quantity = 0 where user_id = ${currentuserid} and id = ${card['id']}`)
            } else {
                await client.query(`update user_cards set quantity = ${card['quantity'] - 1} where user_id = ${currentuserid} and id = ${card['id']}`)
            }
        }
        if (card['image'] == opponentcard) {
            if (card['quantity'] > 0) {
                await client.query(`update user_cards set quantity = ${card['quantity'] + 1} where user_id = ${currentuserid} and id = ${card['id']}`)
            } else {
                await client.query(`update user_cards set quantity = 1 where user_id = ${currentuserid} and id = ${card['id']}`)
            }
        }
    }
    deleteEmptyDeckCards(currentuserid)
    // delete card from deck
}


async function deleteEmptyDeckCards(userid: number) {
    let all = await client.query(`select user_deck_cards.id from user_deck_cards inner join user_cards on user_deck_cards.user_card_id = 
    user_cards.id where user_cards.user_id = ${userid} and user_cards.quantity = 0;`)
    let emptyRows = all.rows;
    for (let c of emptyRows) {
        await client.query(`delete from user_deck_cards where id = ${c['id']}`)
    }

}