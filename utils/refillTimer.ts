import { client } from "./db"
import express from "express";
import { io } from "../utils/socket"

// const app = express()
// app.use(express.json())

// timer config for refilling (in seconds)
const countDownConfig = 30
let countDown = countDownConfig
let consoleLogTheTimer = false
let consoleLogWhenRefilled = false



export async function refill(req: express.Request, res: express.Response) {

    let ranDomMachine = () => {
        let rNum = Math.ceil(Math.random() * 60)
        return rNum
    }

    if (countDown == countDownConfig) {

        if (consoleLogTheTimer) {
            console.log(`${countDown} seconds left to refill.`)
        }

    } else if (countDown <= 5 && countDown != 0) {

        if (consoleLogTheTimer) {
            console.log(`${countDown} seconds left to refill.`)
        }

    }

    countDown--

    if (countDown === 0) {

        io.emit('deleteNormalStock')

        // io.emit('timerFromServer', { timer: countDown })
        // return
    }

    if (countDown === -1) {


        io.emit('refillNormalStock')

        // io.emit('timerFromServer', { timer: "refilling." })
        // return
    }


    if (countDown === -2) {

        let randomA = ranDomMachine()
        let randomB = ranDomMachine()
        let randomC = ranDomMachine()
        let randomD = ranDomMachine()

        countDown = countDownConfig
        await client.query(`
        delete
        from
        marketplace_on_sales 
        `)

        let priceAData = await client.query(`
        select
        normal_price 
        from
        cards
        where
        id = $1 
        `, [randomA]
        )

        let priceA = (priceAData.rows[0]['normal_price']) * 0.45

        let priceBData = await client.query(`
        select
        normal_price 
        from
        cards
        where
        id = $1 
        `, [randomB]
        )

        let priceB = (priceBData.rows[0]['normal_price']) * 0.45

        let priceCData = await client.query(`
        select
        normal_price 
        from
        cards
        where
        id = $1 
        `, [randomC]
        )

        let priceC = (priceCData.rows[0]['normal_price']) * 0.45

        let priceDData = await client.query(`
        select
        normal_price 
        from
        cards
        where
        id = $1 
        `, [randomD]
        )

        let priceD = (priceDData.rows[0]['normal_price']) * 0.45

        let randomGenOnSale = `
        (${randomA}, ${priceA}),
        (${randomB}, ${priceB}),
        (${randomC}, ${priceC}),
        (${randomD}, ${priceD});
        `

        await client.query(`
        INSERT INTO marketplace_on_sales (card_id, on_sales_price)
        VALUES
        ${randomGenOnSale}
        `)

        // console.log('cardOnSaleRegenerated')

        // console.log(randomA, randomB, randomC, randomD)


        if (consoleLogWhenRefilled) {
            console.log('Cards onSale are refilled')
        }

        io.emit('timerReloadMarketsForAll')

        // io.emit('timerFromServer', { timer: "refilled!" })

        // return
    }

    // console.log(countDown)
    io.emit('timerFromServer', { timer: countDown })

    // console.log(ranDomMachine())
    // let a = ranDomMachine()
    // let b = ranDomMachine()

    // console.log(a, b)


}