import express from 'express'
import expressSession from 'express-session'
import path from 'path'
import { isLoggedIn } from './utils/guard';
import { adminLoggedIn } from './utils/guard';
import { userRoutes } from './routes/user-routes';
import { devRoutes } from './routes/dev-routes';
import { deckRoutes } from './routes/deck-routes';
import { marketRoutes } from './routes/market-routes';
import { Server as SocketIO } from 'socket.io';
import { lobbyRoutes } from './routes/lobby-routes2';
import { privateroomRoutes } from './routes/privateroom-routes';
import { liveroomRoutes } from './routes/liveroom-routes'
import { setSocket } from './utils/socket';
import http from 'http';
import { Client } from 'pg';
import dotenv from 'dotenv';

import { refill } from './utils/refillTimer'
import { client } from './utils/db';


dotenv.config();

//new change
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })); //this is url encoded

export const server = new http.Server(app);
export const io = new SocketIO(server);


// Login page first
app.get('/', (req, res, next) => {
    if (req.session && req.session['user'] && Object.keys(req.session['user']).length > 0) {
        next()
    } else {
        res.status(200).redirect('login.html')
    }
})


export const sessionMiddleware = expressSession({
    secret: 'Idunno',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
});


app.use(sessionMiddleware);



// declare module "express-session" {
// 	interface SessionData {
// 		name?: String;
// 	}
// }



const stripe = require('stripe')('sk_test_51LjuemCplm3N815QIPekmSgMk2m1UBc7TGpau56JO5YlB4Xlwa7A3JRQLpISlYGlQ09tVO2Ac2usUDWF6qGfdsIo00jFa9yPEG');

const YOUR_DOMAIN = 'http://localhost:8080';
app.post('/pay', async (request: any, response: any) => {
    try {
        let intent;
        if (request.body.payment_method_id) {
            // Create the PaymentIntent
            intent = await stripe.paymentIntents.create({
                payment_method: request.body.payment_method_id,
                amount: 1099,
                currency: 'usd',
                confirmation_method: 'manual',
                confirm: true
            });
        } else if (request.body.payment_intent_id) {
            intent = await stripe.paymentIntents.confirm(
                request.body.payment_intent_id
            );
        }
        // Send the response to the client
        response.send(generateResponse(intent));
    } catch (e) {
        // Display error on client
        return response.send({ error: e.message });
    }
});
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: 'price_1LkOneCplm3N815QDJic2CXh',
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.redirect(303, session.url);
});

// const YOUR_DOMAIN = 'http://localhost:8080';
const calculateOrderAmount = (items: any) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    console.log(items)
    return 1400;
};
//http://localhost:8080/checkout?payment_intent=pi_3LkQNqCplm3N815Q18MnPiH1&
//payment_intent_client_secret=pi_3LkQNqCplm3N815Q18MnPiH1_secret_L0pKMdjs0CVKwoJWyK7Yn96Xf&
//redirect_status=succeeded
app.get("/checkout", async (req, res) => {
    let payment_intent = req.query.payment_intent
    const intent = await stripe.paymentIntents.retrieve(payment_intent);
    const charges = intent.charges.data;
    console.log("paid", charges[0].paid)
    console.log("status", charges[0].status)
    console.log("outcome", charges[0].outcome)
    console.log("amount", charges[0].amount / 100)
    if (charges[0].paid) {

        if (!req.session.user.id) {
            console.log('no req session')
            return

        }
        let userId = req.session['user']['id']


        let walletData = await client.query(`
        select
        cash
        from users
        where id = $1`, [userId])



        let cash = walletData.rows[0]['cash']

        let cashEarnFromPetting = 10000

        let newCash = cash + cashEarnFromPetting

        await client.query(`
                update users 
                set 
                cash = $1
                where id = $2
                `, [newCash, userId])



    }
    // res.json({ success: true })
    res.redirect("http://localhost:8080/market/market.html?")
})
const generateResponse = (intent: any) => {
    // Note that if your API version is before 2019-02-11, 'requires_action'
    // appears as 'requires_source_action'.
    if (
        intent.status === 'requires_action' &&
        intent.next_action.type === 'use_stripe_sdk'
    ) {
        // Tell the client to handle the action
        return {
            requires_action: true,
            payment_intent_client_secret: intent.client_secret
        };
    } else if (intent.status === 'succeeded') {
        // The payment didn’t need any additional actions and completed!
        // Handle post-payment fulfillment
        return {
            success: true
        };
    } else {
        // Invalid status
        return {
            error: 'Invalid PaymentIntent status'
        }
    }
};
app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    let paymentIntent;
    if (req.body.payment_intent_id) {
        paymentIntent = await stripe.paymentIntents.confirm(
            req.body.payment_intent_id
        );
        let response = generateResponse(paymentIntent)
        console.log(response);
        res.send(response);
    } else {
        {
            paymentIntent = await stripe.paymentIntents.create({
                amount: calculateOrderAmount(items),
                currency: "hkd",
                automatic_payment_methods: {
                    enabled: true,
                },
                // confirmation_method: 'manual',
                // confirm: true
            });
        }
    }
    // console.log(paymentIntent)
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

// const createCustomer = async () => {
//     const params: Stripe.CustomerCreateParams = {
//         description: 'test customer',
//     };

//     const customer: Stripe.Customer = await stripe.customers.create(params);

//     console.log(customer.id);
// };
// createCustomer();

// import {lobbyRoutes} from './routes/lobby-routes';

app.use(lobbyRoutes)
app.use(userRoutes)
app.use(marketRoutes)
app.use(privateroomRoutes)
app.use(liveroomRoutes)

// developer routes
app.use('/dev', devRoutes)
app.use('/deck', deckRoutes)
// app.use('/market', marketRoutes)


// use express static
app.use(express.static('login'))
app.use(express.static('error'))
app.use(express.static('lobbyroom')); //[i added]
app.use(isLoggedIn, express.static('public'))
// app.use(adminLoggedIn, express.static('protected'))

app.use((req, res, next) => {
    // console.log("404")
    res.sendFile(path.resolve('error/404.html'))
})


app.post('/purchase', (req, res) => {
    console.log('received purchase')
    res.json({ success: true })
})


// call timer from refillTimer.ts in utils
setInterval(refill, 100)

setSocket(io)
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/`);
});



