// import { Socket } from 'dgram';
// import express from 'express';
// import http from 'http';
// import { Server as SocketIO } from 'socket.io';
// import expressSession from "express-session";
// import { Client } from 'pg';
// import dotenv from 'dotenv';
import express, { Request, Response } from 'express'
import { appendFile } from 'fs';
import { Socket } from 'socket.io';
// import { client, io } from '../server'
import { io } from '../utils/socket'

// dotenv.config();
export let lobbyRoutes = express.Router()

//ref to index3.html
// const app = express();
// app.use(lobbyRoutes)

// app.use(express.urlencoded({ extended: true })); //this is url encoded
// app.use(express.json())


declare module 'express-session' {
    interface SessionData {
        username?: string;
        password?: string;
        available?: boolean;
    }
}

// const server = new http.Server(app);
// const io = new SocketIO(server);
let availableusers: any[] = [];
let lobbyrooms: any[] = [];
let hostingrooms: any[] = [];
let currenthostandjoineduser: any = "";




// app.use(sessionMiddleware);
// io.use((socket, next) => {
//     let req = socket.request as express.Request;
//     let res = req.res as express.Response
//     sessionMiddleware(req, res, next as express.NextFunction)
// });
lobbyRoutes.post('/lobbygetsusername', async (req, res) => {
    req.session['username'] = req.body.username
    req.session.save();
    console.log('line 62', req.session['username'])
    // [problem: sometimes when user logged in, username is undefined => maybe because post (defining req.session username) is slower
    //than io.on ('connection')]]
    io.emit('/iogetsusername', req.session['username'])
    res.send()
    return
})

io.on("connection", async function (socket) {
    let req = socket.request as express.Request;
    let res = req.res as express.Response;
    socket.on('/ioreceivesusername', (data) => {
        req.session['username'] = data
        console.log('line 113, save session - ', req.session['username'])
        req.session.save()
    })
    // req.session['username'] = socket.id
    console.log(req.session['user'].username, '-username')
    console.log('updated socket id in session')
    availableusers.push({ 'username': req.session['username'], 'available': true, 'createdroom': false })
    io.emit('newuser', availableusers) //this is to show new users that is online
    io.emit('updatelobbyroom', lobbyrooms)
    socket.emit('currentuser', req.session['username']) //this is for currentuser
    socket.on('disconnect', () => {
        try {
            //find left users & remove them from available users
            const index = availableusers.findIndex(function (availableusers) {
                // return availableusers['username'] === socket.id
                return availableusers['username'] === req.session['username']
            })
            if (availableusers[index]['createdroom'] == true) {
                const lindex = lobbyrooms.findIndex(function (lobbyrooms) {
                    // return lobbyrooms['host'] === socket.id
                    return lobbyrooms['host'] === req.session['username']
                })
                lobbyrooms = lobbyrooms.filter(function (x) {
                    return x != lobbyrooms[lindex]
                })
            }
            availableusers = availableusers.filter(function (x) {
                return x != availableusers[index]
            })
            io.emit('userleft', (availableusers)) //this is to remove from online users
            io.emit('userleft2', (lobbyrooms)) //this is to remove from lobby rooms
        } catch (err) {
            console.log(err, '-err')
        }
    })


})

lobbyRoutes.get('/my-session', (req, res) => {
    res.json((req.session))
})

lobbyRoutes.post('/ioreceivesusername', (req, res) => {
    console.log('line112, ', req.session['username'])
    req.session['username'] = req.body.username
    console.log('line 121,', req.session['username'])
    // req.session.save();
})

lobbyRoutes.post('/createroom', (req, res) => {
    let usn = req.body.username;
    console.log(req.body, '-req.body')
    console.log('usn', usn)
    const index = availableusers.findIndex(function (availableusers) {
        return usn === availableusers['username']
    })
    console.log('line 97', availableusers, 'index', index)
    if (availableusers[index]['createdroom'] == false) {
        availableusers[index]['createdroom'] = true;
        lobbyrooms.push({ 'host': usn, 'joinedperson': null })
        io.emit('updatelobbyroom', lobbyrooms)
        res.send()
        return
    } else {
        io.to(availableusers[index]['username']).emit('alertUserRoomHasCreated') //send alert to user if room has been created
        console.log('io to line 142, ', availableusers[index]['username'])
        res.send()
        return
    }
})


