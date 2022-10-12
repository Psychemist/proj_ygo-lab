import express, { Request, Response } from 'express'
import { client } from '../utils/db'

export let devRoutes = express.Router()


// developer tools


devRoutes.post("/users", getAllUsers)
devRoutes.post("/cards", getAllCards)

async function getAllUsers(req: Request, res: Response) {
    let userResult = await client.query('select * from users')
    res.json({
        users: userResult.rows
    })

}

async function getAllCards(req: Request, res: Response) {
    let userResult = await client.query('select * from cards')
    res.json({
        users: userResult.rows
    })

}