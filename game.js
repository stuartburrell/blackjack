// Global variables
var deck
var playerTotal
var dealerTotal
var dealerOne
var dealerTwo
var username

class Deck {
  constructor() {
    const suits = ['S', 'H', 'C', 'D']
    const val = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    this.cards = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 13; j++) {
        this.cards.push(val[j] + suits[i])
      }
    }
  }

  drawCard() {
    return this.cards.pop()
  }

  shuffle() {
    let shuffledCards = []
    for (let i = 0; i < 52; i++) {
      let index = Math.floor(Math.random() * (52 - i))
      shuffledCards.push(this.cards[index])
      this.cards[index] = this.cards[52 - i - 1]
      this.cards.pop()
    }
    this.cards = shuffledCards
  }
}

function setName() {
    username = document.getElementById("userInput").value;
    if (username === '') {
      username = 'Anonymous Hero'
    }
}

function cardToNumber(card) {
  if (card.slice(0, 2) === '10') {
    return 10
  } else if (['K', 'Q', 'J'].includes(card[0])) {
    return 10
  } else if (card[0] === 'A') {
    if (playerTotal + 11 > 21) {
      return 1
    } else {
      return 11
    }
  } else {
    return parseInt(card[0])
  }
}

function addCard(card, player) {
  var img = document.createElement("img");
  img.src = "./cards/" + card + ".png";
  img.setAttribute("style", "width:80px")
  if (player === "player"){
    var src = document.getElementById("playerCards");
  } else if (player === "dealer") {
    var src = document.getElementById("dealerCards");
  }
  src.appendChild(img);
}

function newGame() {
  // Reset let's play bar
  document.getElementById("setup").innerHTML = ''
  document.getElementById("result").innerHTML = ''

  // Initialise deck and shuffle
  deck = new Deck()
  deck.shuffle()

  // Draw starting cards and update running total
  let cardOne = deck.drawCard()
  let cardTwo = deck.drawCard()
  dealerOne = deck.drawCard()
  dealerTwo = deck.drawCard()
  playerTotal = cardToNumber(cardOne) + cardToNumber(cardTwo)

  // Initialise UI for playing mode
  document.getElementById("player").innerHTML = `
    <p id="playerCards"> <strong>${username}'s</strong> cards: <br><br></p>
    <p id="total"> <strong>${username}'s</strong> total = ${playerTotal}</p>
    <div id="controls">
      <button type="button" onclick="hit()">Hit!</button>
      <button type="button" onclick="stick()">Stick!</button>
    </div>`;

  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer's</strong> cards: <br><br></p>
    <img src="./cards/red_back.png" style="width:80px">
    <img src="./cards/red_back.png" style="width:80px">`;

  // Add player card images
  addCard(cardOne, "player")
  addCard(cardTwo, "player")
}

function hit() {
  // Draw card from deck, add image and update running total
  card = deck.drawCard()
  addCard(card, "player")
  playerTotal += cardToNumber(card)
  document.getElementById("total").innerHTML = `<strong>${username}'s</strong>
    total = ${playerTotal}`

  // Check loss condition
  if(playerTotal > 21) {
    document.getElementById("dealer").innerHTML = ''
    document.getElementById("controls").innerHTML = ''
    document.getElementById("result").innerHTML = `You went bust! The dealer wins! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  }
}

async function stick() {
  // Remove player controls
  document.getElementById("controls").innerHTML = '<br>'

  // Initialise dealer's running total and update card images
  dealerTotal = cardToNumber(dealerOne) + cardToNumber(dealerTwo)
  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer's</strong> cards: <br><br></p>
    <p id="dealerTotal"><strong>Dealer's</strong> total = ${dealerTotal}</p>
  `;
  addCard(dealerOne, "dealer")
  addCard(dealerTwo, "dealer")

  // Reveal cards until dealer wins or goes bust
  const timer = milli => new Promise(x => setTimeout(x, milli))
  while (dealerTotal < playerTotal) {
    await timer(800)
    newCard = deck.drawCard()
    addCard(newCard, "dealer")
    dealerTotal += cardToNumber(newCard)
    document.getElementById("dealerTotal").innerHTML = `
      <strong>Dealer's</strong> total = ${dealerTotal}`
  }

  // Display result and option to play again
  if(dealerTotal <= 21) {
    document.getElementById("result").innerHTML = `The dealer wins! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  } else {
    document.getElementById("result").innerHTML = `The dealer goes bust! You win! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  }
}
