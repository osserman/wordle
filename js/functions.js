
const colors = ({right: '#6aaa64', wrong: '#787c7e', somehwere: '#c9b458'});

function randomAnswer(wordSet) {return d3.shuffle(wordSet.slice())[0]}

function wordSim(guess, actual, returnDetail = 0) {
    const a1 = guess.split(''); 
    const a2 = actual.split(''); 
  
    let simCounts = {greens: 0, yellows: 0}; 
    // first assign all correct letters (in separate loop so double letters in guess don't get assigned yellow if first is in wrong position and second right position 
    a1.forEach( (d,i)=> { 
      if(d == a2[i]){ 
        simCounts.greens ++ ;
        a2[i] = a1[i] = ''
      }})
    // second loop for yellows
    a1.forEach( (d,i)=> { 
      if(a1[i] && a2.indexOf(d) != -1){ 
        simCounts.yellows ++ ;
        a2[a2.indexOf(d)] = '';
      } 
    }) 
    if (returnDetail){
      simCounts['score'] = simCounts.greens + (simCounts.yellows * 0.75)
      return simCounts 
    } else {
      return simCounts.greens + (simCounts.yellows * 0.75)
    }
  }
  
  function wordComp(guess = 'twice', actual = 'teals') {
    const a1 = guess.split(''); 
    const a2 = actual.split(''); 
  
    let letterColors = d3.range(5).map(d=> 0) ; 
    
    // first assign all correct letters (in separate loop so double letters in guess don't get assigned yellow if first is in wrong position and second right position 
    a1.forEach( (d,i)=> { 
      if(d == a2[i]){ 
        letterColors[i] = colors.right;
        a2[i] = ''
      }})
    // second loop for yellow and greys 
    a1.forEach( (d,i)=> { 
      if(letterColors[i]  == colors.right){ return} ;
      if( a2.indexOf(d) != -1){ 
        letterColors[i] = colors.somehwere;
        a2[a2.indexOf(d)] = '';
      } else {
        letterColors[i] = colors.wrong;      
      }
        }) 
    return letterColors;
  }

  function getSimWords(chosenWord, wordSet ){
    let simWords = []
      wordSet.forEach(d=> {
        if (d != chosenWord){
          let simScore = wordSim(d,chosenWord)
          simWords.push({word: d, simScore: simScore})
        }
      })
      return simWords.filter(d=> d.simScore >=3).sort((a,b)=> d3.descending(a.simScore, b.simScore));
}


function Knowledge(lettersDiscovered = [], lettersSomewhereElse = [], lettersEliminated = {}, lettersAtLeastNTimes = {}, lettersAtMostNTimes = {} ) {
    this.lettersDiscovered =  lettersDiscovered,
    this.lettersSomewhereElse = lettersSomewhereElse,
    this.lettersEliminated = lettersEliminated,
    this.lettersAtLeastNTimes = lettersAtLeastNTimes,
    this.lettersAtMostNTimes = lettersAtMostNTimes
}

function checkWordAgainstKnowledge(word, knowledge, qaMode = false){
let wordArray = word.split('')
if (qaMode) {
    console.log(
    'discovered letter out of place: ', 
        d3.max(knowledge.lettersDiscovered.map( d=> d.letter != wordArray[d.position])),
    'letter not in _ position is in that position, or missing', 
        d3.max(knowledge.lettersSomewhereElse.map( d=> d.letter == wordArray[d.notPosition] || wordArray.indexOf(d.letter) == -1)), 
    'word has eliminated letter', 
        d3.max(wordArray.map( d=> knowledge.lettersEliminated[d])),
    'letter counts mismatch', wordArray.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()), d3.max(Array.from(wordArray.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()))
            .map(d => d[1] < knowledge.lettersAtLeastNTimes[d[0]] || d[1] > knowledge.lettersAtMostNTimes[d[0]]))
    )
}
return !(
    d3.max(knowledge.lettersDiscovered.map( d=> d.letter != wordArray[d.position])) // discovered letter not in right position 
    || d3.max(knowledge.lettersSomewhereElse.map( d=> d.letter == wordArray[d.notPosition] || wordArray.indexOf(d.letter) == -1)) // letter not in _ position is in that position, or missing altogether
    || d3.max(wordArray.map( d=> knowledge.lettersEliminated[d])) // word has elimatited letter
    || d3.max(
        Array.from(wordArray.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map()))
            .map(d => d[1] < knowledge.lettersAtLeastNTimes[d[0]] || d[1] > knowledge.lettersAtMostNTimes[d[0]])
        )
    )
}

