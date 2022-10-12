
import express, { Request, Response } from 'express'
import { stringify } from 'querystring';
import { Socket } from 'socket.io';
import { io } from '../utils/socket'
import { client } from "../utils/db";

export let lobbyRoutes = express.Router()



declare module 'express-session' {
    interface SessionData {
        username?: string;
        password?: string;
        available?: boolean;
        user?: any
    }
}


export let availableusers: any[] = [];
export let lobbyrooms: any[] = [];
export let lobbyliverooms: any[] = [];
let currenthostandjoineduser: any = "";

export function setAvailableusers(newAvailableusers: any[]) {
    availableusers = JSON.parse(JSON.stringify(newAvailableusers))
}

export function setLobbyrooms(newLobbyrooms: any[]) {
    lobbyrooms = JSON.parse(JSON.stringify(newLobbyrooms))
}

export function setLobbyliverooms(newLobbyliverooms: any[]) {
    lobbyliverooms = JSON.parse(JSON.stringify(newLobbyliverooms))
}


lobbyRoutes.get('/my-session', (req, res) => {
    res.json((req.session))
})


// create room
lobbyRoutes.post('/createroom', (req, res) => {
    let usn = req.body.username;
    let usnid = req.body.currentuserid;
    const index = availableusers.findIndex(function (availableusers) {
        return usn === availableusers['username']
    })
    if (availableusers[index]['createdroom'] == false) {
        availableusers[index]['createdroom'] = true;
        lobbyrooms.push({ 'host': usn, 'hostid': usnid, 'joinedperson': null, 'joinedpersonid': null })
        io.emit('updatelobbyroom', lobbyrooms)
    } else {
        io.to(availableusers[index]['username']).emit('alertUser', "You've created a room already!") //send alert to user if room has been created
    }
    res.send()
    return
})



//host quit his own created room or join other rooms
lobbyRoutes.post('/deleteroom', (req, res) => {
    let usn = req.body.username; //the box's host
    let usnid = req.body.userid;//the box's host id
    let currentuser = req.body.socketid; //currentuser
    let currentuserid = req.body.currentuserid; //currentuser id
    console.log(`line 71 - box host = ${usn}, box host id = ${usnid}, currentuser = ${currentuser}, currentuserid = ${currentuserid}`)

    // aindex = find currentuser from availableusers
    const aindex = availableusers.findIndex(function (availableusers) {
        return currentuser == availableusers['username']
    })
    //if host press quit room
    if (availableusers[aindex]['username'] == usn) {
        const index = lobbyrooms.findIndex(function (lobbyrooms) {
            return currentuser == lobbyrooms['host']
        })
        lobbyrooms = lobbyrooms.filter(function (x) {
            return x != lobbyrooms[index]
        })
        availableusers[aindex]['createdroom'] = false;

    } //if host press join room
    else if (availableusers[aindex]['username'] != usn) {
        //if host created room already
        if (availableusers[aindex]['createdroom']) {
            io.to(availableusers[aindex]['username']).emit('alertUser', 'Please quit your created room first!')
        } //if host didnt create room
        else {
            // index = find host from lobbyroom
            const index = lobbyrooms.findIndex(function (lobbyrooms) {
                return usn == lobbyrooms['host']
            })
            if (lobbyrooms[index]['joinedperson'] === null) {
                //if room is available for joining
                let joinPerson = availableusers[aindex]['username']
                let joinPersonId = availableusers[aindex]['userid']
                let hostPerson = lobbyrooms[index]['host']
                let hostPersonId = lobbyrooms[index]['hostid'] //[lucky here]
                let currenthostandjoinedperson = { 'host': hostPerson, 'hostid': hostPersonId, 'joinedperson': joinPerson, 'joinedpersonid': joinPersonId }
                currenthostandjoineduser = currenthostandjoinedperson
                //tell lobbyrooms <[array]> joined person is occupied
                lobbyrooms[index]['joinedperson'] = joinPerson
                // hostingrooms.push(currenthostandjoinedperson)
                //find host from avilableusers so he can create room later
                const hindex = availableusers.findIndex(function (availableusers) {
                    return availableusers['username'] == usn
                })
                availableusers[hindex]['createdroom'] = false;
                // remove room from lobby rooms
                lobbyrooms = lobbyrooms.filter(function (x) {
                    return x != lobbyrooms[index]
                })
                // for redirecting host and joined person
                io.to(hostPerson).emit('redirect', '/lobbyroom/lobbytoprivateroom.html')
                io.to(joinPerson).emit('redirect', '/lobbyroom/lobbytoprivateroom.html')
                //for new redirected page to receive events [here] - this dont work as it loads too fast
            }
            else {
                //if others joined room => room not available for joining, inform joined user
                io.to(availableusers[aindex]['username']).emit('alertUser', `${lobbyrooms[index]['host']}'s room is full, please join another one!`)
            }
        }
    }
    io.emit('updatelobbyroomfordelete', lobbyrooms)
    res.send()
    return
})



