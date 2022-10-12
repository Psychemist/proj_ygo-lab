// socket setup
const socket = io.connect();

// reload after purchase
socket.on('reloadOnSalesForAll', () => {
    getCardsOnSale()
})

// reload after refill
socket.on('timerReloadMarketsForAll', () => {
    getCardsOnSale()
    getCardsGeneral()
})

socket.on('deleteNormalStock', () => {
    deleteNormalStock()
})

socket.on('refillNormalStock', () => {
    refillNormalStock()
})

async function deleteNormalStock() {
    let res = await fetch('/deleteNormalStock', {
        method: 'GET'
    })
    if (!res.ok) {
        console.log('delete normal stock failed')
        return
    }

}

async function refillNormalStock() {
    let res = await fetch('/refillNormalStock', {
        method: 'GET'
    })
    if (!res.ok) {
        console.log('refill normal stock failed')
        return
    }
}

// upDate innerHTML of cashOwned
async function upDateWallet() {

    let res = await fetch('/walletInfo')
    if (!res.ok) {
        console.log('get user fail')
        return
    }

    let cashData = await res.json()
    let cashGot = cashData.moneyOwned.cash

    let cashDiv = document.querySelector('#moneyOwned')
    cashDiv.innerHTML = cashGot

    // console.log('cashData', cashGot)
}

upDateWallet()


// generate the card to frontend from the database (may be reused for refreshing) 
async function getCardsOnSale() {

    // get the respond from market routes 
    // details:  server.ts : app.use('/market', marketRoutes) -> market-routes.ts : marketRoutes.get("/", getMarket)
    const res = await fetch('/marketOnSale')

    if (res.ok) {
        let data = await res.json()

        let { onSales } = data

        let specialSaleElem = document.querySelector('.specialSale')
        specialSaleElem.innerHTML = ''
        for (let onSalesCard of onSales) {

            // console.log(onSalesCard)

            // console.log(onSalesCard.isinstock)
            if (onSalesCard.isinstock == true) {
                // index = the id of the card etc. 
                specialSaleElem.innerHTML += `
                <div class="marketCards" index="${onSalesCard.id}">
                    <div class="flex">price: <div class="price">${onSalesCard.on_sales_price}</div>
                    </div>
                    <img src="../cardAssets/${onSalesCard.image}">
                    <div class="onSalePurchase">
                    PURCHASE
                        </div>
                </div>
                `

            }


        }
        //generate the shinning effect div
        specialSaleElem.innerHTML += `<div class="specialSpan"></div>`

        //trigger the function of generating event listeners 
        onSalePurchaseGeneration()

    }
}

getCardsOnSale()

async function getCardsGeneral() {

    // get the respond from market routes 
    // details:  server.ts : app.use('/market', marketRoutes) -> market-routes.ts : marketRoutes.get("/", getMarket)
    const res = await fetch('/marketGeneral')

    if (res.ok) {
        let data = await res.json()

        let { general } = data

        //generate the divs of normal cards according to the database 
        let normalSaleElem = document.querySelector('.market')
        normalSaleElem.innerHTML = ''
        for (let generalCards of general) {


            // if (parseInt(generalCards.normal_price) >= 2000) {

            //     normalSaleElem.innerHTML += `
            //     <div class="exMarketCards" index="${generalCards.id}">
            //     <div class="exFlex">price: <div class="exPrice">${generalCards.normal_price}</div>
            //     </div>
            //     <img src="../cardAssets/${generalCards.image}">
            //     <div class="normalPurchase">
            //         Purchase
            //         </div>
            // </div>
            //     `

            // } else {

            //     normalSaleElem.innerHTML += `
            //     <div class="marketCards" index="${generalCards.id}">
            //     <div class="flex">price: <div class="price">${generalCards.normal_price}</div>
            //     </div>
            //     <img src="../cardAssets/${generalCards.image}">
            //     <div class="normalPurchase">
            //         Purchase
            //         </div>
            // </div>
            //     `

            // }

            normalSaleElem.innerHTML += `
            <div class="marketCards" index="${generalCards.id}">
            <div class="flex">price: <div class="price">${generalCards.normal_price}</div>
            </div>
            <img src="../cardAssets/${generalCards.image}">
            <div class="normalPurchase">
                Purchase
                </div>
        </div>
            `
        }

        for (let i = 0; i < 20; i++) {
            normalSaleElem.innerHTML += `
            <div class="marketCardsBottom"></div>
            `

        }





        //trigger the function of generating event listeners 

        normalPurchaseGeneration()



    }


}
getCardsGeneral()

// generate the event listeners for the onSale cards 
async function onSalePurchaseGeneration() {
    let cardElements = document.querySelectorAll('.specialSale > .marketCards')
    for (let card of cardElements) {

        let imgButton = card.querySelector('img')
        imgButton.addEventListener('click', async () => {

            console.log('onSaleImg clicked')
            // console.log(imgButton.style)

        })

        let button = card.querySelector('.onSalePurchase')
        button.addEventListener('click', async () => {

            //shows the index of the current card 
            let normalCardIndex = card.getAttribute('index')
            // console.log(normalCardIndex)

            // send the index of cardOnSale to the server 
            let res = await fetch('/onSaleCardUpdate', {
                // fetch the function (marketRoutes.post("/onSaleCardUpdate", onSaleCardUpdate))
                //      ^ from market-routes 

                method: 'POST',
                body: JSON.stringify({
                    index: normalCardIndex
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                // add socket


            } else {
                let serverMsg = await res.json()
                alert(serverMsg.message)
                return
            }
            getCardsOnSale()
            upDateWallet()

        })
    }
}

//normal cards 
async function normalPurchaseGeneration() {
    let normalCards = document.querySelectorAll('.market > .marketCards')
    for (let card of normalCards) {

        let button = card.querySelector('.normalPurchase')

        button.addEventListener('click', async () => {
            let normalCardIndex = card.getAttribute('index')

            let res = await fetch('/normalCardUpdate', {
                method: 'POST',
                body: JSON.stringify({
                    index: normalCardIndex
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {


            } else {
                let serverMsg = await res.json()
                alert(serverMsg.message)
                return
            }
            getCardsGeneral()
            upDateWallet()

        })
    }
}




