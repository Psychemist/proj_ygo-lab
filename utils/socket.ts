import { Server as SocketIO } from 'socket.io';
import { server, sessionMiddleware } from '../server';
import express from 'express'
import { availableusers, lobbyrooms, lobbyliverooms, setAvailableusers, setLobbyrooms, setLobbyliverooms } from '../routes/lobby-routes2';

export let io: SocketIO
declare module 'express-session' {
    interface SessionData {
        username?: string;
        password?: string;
        available?: boolean;
        user?: any
    }
}
export function setSocket(value: SocketIO) {
    io = value
    io.use((socket, next) => {
        let req = socket.request as express.Request;
        let res = req.res as express.Response
        sessionMiddleware(req, res, next as express.NextFunction)
    });
    io.on("connection", async function (socket) {
        let req = socket.request as express.Request;
        let res = req.res as express.Response;
        // If user has already logged in
        if (req.session?.['user']?.['username']) {
            let username = req.session['user']['username']
            let userid = req.session['user']['id']
            socket.join(username)


            availableusers.push({ username, 'available': true, 'createdroom': false, userid })
            io.emit('newuser', availableusers) //this is to show new users that is online
            io.emit('updatelobbyroom', lobbyrooms)
            io.emit('updatelobbyliveroom', lobbyliverooms)
            socket.on('disconnect', () => {
                try {
                    //find left users & remove them from available users
                    const index = availableusers.findIndex(function (availableusers) {
                        // return availableusers['username'] === socket.id
                        return availableusers['username'] === username
                    })
                    if (availableusers[index]?.['createdroom']) {
                        const lindex = lobbyrooms.findIndex(function (lobbyrooms) {
                            return lobbyrooms['host'] === username
                        })

                        setLobbyrooms(lobbyrooms.filter(function (x) {
                            return x != lobbyrooms[lindex]
                        }))
                    }
                    setAvailableusers(availableusers.filter(function (x) {
                        return x != availableusers[index]
                    }))
                    io.emit('userleft', availableusers) //this is to remove from online users
                    io.emit('userleft2', lobbyrooms, lobbyliverooms) //this is to remove from lobby rooms
                    io.to(req.session['user']['username']).emit('redirect', '/login.html') //[ask dickson] => how to detect disconnect
                } catch (err) {
                    console.log(err, '-err')
                }
            })

        }
        // console.log(req.session?.['user']?.['username'], '-username line 100')
    })

}