//invite user
// lobbyRoutes.post('/inviteuser', (req, res) => {
//     const aindex = availableusers.findIndex(function (availableusers) {
//         return req.session['user']['username'] == availableusers['username']
//     })
//     if (availableusers[aindex]['createdroom']) {
//         let currentuser = req.body.currentuser;
//         let inviteduser = req.body.inviteduser;
//         io.to(inviteduser).emit('alertUser', `${currentuser} wants to invite you to join room!`)
//     }
//     res.send()
//     return
// })


//commercial part
lobbyRoutes.post('/jumptocommercial', (req, res) => {
    io.to(req.body.currentuser).emit('redirect', '/lobbyroom/commercial.html')
})

//to fetch data from commercial
lobbyRoutes.post('/joinedcommercial', async (req, res) => {
    res.json({ 'username': req.session['user']['username'], 'userid': req.session['user']['id'] })
    return
})

//add money for user whome watched commercial enough time
lobbyRoutes.post('/earnedfromcommercial', async (req, res) => {
    await useraddmoney(req.body.userid, req.body.amount);
    io.to(req.body.username).emit('redirect', '/lobbyroom/lobby.html')
    res.send();
    return
})
async function useraddmoney(userid: number, amount: number) {
    let u = await client.query(`select * from users where id = ${userid};`)
    let user = u.rows;
    let originalAmount;
    for (let u of user) {
        originalAmount = u['cash']
    }
    originalAmount += amount;
    await client.query(`update users set cash = ${originalAmount} where id = ${userid}`)
}

//sending currentuser and joined user
lobbyRoutes.post('/joinedroomsync', async (req, res) => {
    let opponent = currenthostandjoineduser['host'];
    let opponentid = currenthostandjoineduser['hostid'];
    let cards = { 'mycards': [], 'opponentcards': [], 'allmycards': [] };
    let mydeckwithitems = {}
    let decknames: any = { 'mydecks': [], 'opponentdecks': [] }
    let opponentdeckwithitems = {}
    if (currenthostandjoineduser['host'] == req.session['user']['username']) {
        opponent = currenthostandjoineduser['joinedperson']
        opponentid = currenthostandjoineduser['joinedpersonid']
    }
    //fetch all of my cards with duplication
    await fetchallcards(req.session['user']['id'], cards['allmycards'])
    //fetch all of my cards and opponent cards
    await fetchcards(req.session['user']['id'], cards['mycards'])
    await fetchcards(opponentid, cards['opponentcards'])
    // fetch all of my deck with items accordingly
    await fetchdeckcards(req.session['user']['id'], decknames['mydecks'], mydeckwithitems);
    await fetchdeckcards(opponentid, decknames['opponentdecks'], opponentdeckwithitems);
    console.log('line 197 mydecks - ', decknames)
    res.status(200).json({
        'currentuser': req.session['user']['username'], 'currentuserid': req.session['user']['id'],
        opponent, opponentid, cards, decknames, mydeckwithitems, opponentdeckwithitems
    })
    return
})


//func to fetch all cards of user
export async function fetchcards(userid: number, array: Array<['string']>) {
    let a = await client.query(`select * from cards inner join user_cards 
    on user_cards.card_id = cards.id where user_cards.user_id = ${userid};`);
    let allopponentcards = a.rows;
    for (let card of allopponentcards) {
        if (card['quantity'] > 0) {
            array.push(card['image']);
        }

    }
}

//     //[problem] array here is updated without duplicated items, but when called as func later,
//     // passed array is not updated with duplicated item => 
//     // [solution]: cannot assign [] directly, must make [] the same type as passed in func
//     return array;

// fetch TOTAL of user cards with duplication
export async function fetchallcards(userid: number, array: Array<['string']>) {
    let all = await client.query(`select * from user_cards inner join cards on user_cards.card_id = cards.id where user_id = ${userid};`)
    let allcardrows = all.rows;
    for (let a of allcardrows) {
        for (let i = 0; i < a['quantity']; i++) {
            array.push(a['image'])
        }
    }
}


//for trade part
lobbyRoutes.post('/userconfirmedcard', (req, res) => {
    let opponentusername = req.body.opponentusername;
    let opponentid = req.body.opponentid;
    let confirmedcard = req.body.card;
    //if currentuser is currentuser itself
    io.to(opponentusername).emit('userconfirmedcard', confirmedcard)
    res.send()
    return
})


// array is deckname's img
export async function fetchdeckcards(userid: number, deckarray: Array<['string']>,
    dict: Object) {
    let alld = await client.query(`select * from user_decks where user_id = ${userid};`)
    let all = await client.query(`select * from user_decks 
    inner join user_deck_cards on user_deck_cards.user_deck_id = user_decks.id
    inner join user_cards on user_cards.id = user_deck_cards.user_card_id
    inner join cards on cards.id = user_cards.card_id
    where user_cards.user_id = ${userid};`)
    let deckimgrows = all.rows;
    let deckrows = alld.rows;
    for (let d of deckrows) {
        deckarray.push(d['deck_name'])
    }
    for (let deck of deckarray) {
        let d: any = deck;
        dict[d] = []
    }
    for (let deck of deckarray) {
        for (let card of deckimgrows) {
            if (card['quantity'] > 0) {
                if (deck == card['deck_name']) {
                    let d: any = deck;
                    dict[d].push(card['image'])
                }
            }
        }
    }
}





