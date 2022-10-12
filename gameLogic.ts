// the class to create new monsters
class Player {
    private name: string;
    private hp: number;
    constructor(name: string) {
        this.name = name;
        this.hp = 2000
        console.log(`${this.name} just joined the game with ${this.hp} HP.`)
    }
    getPlayerName(): string {
        return this.name
    }
    getHP(): number {
        return this.hp;
    }

    getHurt(opponent: Player, damage: number){
        this.hp -= damage

        if (this.hp > 0) {
            console.log(`${this.name} just get attacked! Now the player has ${this.hp} HP left!`)
        } else { 
            console.log(`${this.name} just lost the game! ${opponent.name} wins!`)
        }
    }
}

class MonsterCard {
    private name: string;
    private attackPoint: number;

    constructor(nameInput: string, atkPtInput: number) {
        this.name = nameInput;
        this.attackPoint = atkPtInput;
    }
    getName(): string {
        return this.name
    }
    getAtkPt(): number {
        return this.attackPoint
    }
    destroyed(opponentMonster: MonsterCard){
        console.log(`${this.name} just destroyed ${opponentMonster.name}!`)
    }
}

// card sets
const blueEyesDragon = new MonsterCard("BlueEyesDragon", 3000)
const darkMagician = new MonsterCard("DarkMagician", 2500)

const battle = async(playerInput1: Player, monsterInput1: MonsterCard, playerInput2: Player, monsterInput2: MonsterCard) => {
    await console.log(`${playerInput1.getPlayerName()} just summoned ${monsterInput1.getName()}! It has ${monsterInput1.getAtkPt()} attack points!`)
    await console.log(`${playerInput2.getPlayerName()} just summoned${monsterInput2.getName()}! It has ${monsterInput2.getAtkPt()} attack points!`)
    await console.log(`A battle between ${monsterInput1.getName()} and ${monsterInput2.getName()} started!`)
    await console.log(`${playerInput1.getPlayerName()} just used ${monsterInput1.getName()} to attack ${playerInput2.getPlayerName()}'s ${monsterInput2.getName()}!`)

    if (monsterInput1.getAtkPt() > monsterInput2.getAtkPt()) {
        monsterInput1.destroyed(monsterInput2)
        if (playerInput2.getHP() > 0) {
            playerInput2.getHurt(playerInput1,(monsterInput1.getAtkPt())-(monsterInput2.getAtkPt()))
        } 
    } else {
        monsterInput2.destroyed(monsterInput1)
        if (playerInput1.getHP() > 0) {
            playerInput1.getHurt(playerInput2,(monsterInput2.getAtkPt())-(monsterInput1.getAtkPt()))
        } 
    }


}

// card copies
let card1 = blueEyesDragon
let card2 = darkMagician

// new players
let player1 = new Player("Tom")
let player2 = new Player("Jerry")

// tossing coin to decide who goes first
const tossingAcoin = (coinUser1: Player, coinUser2: Player) => {
    console.log(`Game started!`)
    console.log(`Game Host just tossed a coin!`)
    // temp unfair random 
    if (Math.random() > 0.5) {
        console.log(`It's a head, ${coinUser1.getPlayerName()} goes first.`)
        // start battle
        battle(player1, card1, player2, card2)
    } else {
        console.log(`It's a tail, ${coinUser2.getPlayerName()} goes first.`)
        // start battle
        battle(player2, card2, player1, card1)
    }
}

//start the game by tossing a coin
tossingAcoin(player1, player2)


