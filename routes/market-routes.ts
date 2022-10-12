import express from "express";
import { request } from "http";
import { client } from "../utils/db";
import { io } from '../utils/socket';



export let marketRoutes = express.Router()
marketRoutes.use(express.json())

marketRoutes.get("/marketOnSale", getMarketOnSale)

marketRoutes.get("/marketGeneral", getMarketGeneral)

marketRoutes.post("/onSaleCardUpdate", onSaleCardUpdate)

marketRoutes.post("/normalCardUpdate", normalCardUpdate)

marketRoutes.get("/petCatEarnCash", petCatEarnCash)

marketRoutes.get("/walletInfo", walletInfo)

marketRoutes.get("/deleteNormalStock", deleteNormalStock)

marketRoutes.get("/refillNormalStock", refillNormalStock)

async function deleteNormalStock(req: express.Request, res: express.Response) {
    if (!req.session.user.id) {
        console.log('no req session')
        return

    }
    let userId = req.session['user']['id']

    await client.query(`
    delete
    from
    marketplace
    where user_id = $1 
    `, [userId])

    // console.log("normal card deleted")

    res.json({ success: true })
}

async function refillNormalStock(req: express.Request, res: express.Response) {
    if (!req.session.user.id) {
        console.log('no req session')
        return

    }

    let userId = req.session['user']['id']

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

    // console.log("normal card refilled")

    res.json({ success: true })
}



// get the cashOwned by the current user
async function walletInfo(req: express.Request, res: express.Response) {
    let userId = req.session['user']['id']
    let walletData = await client.query(`
    select
    cash
    from users
    where id = $1`, [userId])

    let cash = walletData.rows[0]['cash']
    console.log('user with id', userId, 'now has', cash, 'dollars')
    res.json({ moneyOwned: walletData.rows[0] })
}

// get the both cardOnSale data and normalCard from the DB: market & card on sales market 
async function getMarketOnSale(req: express.Request, res: express.Response) {

    // get data of onSaleCards from DB 
    let cardsOnSales = await client.query(`
    SELECT 
        cards.*,
        on_sales_price,
        isinstock
        from marketplace_on_sales
        join cards on cards.id = marketplace_on_sales.card_id

    `)

    // SELECT 
    // cards.*,
    // on_sales_price,
    // isinstock
    // from marketplace_on_sales
    // join cards on cards.id = marketplace_on_sales.card_id
    // order by random()
    // limit 4

    res.json({

        // data of onSale cards
        onSales: cardsOnSales.rows,

    })


}

async function getMarketGeneral(req: express.Request, res: express.Response) {

    let userId = req.session['user']['id']

    // get data of normal cards from DB
    let cardOnMarket = await client.query(`
    SELECT 
    cards.*
    from marketplace 
    join cards on cards.id = marketplace.card_id 
    where user_id = $1
    ` , [userId])

    res.json({

        // data of  and normal cards
        general: cardOnMarket.rows

    })
}

// update the data according to the index that the event listener got 
async function onSaleCardUpdate(req: express.Request, res: express.Response) {

    if (!req.session.user.id) {
        console.log('no req session')
        return

    }

    try {

        let userId = req.session['user']['id']
        // console.log(userId, 'userId')
        const index = req.body.index

        if (!index || !Number(index)) {
            res.status(400).json({
                message: 'index is invalid'
            })
            return
        }
        // devTool: show the index that the backend got 
        // console.log('server received card index:', index)

        // select the card from dB, where the cardId(DB) = the clicked card(JS) 
        let cardOnSales = await client.query(`
        SELECT 
        *
        from marketplace_on_sales
        where card_id = ${index}
        `)

        // devTool: show the data from of the specific card 
        console.log("The clicked card's card_id:", cardOnSales.rows[0]['card_id'])


        //check if the quantity is equal to 3

        let checkQuantityData = await client.query(`
        select
        quantity
        from
        user_cards
        where user_id = $1 and card_id = $2`, [userId, index])

        let checkQuantity = checkQuantityData.rows[0]['quantity']

        console.log(checkQuantity, '-checkQuantity')
        if (checkQuantity == 3) {
            console.log('3 copies already')
            res.status(401).json({ message: 'You got 3 copies of the card already!' })
            return
        }

        // to get the cash data from the user 
        let moneyOwnedData = await client.query(`
        select
        cash 
        from users 
        where id = $1
        `, [userId])

        let moneyOwned = moneyOwnedData.rows[0]['cash']

        // devTool: show how much money that the user has 
        console.log(`The user with id ${userId} now has`, moneyOwned)

        // get the price 
        let priceData = await client.query(`
        select
        on_sales_price 
        from marketplace_on_sales
        where card_id = $1
        `, [index])

        let price = priceData.rows[0]['on_sales_price']

        // devTool: shows the price of the onSale card 
        console.log("The price of the card is ", price)

        if (moneyOwned > price) {
            let isInStockData = await client.query(`
            select 
            isinstock 
            from marketplace_on_sales
            where card_id = $1
            `, [index])

            let isInStock = isInStockData.rows[0]['isinstock']

            if (isInStock) {

                let remainingCash = moneyOwned - price

                await client.query(`
                update users 
                set 
                cash = $1
                where id = $2
                `, [remainingCash, userId])

                await client.query(`
                update marketplace_on_sales 
                set 
                isinstock = false 
                where card_id = $1
                `, [index])

                console.log('Card purchased. CardOnSale is not in stock now.')

                // cardOnSale is sold out now

                let cardDataOnMarketData = await client.query(`
                SELECT 
                cards.*
                from marketplace_on_sales 
                join cards on cards.id = marketplace_on_sales.card_id 
                where cards.id = $1
                `, [index])

                let cardName = cardDataOnMarketData.rows[0]['name']

                let quantityData = await client.query(`
                select
                quantity
                from
                user_cards
                where user_id = $1 and card_id = $2`, [userId, index])

                let quantity = quantityData.rows[0]['quantity']

                quantity += 1

                await client.query(`
                update
                user_cards
                set quantity = $1
                where card_id = $2 and user_id = $3`, [quantity, index, userId])

                console.log('The user with id:', userId, 'just purchased', cardName + '. Now the player has', quantity, 'copies of the card.')

            } else if (isInStock == false) {

                // debug
                // console.log('Out of stock. Why can you see it?')
            }

        } else {
            console.log('not enough of money')

            res.status(401).json({ message: 'Not enough of money!' })

            return
        }

        //socket
        io.emit("reloadOnSalesForAll")

        res.json({ success: true })

    } catch (err) {
        console.log(err.message)
        return
    }
}

