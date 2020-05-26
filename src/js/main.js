const masterList = document.querySelector('.master-list')
const ticketWrapper = document.querySelector('.ticket-wrapper')
const ticket = document.querySelector('.ticket')
const generateTicketBtn = document.querySelector('.generate-ticket-btn')
const startBtn = document.querySelector('.start-btn')
const currentNumber = document.querySelector('.current-number')
const winningCombo = document.querySelector('.winning-combo')
const winningComboBtns = winningCombo.querySelectorAll('.winning-combo-btn')
const prizesWrapper = document.querySelector('.prizes-wrapper')
const prizesList = prizesWrapper.querySelector('ul')
const noPrize = prizesWrapper.querySelector('.no-prize')

let tambolaNumbersCount = 90
let ticketRows = 3
let ticketCols = 9
let callingOutIntervalTime = 5000
let setOfNumbers = [...Array(tambolaNumbersCount).keys()].map(x => x + 1)
let setOfCalledOutNumbers = []
let setOfRemainingNumbers = [...setOfNumbers]

let randomNumberCalloutInterval

window.onload = createMasterList(tambolaNumbersCount)
generateTicketBtn.addEventListener('click', managePlayingArea)
startBtn.addEventListener('click', startGame)

function startGame() {
  callOutRandomNumber(callingOutIntervalTime) 
}
function createMasterList(n) {
  for (let i = 1; i <= n; i++) {
    const box = document.createElement('div')
    box.classList.add('box')
    box.classList.add(`box${i}`)
    const boxNumber = document.createElement('span')
    boxNumber.textContent = i
    box.appendChild(boxNumber)
    masterList.appendChild(box)
  }
}
function managePlayingArea() {
  generateTicketBoxElements(ticketRows, ticketCols)
  const ticketArray = generateTicketArray(ticketRows, ticketCols)
  const ticketBoxes = ticket.querySelectorAll('.box')
  ticketBoxes.forEach((box, index) => {
    const content = ticketArray[Math.floor((index)/ticketCols)][(index)%ticketCols]
    box.textContent = content == "--" ? "" : content
    box.addEventListener('click', handleTicketBoxClick)
  })
  winningComboBtns.forEach(btn => btn.addEventListener('click', checkPattern))
  ticketWrapper.style.display = 'block'
  generateTicketBtn.style.display = 'none'
  startBtn.style.display = 'block'
  winningCombo.style.display = 'flex'
}
function generateTicketArray(rows, cols) {
  const ticketArray = []
  for (let i = 0; i < rows; i++) {
    ticketArray.push(Array(cols))
  }
  markPositionsToInsert(ticketArray, rows, cols)
  insertRandomNumbersInTheTicket(ticketArray, rows, cols)
  return ticketArray
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
  randomNumberCalloutInterval = setInterval(() => {
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
function generateTicketBoxElements(rows, cols) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const box = document.createElement('div')
      box.classList.add('box')
      box.classList.add(`box${cols*i+j+1}`)
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
        ticket[j][i] = x
      } else {
        ticket[j][i] = ""
      }
    }
  }
}
function checkPattern() {
  const checkType = this.dataset.checkType
  let isPattern = false
  let message
  switch (checkType) {
    case "ef": 
      isPattern = checkEarlyFive()
      message = "Yay! You've got Early Five."
      break
    case "fr": 
      isPattern = checkRow(1, ticketCols)
      message = "Hurray! You've got the first row."
      break
    case "sr": 
      isPattern = checkRow(2, ticketCols)
      message = "Huzza! You've got the second row."
      break
    case "tr": 
      isPattern = checkRow(3, ticketCols)
      message = "Whoopee! You've got the third row."
      break
    case "fh": 
      isPattern = checkFullHouse(ticketRows, ticketCols)
      message = "Yippie! You've got the full ."
      break
    case "be": 
      isPattern = checkBullsEye(ticketRows, ticketCols)
      message = "Hip-Hip! You've hit the bull's eye"
      break
    case "cr": 
      isPattern = checkCorners(ticketRows, ticketCols)
      message = "Rah Rah! You've got all the corners"
      break
  }
  if (!winItemInList(checkType) && isPattern) {
    noPrize.style.display = 'none'
    const prize = document.createElement('li')
    prize.classList.add(checkType)
    prize.textContent = message
    prizesList.appendChild(prize)
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
function checkBullsEye(rows, cols) {
  const ticketBoxes = ticket.querySelectorAll('.box')
  let count = 0
  for (let i = 0; i < cols; i++) {
    const box = ticketBoxes[cols+i]
    const content = box.textContent
    if (content) {
      count++
    }
    if (count == 3) {
      if (box.classList.contains('marked') && setOfCalledOutNumbers.includes(parseInt(content))) {
        return true
      }
      else {
        return false
      }
    }
  }
}
function checkCorners(rows, cols) {
  const cornerBoxes = []
  const ticketBoxes = ticket.querySelectorAll('.box')
  let count = 0
  let prevCount = 0
  for (let i = 0; i < rows*cols; i++) {
    const box = ticketBoxes[i]
    if (!box.textContent == "") {
      count++
    }
    if (count === 1 && count !== prevCount ) cornerBoxes.push(box)
    if (count === 5 && count !== prevCount) cornerBoxes.push(box)
    if (count === 11 && count !== prevCount) cornerBoxes.push(box)
    if (count === 15 && count !== prevCount) cornerBoxes.push(box)
    prevCount = count
  }
  areCorners = true
  cornerBoxes.forEach(box => {
    if (!box.classList.contains('marked') || !setOfCalledOutNumbers.includes(parseInt(box.textContent))) {
      areCorners = false
    }
  })
  return areCorners
}