lobbyRoutes.get('/setDummySession', (req, res) => {
    req.session['dummy'] = 'donky'
    console.log(req.session.username)
    res.end('ok')
})


//host quit his own created room or join other rooms
lobbyRoutes.post('/deleteroom', (req, res) => {
    console.log(`req.session['username']`, req.session['username'])
    let usn = req.body.username; //the box's host
    let socketid = req.body.socketid; //currentuser
    // aindex = find currentuser from availableusers
    const aindex = availableusers.findIndex(function (availableusers) {
        return socketid == availableusers['username']
    })
    //if host press quit room
    if (availableusers[aindex]['username'] == usn) {
        console.log('user quit room server side ')
        const index = lobbyrooms.findIndex(function (lobbyrooms) {
            return socketid == lobbyrooms['host']
        })
        lobbyrooms = lobbyrooms.filter(function (x) {
            return x != lobbyrooms[index]
        })
        availableusers[aindex]['createdroom'] = false;

    } //if host press join room
    else if (availableusers[aindex]['username'] != usn) {
        //if host created room already
        if (availableusers[aindex]['createdroom']) {
            console.log('host created room already')
            io.to(availableusers[aindex]['username']).emit('alertUserToQuitRoom')
            console.log('io to line 183, ', availableusers[aindex]['username'])
        } //if host didnt create room
        else {
            // index = find host from lobbyroom
            const index = lobbyrooms.findIndex(function (lobbyrooms) {
                return usn == lobbyrooms['host']
            })
            if (lobbyrooms[index]['joinedperson'] === null) {
                //if room is available for joining
                let joinPerson = availableusers[aindex]['username']
                let hostPerson = lobbyrooms[index]['host']
                let currenthostandjoinedperson = { 'host': hostPerson, 'joinedperson': joinPerson }
                currenthostandjoineduser = currenthostandjoinedperson
                //tell lobbyrooms <[array]> joined person is occupied
                lobbyrooms[index]['joinedperson'] = joinPerson
                hostingrooms.push(currenthostandjoinedperson)
                //find host from avilableusers so he can create room later
                const hindex = availableusers.findIndex(function (availableusers) {
                    return availableusers['username'] == usn
                })
                availableusers[hindex]['createdroom'] = false;
                // remove room from lobby rooms
                lobbyrooms = lobbyrooms.filter(function (x) {
                    return x != lobbyrooms[index]
                })
                console.log('host didnt create room, [someone joined] lobbyrooms:', lobbyrooms, 'hostingrooms - ', hostingrooms, 'availableusers - ', availableusers)
                //[test3]
                // for redirecting host and joined person
                io.to(hostPerson).emit('redirect', '/lobbytoprivateroom.html')
                console.log('io to line 212, ', availableusers[aindex]['username'])
                io.to(joinPerson).emit('redirect', '/lobbytoprivateroom.html')
                //for new redirected page to receive events [here] - this dont work as it loads too fast
                io.to(hostPerson).emit('test3', currenthostandjoinedperson)
                io.to(joinPerson).emit('test3', currenthostandjoinedperson)
            }
            else {
                //if others joined room => room not available for joining, inform joined user
                io.to(availableusers[aindex]['username']).emit('joinfullroom', lobbyrooms[index]['host'])
            }
        }
    }
    io.emit('updatelobbyroomfordelete', lobbyrooms)
    res.send()
    return
})


//sending currentuser and joined user
lobbyRoutes.post('/joinedroomsync', (req, res) => {
    console.log('req.session - line 197 - ', req.session.username)
    console.log(currenthostandjoineduser, '-currenthostandjoineduser')
    // res.status(200).json(currenthostandjoineduser)
    res.status(200).json({ 'currentuser': req.session.username })
    return
})
