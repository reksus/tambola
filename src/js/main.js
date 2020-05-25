const masterList = document.querySelector('.master-list')
const ticket = document.querySelector('.ticket')
const generateTicketBtn = document.querySelector('.generate-ticket-btn')
const startBtn = document.querySelector('.start-btn')
const currentNumber = document.querySelector('.current-number')
const winningComboBtns = document.querySelectorAll('.winning-combo-btn')
const prizesWrapper = document.querySelector('.prizes-wrapper')
const prizesList = prizesWrapper.querySelector('ul')
const noPrize = prizesWrapper.querySelector('.no-prize')

let n = 90
let setOfNumbers = [...Array(n).keys()].map(x => x + 1)
let setOfCalledOutNumbers = []
let setOfRemainingNumbers = [...setOfNumbers]

window.onload = createMasterList(n=90)
generateTicketBtn.addEventListener('click', () => generateTicket(3, 9))
startBtn.addEventListener('click', startGame)

function startGame() {
  callOutRandomNumber(5000)
}
function createMasterList(n) {
  for (let i = 1; i <= n; i++) {
    const box = document.createElement('div')
    box.classList.add('box')
    box.classList.add(`box${i}`)
    const boxNumber = document.createElement('span')
    boxNumber.textContent = i
    boxNumber.style.display = 'block'
    box.appendChild(boxNumber)
    masterList.appendChild(box)
  }
}
function generateTicket(rows=3, cols=9) {
  // this part should not come here
  currentNumber.style.display = 'flex'
  currentNumber.style.flexDirection = 'column'

  generateTicketBtn.disabled = true
  generateTicketBoxes(rows, cols)

  const ticketArray = [Array(cols), Array(cols), Array(cols)]
  markPositionsToInsert(ticketArray, rows, cols)
  insertRandomNumbersInTheTicket(ticketArray, rows, cols)
  const ticketBoxes = ticket.querySelectorAll('.box')

  ticketBoxes.forEach((box, index) => {
    const content = ticketArray[Math.floor((index)/cols)][(index)%9]
    box.textContent = content == "--" ? "" : content
    box.addEventListener('click', handleTicketBoxClick)
  });
  winningComboBtns.forEach(btn => {
    btn.addEventListener('click', function() {
    checkWinningCombo(this, rows, cols)
    })
    btn.style.display = 'block'
  })
  generateTicketBtn.style.display = 'none'
  startBtn.style.display = 'block'
}
function handleTicketBoxClick(e) {
  if (this.textContent) {
    toggleMarked(this)
  }
}
function toggleMarked(ticketBox) {
  if (ticketBox.classList.contains('marked')) {
    ticketBox.classList.remove('marked')
  } else {
    ticketBox.classList.add('marked')
  }
}
function callOutRandomNumber(interval=5000) {
  const number = currentNumber.querySelector('.number')
  const randomNumberCalloutInterval = setInterval(() => {
    const len = setOfRemainingNumbers.length
    const randIdx = Math.floor(Math.random() * len)
    const [calledOutNumber] = setOfRemainingNumbers.splice(randIdx, 1)
    setOfCalledOutNumbers.push(calledOutNumber)
    
    // // convert number to voice 
    speakTheNumber(calledOutNumber)

    number.textContent = calledOutNumber
    // Mark the called out nummber in the master list 
    const masterListBox = document.querySelector(`.master-list .box${calledOutNumber}`)
    if (masterListBox) {
      masterListBox.classList.add('lighten')
    }

    if (len <= 0) {
      number.textContent = '--'
      clearInterval(randomNumberCalloutInterval)
    }
  }, interval)
}
function speakTheNumber(n) {
  let utterance1, utterance2, utterance3
  if (n < 10) {
    utterance1 = new SpeechSynthesisUtterance('single number')
    utterance2 = new SpeechSynthesisUtterance(n)
    speechSynthesis.speak(utterance1)
    speechSynthesis.speak(utterance2)
  } else {
    utterance1 = new SpeechSynthesisUtterance(Math.floor(n/10))
    utterance2 = new SpeechSynthesisUtterance(n%10)
    utterance3 = new SpeechSynthesisUtterance(n)
    speechSynthesis.speak(utterance1)
    speechSynthesis.speak(utterance2)
    speechSynthesis.speak(utterance3)

  }
}
function generateTicketBoxes(rows, cols) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const box = document.createElement('div')
      box.classList.add('box')
      box.classList.add(`box${cols*i+j+1}`)
      const boxNumber = document.createElement('span')
      boxNumber.style.display = 'block'
      boxNumber.textContent = '-'
      box.appendChild(boxNumber)
      ticket.appendChild(box)
    }
  }
}
function markPositionsToInsert(ticket, rows, cols) {
  // randomly fill the first two rows
  for (let i = 0; i < rows-1; i++) {
    randomIndices = getRandomIndices([...Array(9).keys()], 5, cols)
    for (let idx of randomIndices) {
      ticket[i][idx] = 1
    }
  }
  // find empty cols in the first 2 rows of the ticket
  emptyColIndex = []
  for (let i = 0; i < cols; i++) {
    if (ticket[0][i] === void 0 && ticket[1][i] === void 0) {
      emptyColIndex.push(i)
    }
  }
  // fill up the third row so that not a single col remains empty
  for (let idx of emptyColIndex) {
    ticket[rows-1][idx] = 1
  }
  let src = [...Array(cols).keys()]
  for (let i = src.length-1; i >= 0; i--) {
    if (emptyColIndex.includes(src[i])) {
      src.splice(i, 1)
    }
  }
  randomIndices = getRandomIndices(src, 5-emptyColIndex.length, cols)
  for (let idx of randomIndices) {
    ticket[rows-1][idx] = 1
  }
}
function getRandomIndices(src, count, cols) {
  const randomIndices = []
  for (let j = 0; j < count; j++) {
    const idx = Math.floor(Math.random() * src.length)
    const randIdx = src[idx]
    src.splice(idx, 1)
    randomIndices.push(randIdx)
  }
  return randomIndices
}
function insertRandomNumbersInTheTicket(ticket, rows, cols) {
  // insert numbers at the marked positions
  for (let i = 0; i < cols; i++) {
    // count number of 1's in a column of the ticket
    let ones = 0
    for (let j = 0; j < rows; j++) {
      if (ticket[j][i] === 1) {
        ones += 1
      }
    } 
    // generate that many random numbers for the given column
    const columnList = [...Array(10).keys()].map((x) => x + 1).map(x => x + 10*i)
    const tempArr = []
    while (ones) {
      const idx = Math.floor(Math.random() * columnList.length)
      const randIdx = columnList[idx]
      const [num] = columnList.splice(idx, 1)
      tempArr.push(num)
      ones -= 1
    }
    tempArr.sort()

    // push the number into the ticked
    for (let j = 0; j < rows; j++) {
      if (ticket[j][i] === 1) {
        let x = tempArr.shift()
        ticket[j][i] = x >= 10 ? x.toString() : '0'+x
      }
      else {
        ticket[j][i] = '--'
      }
    }
  }
}
function checkWinningCombo(winningComboBox, rows, cols) {
  const checkType = winningComboBox.dataset.checkType
  switch (checkType) {
    case "ef": 
      handleCheckEarlyFive()
      break
    case "fr": 
      handleCheckRow(1, cols)
      break
      case "sr": 
      handleCheckRow(2, cols)
      break
      case "tr": 
      handleCheckRow(3, cols)
      break
    case "fh": 
      handleCheckFullHouse(rows, cols)
      break
  }
}
function winItemInList(itemType) {
  const winItems = prizesList.querySelectorAll('li')
  let wonItemInList = false
  winItems.forEach(winItem => {
    if (winItem.classList.contains(itemType)) {
      wonItemInList = true
    }
  });
  return wonItemInList
}
function handleCheckEarlyFive() {
  if (!winItemInList('ef') && checkEarlyFive()) {
    noPrize.style.display = 'none'
    const earlyFivePrize = document.createElement('li')
    earlyFivePrize.classList.add('ef')
    earlyFivePrize.textContent = "Yay! You've got Early Five."
    prizesList.appendChild(earlyFivePrize)
    console.log("early five")
  }
}
function handleCheckRow(row, cols) {
  if (checkRow(row, cols)) {
    const rowPrize = document.createElement('li')
    if (parseInt(row) === 1) {
      if (!winItemInList('fr')) {
        noPrize.style.display = 'none'
        rowPrize.classList.add('fr')
        rowPrize.textContent = "Hurray! You've got the first row."
        prizesList.appendChild(rowPrize)
      }
    }
    if (parseInt(row) === 2) {
      if (!winItemInList('sr')) {
        noPrize.style.display = 'none'
        rowPrize.classList.add('sr')
        rowPrize.textContent = "Huzza! You've got the second row."
        prizesList.appendChild(rowPrize)
      }
    }
    if (parseInt(row) === 3) {
      if (!winItemInList('tr')) {
        noPrize.style.display = 'none'
        rowPrize.classList.add('tr')
        rowPrize.textContent = "Whoopee! You've got the third row."
        prizesList.appendChild(rowPrize)
      }
    }
  }
}
function handleCheckFullHouse(row) {
  if (!winItemInList('fh') && checkFullHouse()) {
    noPrize.style.display = 'none'
    const fullHousePrize = document.createElement('li')
    fullHousePrize.classList.add('fh')
    fullHousePrize.textContent = "Yippie! You've got the full ."
    prizesList.appendChild(fullHousePrize)
    console.log("full house")
  }
} 
function checkEarlyFive() {
  const ticketBoxes = document.querySelectorAll('.ticket .box')
  let count = 0
  for (let box of ticketBoxes) {
    if (box.classList.contains('marked') && setOfCalledOutNumbers.includes(parseInt(box.textContent))) {
      count += 1
    }
  }
  return count >= 5
}
function checkRow(row, cols) {
  const ticketBoxes = ticket.querySelectorAll('.box')
  let isWinning = true
  for (let i = 0; i < cols; i++) {
    const ticketBox = ticketBoxes[cols*(row-1)+i]
    const ticketBoxNum = ticketBox.textContent
    if (!ticketBoxNum) {
      continue
    }
    if (!ticketBox.classList.contains('marked') || !setOfCalledOutNumbers.includes(parseInt(ticketBoxNum))) {
      isWinning = false
    }
  }
  return isWinning
}
function checkFullHouse(rows, cols) {
  let isFullHouse = true
  for (let i = 1; i <= rows; i++) {
    isFullHouse = isFullHouse && checkRow(i, cols)
  }
  return isFullHouse
}