function learnFromGuess(guess, actual, knowledge) {                   
const actualWordArray = actual.split('')
guess.split('').forEach((l,i) => {
    if(l == actualWordArray[i]){    // push discovered letter with position
        knowledge.lettersDiscovered.push({letter: l, position: i})
    } else if(actualWordArray.indexOf(l) != -1) {// when right letters in wrong spot push lettersSomewhereElse 
        knowledge.lettersSomewhereElse.push({letter: l, notPosition: i})
    } else { // when letter not in word push to elimated
        knowledge.lettersEliminated[l] = true;
    }
    })

const guessLetterCounts = guess.split('').reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
const actualLetterCounts = actual.split('').reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
guessLetterCounts.forEach( (count, letter)=> {
    if(count > actualLetterCounts.get(letter)){
    knowledge.lettersAtMostNTimes[letter] = actualLetterCounts.get(letter);
    } else if(count <= actualLetterCounts.get(letter)){
    knowledge.lettersAtLeastNTimes[letter] = count; 
    }
})

return knowledge
}

function filterWords (wordList, knowledge){
return wordList.filter((word) => checkWordAgainstKnowledge(word, knowledge) )
}

  // this will currently only work with wordSetStats already loaded. 
function playFullGame(
    guessStyle = 'random',
    actualWordFunction = randomAnswer(), 
    wordsLeft = wordSetStats.common.wordsByLetterPositionFrequency.map(d=> d.word), // using this instead of "wordSets.get('common').words" so that I can easily grab most common word.  
    knowledge = new Knowledge 
    ) { 
    let actualWord = actualWordFunction;
    console.log('actualWord', actualWord);
    let wordsLeftByRound = [wordsLeft.length];
    let guesses = [];
    let wonGame = 0;
    let guessesToWinGame = null;
    // console.log(wordsLeftByRound, knowledge)
    // slight bugs when two letters in word -- that go in one place in word, but may be just a problem if we know there are two of a word, but don't know the second spot, algorithm won't properly elimate words with just one of those letters. 
    let round = 0;
    function playGame(){
      let guess;
      if (guessStyle == 'letterPositionFreq'){ 
         guess = wordsLeft[0]
      } else {
         guess = wordsLeft[Math.floor(Math.random()* wordsLeft.length)]
      }
      guesses.push(guess);
      if (guess == actualWord){ 
        wonGame = 1;
        guessesToWinGame = (round + 1);
        return 
      } 
      knowledge = learnFromGuess(guess, actualWord, knowledge)
      wordsLeft = filterWords(wordsLeft, knowledge)
      wordsLeftByRound.push(wordsLeft.length)
    
      if (round < 5 ){
        round++ ;
        playGame();
        }
    }
  
    playGame();
  
    return {actualWord: actualWord, wonGame: wonGame, guessesToWinGame: guessesToWinGame, guesses: guesses, knoweldge: knowledge, 
          wordsLeftByRound:wordsLeftByRound, wordsLeft: wordsLeft}
  }

  function resultsTableRow(data) { 
    return data.map(d=> '<td>' + d + '</td>').join('')
}

export {colors, 
    randomAnswer, 
    Knowledge, 
    learnFromGuess, 
    checkWordAgainstKnowledge, 
    filterWords, 
    wordSim, 
    wordComp, 
    getSimWords, 
    playFullGame,
    resultsTableRow};