// ^ end of cardOnSale 

async function normalCardUpdate(req: express.Request, res: express.Response) {
    if (!req.session.user.id) {
        console.log('no req session')
        return

    }

    try {
        let userId = req.session['user']['id']
        const index = req.body.index
        console.log(userId, 'userId')

        if (!index || !Number(index)) {
            res.status(400).json({
                message: 'index is invalid'
            })
            return
        }
        console.log('server received index:', index)

        // get the card info that the user owned
        let cardDataOnMarketData = await client.query(`
        SELECT 
        cards.*
        from marketplace 
        join cards on cards.id = marketplace.card_id 
        where user_id = $1 and cards.id = $2
        `, [userId, index])

        let cardName = cardDataOnMarketData.rows[0]['name']

        let cardId = cardDataOnMarketData.rows[0]['id']

        console.log('card chosen:', cardName, 'cardId:', cardId)

        //check if the quantity is equal to 3

        let checkQuantityData = await client.query(`
        select
        quantity
        from
        user_cards
        where user_id = $1 and card_id = $2`, [userId, index])

        let checkQuantity = checkQuantityData.rows[0]['quantity']

        console.log(checkQuantity, '-checkQuantity')
        if (checkQuantity == 3) {
            console.log('3 copies already')
            res.status(401).json({ message: 'You got 3 copies of the card already!' })
            return
        }

        // to see whether the user has enough money
        let moneyOwnedData = await client.query(`
        select
        cash 
        from users 
        where id = $1
        `, [userId])

        let cash = moneyOwnedData.rows[0]['cash']

        console.log('The user with id ', userId, 'now has', cash, 'dollars')

        let priceData = await client.query(`
        select
        normal_price
        from marketplace
        join cards on cards.id = marketplace.card_id
        where user_id = $1 and card_id = $2
        `, [userId, index])

        let price = priceData.rows[0]['normal_price']

        console.log('The price of the card is', price, '.')

        if (cash > price) {

            let remainingCash = cash - price

            await client.query(`
            update users 
            set 
            cash = $1
            where id = $2
            `, [remainingCash, userId])

            let moneyOwnedData = await client.query(`
            select
            cash 
            from users 
            where id = $1
            `, [userId])

            let cashLeft = moneyOwnedData.rows[0]['cash']

            console.log('The user with id:', userId, 'now has', cashLeft, 'dollars left.')

            await client.query(`
            delete
            from marketplace
            where user_id = $1 and card_id = $2`, [userId, index])

            let quantityData = await client.query(`
            select
            quantity
            from
            user_cards
            where user_id = $1 and card_id = $2`, [userId, index])

            let quantity = quantityData.rows[0]['quantity']

            quantity += 1

            await client.query(`
            update
            user_cards
            set quantity = $1
            where card_id = $2 and user_id = $3`, [quantity, index, userId])

            console.log('The user with id:', userId, 'just purchased', cardName + '. Now the player has', quantity, 'copies of the card.')

        } else {

            console.log('not enough of money')

            res.status(401).json({ message: 'Not enough of money!' })


            return
        }

        res.json({ success: true })

    } catch (err) {
        console.log(err.message)
        return
    }
}

async function petCatEarnCash(req: express.Request, res: express.Response) {
    try {
        let userId = req.session['user']['id']

        let walletData = await client.query(`
        select
        cash
        from users
        where id = $1`, [userId])



        let cash = walletData.rows[0]['cash']

        let cashEarnFromPetting = 10

        let newCash = cash + cashEarnFromPetting

        await client.query(`
                update users 
                set 
                cash = $1
                where id = $2
                `, [newCash, userId])

        console.log('The user with id:', userId, 'just got $', cashEarnFromPetting, '. Now the user has $' + newCash + '.')
        res.json({ success: true })

    } catch (err) {
        console.log(err.message)
        return
    }


}













