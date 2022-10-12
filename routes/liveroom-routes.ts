import express, { Request, Response } from 'express'
import { fetchdeckcards, fetchcards } from './lobby-routes2';
import { appendFile } from 'fs';
import { stringify } from 'querystring';
// import { client, io } from '../server'
import { io } from '../utils/socket'
import { client } from "../utils/db";
import { availableusers, lobbyrooms, setAvailableusers, setLobbyrooms, lobbyliverooms, setLobbyliverooms } from "./lobby-routes2"



export let liveroomRoutes = express.Router()
let liveroomhost: string;
let liveroomhostid: number;

//create live room [back here]
liveroomRoutes.post('/createliveroom', (req, res) => {
    const index = availableusers.findIndex(function (availableusers) {
        return req.session['user']['username'] === availableusers['username']
    })
    if (!availableusers[index]['createdroom']) {
        lobbyliverooms.push({
            'host': req.session['user']['username'], 'hostid': req.session['user']['id'],
            'joinedperson': [], 'roomtype': 'live'
        })
        liveroomhost = req.session['user']['username']
        liveroomhostid = req.session['user']['id']
        io.to(req.session['user']['username']).emit('redirect', '/lobbyroom/liveroom/liveroom.html')
        io.emit('updatelobbyliveroom', lobbyliverooms)
    } else if (availableusers[index]['createdroom']) {
        io.to(availableusers[index]['username']).emit('alertUser', "You've created a room already!")
    }
    res.send()
    return
})
liveroomRoutes.post('/joinliveroomsync', async function (req, res) {
    // check if user is host
    let ishost = false;
    let participants;
    let opponentdeckwithitems = {}
    let decknames: any = { 'opponentdecks': [] }
    let cards = { 'opponentcards': [] };
    // lobbyliverooms.push({
    //     'host': req.session['user']['username'], 'hostid': req.session['user']['id'],
    //     'joinedperson': [], 'roomtype': 'live'
    // })
    let i: number = 0;
    let index: number = 0;

    for (let l of lobbyliverooms) {
        if (l['host'] == req.session['user']['username']) {
            ishost = true;
        }
    }


    // find host index
    for (let room of lobbyliverooms) {
        if (room['host'] == liveroomhost) {
            index = i;
        }
        i++
    }


    await fetchcards(liveroomhostid, cards['opponentcards'])
    await fetchdeckcards(liveroomhostid, decknames['opponentdecks'], opponentdeckwithitems);
    if (!ishost) {
        participants = lobbyliverooms[index]['joinedperson'].length;
        res.status(200).json({
            'username': req.session['user']['username'],
            'id': req.session['user']['id'], liveroomhost, ishost, cards, decknames, opponentdeckwithitems,
            participants

        });
    } else {
        res.status(200).json({
            'username': req.session['user']['username'],
            'id': req.session['user']['id'], liveroomhost, ishost, cards, decknames, opponentdeckwithitems

        });
    }

    return
})

// when host press quit, liveroom is deleted
liveroomRoutes.post('/endliveroom', (req, res) => {
    // everyone quit with hsot
    const index = lobbyliverooms.findIndex(function (lobbyliverooms) {
        return lobbyliverooms['host'] === req.session['user']['username']
    })
    io.to(req.session['user']['username']).emit('redirect', '/lobbyroom/lobby.html')
    for (let participant of lobbyliverooms[index]['joinedperson']) {
        io.to(participant).emit('redirect', '/lobbyroom/lobby.html')
    }
    // remove item from lobbyliverooms
    setLobbyliverooms(lobbyliverooms.filter(function (x) {
        return x != lobbyliverooms[index]
    }))
    io.emit('updatelobbyliveroom', lobbyliverooms)
    res.send()
    return
})

// when others quit live room => non host
liveroomRoutes.post('/quitliveroom', function (req, res) {
    io.to(req.session['user']['username']).emit('redirect', '/lobbyroom/lobby.html')
    let participants = req.body.participants
    let host = req.body.host
    // console.log(lobbyliverooms, '-lobbyliverooms line 75')
    let i: number = 0;
    let index: number = 0;


    for (let room of lobbyliverooms) {
        if (room['host'] == host) {
            index = i;
        }
        i++
    }
    let popindex = 0;

    for (let l of lobbyliverooms[index]['joinedperson']) {
        if (req.session['user']['username'] == l) {
            popindex = lobbyliverooms[index]['joinedperson'].indexOf(l)
            lobbyliverooms[index]['joinedperson'].splice(popindex, 1)
        }
        io.to(l).emit('participantschanged', participants)

    }
    io.to(host).emit('participantschanged', participants)


    // console.log(lobbyliverooms, '-lobbyliverooms line 109')
    io.emit('updatelobbyliveroom', lobbyliverooms)
    res.send()
    return
})

//when others joined live room
liveroomRoutes.post('/otherjoinliveroom', async function (req, res) {
    let hostusn = req.body.hostusn
    liveroomhost = hostusn;




    const index = lobbyliverooms.findIndex(function (lobbyliverooms) {
        return lobbyliverooms['host'] === hostusn
    })
    liveroomhostid = lobbyliverooms[index]['hostid'] //[back here]
    lobbyliverooms[index]['joinedperson'].push(req.session['user']['username'])
    // emit event to liveroom about added participant
    for (let l of lobbyliverooms[index]['joinedperson']) {
        io.to(l).emit('participantsadded')
    }
    io.to(lobbyliverooms[index]['host']).emit('participantsadded')
    await io.to(req.session['user']['username']).emit('redirect', '/lobbyroom/liveroom/liveroom.html')
    // update user current participants
    io.emit('updatelobbyliveroom', lobbyliverooms)
    res.send()
    return
})

// privateroomRoutes.post('/getopponenticon', (req, res) => {
//     console.log(`privateroom test ussername - ${req.session['user']['username']}`)
//     let opponent = req.body.opponent;
//     let iconimg = req.body.selectedicon;
//     io.to(opponent).emit('getopponenticon', iconimg)
//     res.send()
//     return
// })


liveroomRoutes.post('/gethosticon', (req, res) => {
    //selectedicon: selectedicon,
    //host
    let iconimg = req.body.selectedicon;
    let host = req.body.host;
    if (host == req.session['user']['username']) {
        let i: number = 0;
        let index: number = 0;
        for (let room of lobbyliverooms) {
            if (room['host'] == req.body.host) {
                index = i;
            }
            i++
        }
        for (let l of lobbyliverooms[index]['joinedperson']) {
            if (req.session['user']['username'] == l) {
                io.to(l).emit('gethosticon', iconimg)
            }
        }
    }

    res.send()
    return
})

// chat area
liveroomRoutes.post('/liveroomchat', (req, res) => {
    // host,
    // 'msg': currenttxt,
    // 'currentuser': currentuser['username']
    let host = req.body.host;
    let msg = req.body.msg;
    let i: number = 0;
    let index: number = 0;
    for (let room of lobbyliverooms) {
        if (room['host'] == host) {
            index = i;
        }
        i++
    }
    for (let l of lobbyliverooms[index]['joinedperson']) {
        if (req.session['user']['username'] != l) {
            io.to(l).emit('personsendmsg', msg, req.session['user']['username'])
        }
    }
    // to host too
    if (lobbyliverooms[index]['host'] != req.session['user']['username']) {
        io.to(lobbyliverooms[index]['host']).emit('personsendmsg', msg, req.session['user']['username'])
    }
    res.send()
    return
})
