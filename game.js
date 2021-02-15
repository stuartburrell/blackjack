// Global variables
var deck
var playerTotal
var dealerTotal
var dealerOne
var dealerTwo
var username
var playerAces = 0
var dealerAces = 0

function resetGlobal() {
  playerTotal = 0
  dealerTotal = 0
  playerAces = 0
  dealerAces = 0
}

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

  drawCard(user) {
    let newCard = this.cards.pop()
    if (user === "player" && newCard[0] === "A") {
      playerAces += 1
    } else if (user === "dealer" && newCard[0] === 'A') {
      dealerAces += 1
    }
    return newCard
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
    return 11
  } else {
    return parseInt(card[0])
  }
}

function addCard(card, user) {
  var img = document.createElement("img");
  img.src = "./cards/" + card + ".png";
  img.setAttribute("style", "width:80px")
  if (user === "player") {
    var src = document.getElementById("playerCards");
  } else if (user === "dealer") {
    var src = document.getElementById("dealerCards");
  }
  src.appendChild(img);
}

function newGame() {
  resetGlobal()
  // Reset setup and result areas
  document.getElementById("setup").innerHTML = ''
  document.getElementById("result").innerHTML = ''

  // Initialise deck and shuffle
  deck = new Deck()
  deck.shuffle()

  // Draw starting cards and update running total
  let cardOne = deck.drawCard("player")
  let cardTwo = deck.drawCard("player")
  dealerOne = deck.drawCard("dealer")
  dealerTwo = deck.drawCard("dealer")

  // Compute player and dealer totals and deal with edge case AA
  playerTotal = cardToNumber(cardOne) + cardToNumber(cardTwo)
  if (playerTotal === 22){
    playerTotal = 12
    playerAces = 1
  }

  dealerTotal = cardToNumber(dealerOne) + cardToNumber(dealerTwo)
  if (dealerTotal === 22){
    dealerTotal = 12
    dealerAces = 1
  }

  // Initialise UI for playing mode and add player cards
  document.getElementById("player").innerHTML = `
    <p id="playerCards"> <strong>${username}'s</strong> cards: <br><br></p>
    <p id="total"> <strong>${username}'s</strong> total = ${playerTotal}</p>
    <div id="controls">
      <button type="button" onclick="hit()">Hit!</button>
      <button type="button" onclick="stick()">Stick!</button>
    </div>`;
  addCard(cardOne, "player")
  addCard(cardTwo, "player")

  // Add dealer card images
  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer's</strong> cards: <br><br></p>`;
  addCard(dealerOne, "dealer")
  addCard("red_back", "dealer")

  // Check for immediate blackjack
  if (playerTotal === 21) {
    document.getElementById("controls").innerHTML = ''
    document.getElementById("total").innerHTML = `
    <p id="total"> <strong>${username}</strong> got a Blackjack!</p>`
    document.getElementById("dealerCards").innerHTML = ''
    addCard(dealerOne, "dealer")
    addCard(dealerTwo, "dealer")
    if (dealerTotal === 21) {
      document.getElementById("result").innerHTML = `It's a push! Nobody wins! <br><br>
        <button type="button" onclick="newGame()">Play again</button>`
    } else {
      document.getElementById("result").innerHTML = `The dealer didn't get blackjack! You win! <br><br>
        <button type="button" onclick="newGame()">Play again</button>`
    }
    return
  }
}

function hit() {
  // Draw card from deck, add image
  let card = deck.drawCard("player")
  addCard(card, "player")
  playerTotal += cardToNumber(card)

  // Check loss condition
  if(playerTotal > 21 && playerAces === 0) {
    document.getElementById("dealer").innerHTML = ''
    document.getElementById("controls").innerHTML = ''
    document.getElementById("result").innerHTML = `You went bust! The dealer wins! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  } else if (playerTotal > 21 && playerAces > 0) {
    playerTotal -= 10 // turn one ace into a 1 value card
    playerAces -= 1 // update number of aces counting as 11
  }

  // Update running total
  document.getElementById("total").innerHTML = `<strong>${username}'s</strong>
    total = ${playerTotal}`
}

async function stick() {
  // Remove player controls
  document.getElementById("controls").innerHTML = '<br>'

  // Initialise dealer's running total and update card images
  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer's</strong> cards: <br><br></p>
    <p id="dealerTotal"><strong>Dealer's</strong> total = ${dealerTotal}</p>
  `;
  addCard(dealerOne, "dealer")
  addCard(dealerTwo, "dealer")

  // Reveal cards until dealer reaches a 17 (with hitting on soft 17)
  const timer = milli => new Promise(x => setTimeout(x, milli))
  while (dealerTotal < 17 && dealerTotal < playerTotal) {
    await timer(800)
    let newCard = deck.drawCard("dealer");
    addCard(newCard, "dealer");
    dealerTotal += cardToNumber(newCard)
    if (dealerTotal === 17 && dealerAces > 0) {
      dealerTotal -= 10;
      dealerAces -= 1;
    }
    document.getElementById("dealerTotal").innerHTML = `
      <strong>Dealer's</strong> total = ${dealerTotal}`
  }

  // Display result and option to play again
  if(dealerTotal <= 21 && dealerTotal > playerTotal) {
    document.getElementById("result").innerHTML = `The dealer wins! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  } else if (dealerTotal <= 21 && dealerTotal === playerTotal) {
    document.getElementById("result").innerHTML = `It's a push. Nobody wins! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  } else if (dealerTotal <= 21 && dealerTotal < playerTotal) {
    document.getElementById("result").innerHTML = `You win! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  } else {
    document.getElementById("result").innerHTML = `The dealer goes bust! You win! <br><br>
      <button type="button" onclick="newGame()">Play again</button>`
  }
}
