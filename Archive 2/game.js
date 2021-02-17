// Global variables
var deck
var playerTotal
var dealerTotal
var dealerOne
var dealerTwo
var username
var playerAces = 0
var dealerAces = 0
var numGames = 0
var numWins = 0
var timer = milli => new Promise(x => setTimeout(x, milli))

/*
Section 1: GUI

Contains:
function setName : Retrieve and store user input (name).
function setResult : Display outcome message and buttons to exit or replay.
function evaluateResult: Determine winner and call setResult.
function updateTable : Create result table with session statistics.
function addCard : Add image of card to playing area.
*/

function setName() {
    username = document.getElementById("userInput").value;
    if (username === '') {
      username = 'Anonymous Hero'
    }
}

function setResult(str) {
  updateTable()
  document.getElementById("controls").innerHTML = `<strong>${str}</strong> <br><br>
    <button type="button" class="button" onclick="newGame()">Play again</button>
    <button type="button" class="button" onClick="window.location.reload();">Exit</button>`
}

function evaluateResult() {
  if(dealerTotal <= 21 && dealerTotal > playerTotal) {
    setResult("The dealer wins!")
  } else if (dealerTotal <= 21 && dealerTotal === playerTotal) {
    setResult("It's a push. Nobody wins!")
  } else if (dealerTotal <= 21 && dealerTotal < playerTotal) {
    numWins++
    setResult("You win!")
  } else {
    numWins++
    setResult("The dealer goes bust! You win!")
  }
  updateTable()
}

function updateTable() {
  let winPercentage = Math.round((numWins/numGames) * 100);
  if (isNaN(winPercentage)) {
    winPercentage = ''
  } else {
    winPercentage += '%'
  }
  document.getElementById("tablesec").innerHTML = `
    <h3>Session Results</h3>
    <table class="center">
    <tr>
      <th>Games Played</th>
      <th>Games Won</th>
      <th>Win Percentage</th>
    </tr>
    <tr>
      <th>${numGames}</th>
      <th>${numWins}</th>
      <th>${winPercentage}</th>
    </tr>
</table>`
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

/*
Section 2: Gameplay

Contains:
function resetGlobal : Reset global variabes for new game.
class Deck: simulating card deck of 52 cards with methods to shuffle and draw.
function cardToNumber : Helper function to determine numeric value of card.
function newGame : Reset UI and global vars and initiate new game.
function hit : Draw a new card for player.
function stick : Simulates the dealer taking their turn.
*/

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

async function newGame() {
  updateTable()
  resetGlobal()
  numGames++

  document.getElementById("controls").innerHTML = ''

  // Reset setup and result areas
  var elem = document.getElementById("setup");
  if (elem) {
    elem.remove();
  }
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

  // Add dealer card images
  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer</strong><br><br></p>
    <p id="dealerTotal"><strong>Dealer's</strong> Total : ${cardToNumber(dealerOne)}</p>`;
  addCard(dealerOne, "dealer")
  addCard("red_back", "dealer")

  // Initialise UI for playing mode and add player cards
  document.getElementById("player").innerHTML = `
    <p id="playerCards"> <strong>${username}</strong><br><br></p>
    <p id="total"> <strong>${username}'s</strong> Total : ${0}</p>`

  addCard("red_back", "player")
  addCard("red_back", "player")

  await timer(800)

  document.getElementById("player").innerHTML = `
    <p id="playerCards"> <strong>${username}</strong><br><br></p>
    <p id="total"> <strong>${username}'s</strong> Total : ${cardToNumber(cardOne)}</p>`
  addCard(cardOne, "player")
  addCard("red_back", "player")

  await timer(800)
  document.getElementById("player").innerHTML = `
    <p id="playerCards"> <strong>${username}</strong><br><br></p>
    <p id="total"> <strong>${username}'s</strong> Total : ${playerTotal}</p>`
  addCard(cardOne, "player")
  addCard(cardTwo, "player")

  // Add controls
  document.getElementById("controls").innerHTML = `
      <button type="button" class="button" onclick="hit()">Hit!</button>
      <button type="button" class="button" onclick="stick()">Stick!</button>`;

  // Check for immediate blackjack
  if (playerTotal === 21) {
    document.getElementById("controls").innerHTML = ''
    document.getElementById("total").innerHTML = `
    <p id="total"> <strong>${username}</strong> got a Blackjack!</p>`
    await timer(800)
    document.getElementById("dealer").innerHTML = `
      <p id="dealerCards"><strong>Dealer</strong><br><br></p>`;
    addCard(dealerOne, "dealer")
    addCard(dealerTwo, "dealer")
    if (dealerTotal === 21) {
      setResult("It's a push! Nobody wins!")
    } else {
      numWins++
      setResult("The dealer doesn't! You win!")
    }
    return
  }
}

async function hit() {
  // Draw card from deck, add image
  let card = deck.drawCard("player")
  addCard(card, "player")
  playerTotal += cardToNumber(card)

  // Check loss condition
  if(playerTotal > 21 && playerAces === 0) {
    setResult("You went bust! The dealer wins!")
  } else if (playerTotal > 21 && playerAces > 0) {
    playerTotal -= 10 // turn one ace into a 1 value card
    playerAces -= 1 // update number of aces counting as 11
  }

  // Update running total
  document.getElementById("total").innerHTML = `<strong>${username}'s</strong>
    Total : ${playerTotal}`
}

async function stick() {
  // Remove player controls
  document.getElementById("controls").innerHTML = '<br>'

  // Initialise dealer's running total and update card images
  document.getElementById("dealer").innerHTML = `
    <p id="dealerCards"><strong>Dealer</strong><br><br></p>
    <p id="dealerTotal"><strong>Dealer's</strong> Total : ${dealerTotal}</p>
  `;
  addCard(dealerOne, "dealer")
  addCard(dealerTwo, "dealer")

  // Reveal cards until dealer reaches a 17 (with hitting on soft 17)
  while (dealerTotal < 17 && dealerTotal <= playerTotal) {
    await timer(800)
    let newCard = deck.drawCard("dealer");
    addCard(newCard, "dealer");
    dealerTotal += cardToNumber(newCard)
    if (dealerTotal === 17 && dealerAces > 0) {
      dealerTotal -= 10;
      dealerAces -= 1;
    } else if (dealerTotal > 21 && dealerAces > 0) {
      dealerTotal -= 10;
      dealerAces -= 1;
    }
    document.getElementById("dealerTotal").innerHTML = `
      <strong>Dealer's</strong> Total : ${dealerTotal}`
  }

  // Display result and option to play again
  evaluateResult()
}
