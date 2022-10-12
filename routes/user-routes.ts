import express, { Request, Response } from 'express'
import { client } from '../utils/db'
import { hashPassword, checkPassword } from '../utils/hash'
export let userRoutes = express.Router()


// Login app with post, linked with js 
userRoutes.post("/login", login)
userRoutes.post("/register", register)
userRoutes.get("/me", getUserProfile)
userRoutes.get("/logout", logout)


async function getUserProfile(req: express.Request, res: express.Response) {
    if (!req.session && req.session['user'] && Object.keys(req.session['user']).length === 0) {
        res.status(403).json({
            message: "403 Forbidden"
        })
        return
    }
    try {
        res.json({
            data: req.session['user'],
            id: req.session['user']['id']
            // id: req.session['id']
        })
    } catch (err) {
        console.log('err in user-routes')
    }

}
async function login(req: Request, res: Response) {
    let { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({
            message: "Invalid username or password"
        })
        return
    }

    let userResult = await client.query('SELECT * from users where username = $1 ', [username])
    let dbUser = userResult.rows[0]

    // console.log(dbUser)

    if (!dbUser) {
        res.status(400).json({
            message: "Invalid username or password"
        })
        return
    }

    let match = await checkPassword(password, dbUser.password)


    // hash checking
    if (!match) {
        res.status(400).json({
            message: "Invalid username or password"
        })
        return

    } else

        // dev login

        if (dbUser.username === "admin") {
            req.session['user'] = dbUser
            res.json({
                message: "Admin login successful"
            })

        }

    // normal login

    req.session['user'] = dbUser

    res.json({
        message: "Login successful"
    })

}

async function register(req: Request, res: Response) {

    let { username, password } = req.body


    let userResult = await client.query('SELECT id, username from users where username = $1', [username])
    let dbUser = userResult.rows[0]


    if (dbUser) {
        res.status(400).json({
            message: "This account is already exits."
        })
        return
    }

    if (!username || !password) {
        res.status(400).json({
            message: "Please input both username and password"
        })
        return
    }

    let hashedPW = await hashPassword(password)

    // starter pack
    let cash = 5000
    await client.query('INSERT INTO users (username, password, cash) VALUES ($1, $2, $3)', [username, hashedPW, cash])

    let userIdData = await client.query(`
    select
    id
    from users
    where username = $1
    `, [username])

    let userId = userIdData.rows[0]['id']

    console.log(`userId: ${userId}, username: ${username}`)


    // the cards that user can buy after 1st registration
    let starterCardToBuy = `(1, ${userId}),
    (2, ${userId}),
    (3, ${userId}),
    (4, ${userId}),
    (5, ${userId}),
    (6, ${userId}),
    (7, ${userId}),
    (8, ${userId}),
    (9, ${userId}),
    (10, ${userId}),
    (11, ${userId}),
    (12, ${userId}),
    (13, ${userId}),
    (14, ${userId}),
    (15, ${userId}),
    (16, ${userId}),
    (17, ${userId}),
    (18, ${userId}),
    (19, ${userId}),
    (20, ${userId}),
    (21, ${userId}),
    (22, ${userId}),
    (23, ${userId}),
    (24, ${userId}),
    (25, ${userId}),
    (26, ${userId}),
    (27, ${userId}),
    (28, ${userId}),
    (29, ${userId}),
    (30, ${userId}),
    (31, ${userId}),
    (32, ${userId}),
    (33, ${userId}),
    (34, ${userId}),
    (35, ${userId}),
    (36, ${userId}),
    (37, ${userId}),
    (38, ${userId}),
    (39, ${userId}),
    (40, ${userId}),
    (41, ${userId}),
    (42, ${userId}),
    (43, ${userId}),
    (44, ${userId}),
    (45, ${userId}),
    (46, ${userId}),
    (47, ${userId}),
    (48, ${userId}),
    (49, ${userId}),
    (50, ${userId}),
    (51, ${userId}),
    (52, ${userId}),
    (53, ${userId}),
    (54, ${userId}),
    (55, ${userId}),
    (56, ${userId}),
    (57, ${userId}),
    (58, ${userId}),
    (59, ${userId}),
    (60, ${userId})
    ;`

    await client.query(`INSERT INTO marketplace (card_id, user_id)
    VALUES ${starterCardToBuy}
    `)

    console.log('User Id', userId, 'now have 30 different cards that can buy in the market.')


    // setUp of user_cards
    let userCardsSetUp = `
    (1, 0, ${userId}),
    (2, 0, ${userId}),
    (3, 0, ${userId}),
    (4, 0, ${userId}),
    (5, 0, ${userId}),
    (6, 0, ${userId}),
    (7, 0, ${userId}),
    (8, 0, ${userId}),
    (9, 0, ${userId}),
    (10, 0, ${userId}),
    (11, 0, ${userId}),
    (12, 0, ${userId}),
    (13, 0, ${userId}),
    (14, 0, ${userId}),
    (15, 0, ${userId}),
    (16, 0, ${userId}),
    (17, 0, ${userId}),
    (18, 0, ${userId}),
    (19, 0, ${userId}),
    (20, 0, ${userId}),
    (21, 0, ${userId}),
    (22, 0, ${userId}),
    (23, 0, ${userId}),
    (24, 0, ${userId}),
    (25, 0, ${userId}),
    (26, 0, ${userId}),
    (27, 0, ${userId}),
    (28, 0, ${userId}),
    (29, 0, ${userId}),
    (30, 0, ${userId}),
    (31, 0, ${userId}),
    (32, 0, ${userId}),
    (33, 0, ${userId}),
    (34, 0, ${userId}),
    (35, 0, ${userId}),
    (36, 0, ${userId}),
    (37, 0, ${userId}),
    (38, 0, ${userId}),
    (39, 0, ${userId}),
    (40, 0, ${userId}),
    (41, 0, ${userId}),
    (42, 0, ${userId}),
    (43, 0, ${userId}),
    (44, 0, ${userId}),
    (45, 0, ${userId}),
    (46, 0, ${userId}),
    (47, 0, ${userId}),
    (48, 0, ${userId}),
    (49, 0, ${userId}),
    (50, 0, ${userId}),
    (51, 0, ${userId}),
    (52, 0, ${userId}),
    (53, 0, ${userId}),
    (54, 0, ${userId}),
    (55, 0, ${userId}),
    (56, 0, ${userId}),
    (57, 0, ${userId}),
    (58, 0, ${userId}),
    (59, 0, ${userId}),
    (60, 0, ${userId})
    ;
    `
    await client.query(`INSERT INTO user_cards (card_id, quantity, user_id)
    VALUES ${userCardsSetUp}
    `)


    res.json({
        message: "Registered successfully! You got 5000 Cash as the starter pack!"
    })



}

// logout 
async function logout(req: express.Request, res: express.Response) {
    if (req.session) {
        delete req.session['user'];
    }
    res.redirect('/login.html');
}