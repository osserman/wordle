//import {colors, randomAnswer, wordSim, wordComp, playFullGame} from './functions.js';
import {colors, randomAnswer, Knowledge, learnFromGuess, checkWordAgainstKnowledge, filterWords, wordComp} from './functions.js'
const wordsWrapper = d3.select('#words-wrapper')

const actualWord = d3.select('#actual-word')
    .style('text-align','center')

const nextWord = d3.select('#reveal-guess')
const resetGame = d3.select('#reset-game')

const words = d3.select('#words')
    .selectAll('div')
    .data(d3.range(6))  
    .join('div').attr('id', (d,i)=> 'guess-' + i)
    
const wordsLeftCount = d3.select('#words-left')
const wordsElimCount = d3.select('#words-eliminated')

let actualAnswer, curGuess; 
let circleWidth = d3.select('.word-circle#background').node().clientWidth;
d3.selectAll('.word-circle').style('min-height',circleWidth + 'px');

d3.json("./data/wordSets.json").then((data) => {

    let wordSets = new Map(data);

    function game(){ 
        let wordsLeft = wordSets.get("common").words.slice();
        let totalWords = wordsLeft.length; 

        let gameKnowledge = new Knowledge; 
        let guessNumber = 1;

        let circleScale = d3.scaleSqrt()
            .domain([0, totalWords])
            .range([0, 1]);

        wordsLeftCount
            .text(totalWords + ' Possible Words')
            .style('bottom','5px')
        wordsElimCount.text('0 Words Eliminated').style('opacity',0)

        d3.select('#foreground').transition().style('transform','scale(1)')
        words.each(function (d,i) {
            d3.select(this).selectAll('span')
            .data(d3.range(5).map(()=> ''))
            .join('span')
            .attr('class','letter')
            .text(d=>d )
            .style('color', (d,i)=> '#FFFFFF')
            .style('background-color', (d,i)=> '#FFFFFFAA')
            .style('border-color', '#CCC');
            })
    // disable first guess click until actual answer is set. 
    // when actual answer button submit -- 
        d3.select('#submit-actual').on('click', function() {
            let answerSubmission = d3.select('#actual').property('value').toLowerCase()
            if(answerSubmission.split('').length == 5 ) {// TO DO: add check if all alpha 
                actualAnswer = answerSubmission ; 
                actualWord.html("Actual Word: <b>" + actualAnswer.toUpperCase() + "</b>")
                // TO DO:  enable click for first guess. 
            }
        })  
        d3.select('#submit-guess').on('click', function() {
            
            let curGuessSubmission = d3.select('#guess').property('value').toLowerCase()
            console.log(d3.select('#guess').property('value'))
            if(curGuessSubmission.split('').length == 5 ) {// TO DO: add check if all alpha 
                curGuess = curGuessSubmission ; 
                gameKnowledge = learnFromGuess(curGuess, actualAnswer, gameKnowledge);
                wordsLeft = filterWords(wordsLeft, gameKnowledge);
                
                console.log('curGuess, actualWord',curGuess, actualAnswer)

                let col = wordComp(curGuess, actualAnswer);
                console.log('col',col)
                d3.select('#guess-' + (guessNumber-1)).selectAll('span').data(curGuess.split('')).join('span')
                    .text(d=>d).style('background-color',(d,i) => col[i] ).style('border-color', (d,i) => col[i] )
        
                guessNumber ++; 
                d3.select('#guess-input-label').text('Guess #' + guessNumber + ':');
                d3.select('#guess').property('value','');

                let scaleCircleBy = circleScale(wordsLeft.length)
                d3.select('#foreground')
                    .transition()
                    .style('transform','scale('+ scaleCircleBy +')')
                
                let textBottomOffset =  ((1-scaleCircleBy) * d3.select('#chart-wrapper').node().offsetWidth/2 - 60) - 20;
                wordsLeftCount
                    .text(wordsLeft.length + ' Possible Word' + (wordsLeft.length>1 ? 's' :''))
                    .transition()
                    .style('bottom',  d3.max([25,textBottomOffset]) + 'px') // make sure it doesn't go negative
                    
                wordsElimCount.text((totalWords - (wordsLeft.length)) + ' Words Eliminated')
                    .style('opacity', (guess==1 ? 0 : 1))

            // update number of words left and sizes. 
            // if less than 100, show in scroll container below

            // check if guess = answer (in which case set a 'new game button' which clear boards and resets guess to 0)
                // else change label to iterate round. 

            }
        })

        //d3.select('#display').text(guess.toUpperCase() + ' (' + wordsLeft.length + ' words left)')
    // show in display. 


    }
    game();

//    let justStarting = 1;
/*    function game() { 
        let wordSet = wordSets.get('common').words
//    console.log(wordSets.get('common').words)
        let gameResults = playFullGame('random',randomAnswer(wordSet),wordSet);
        
        let circleScale = d3.scaleSqrt()
            .domain([0, wordSet.length])
            .range([0, 1]);

        actualWord.html("Actual Word: <b>" + gameResults.actualWord.toUpperCase() + "</b>")
        
        if (justStarting == 1){
            console.log('justStarting')
            justStarting = 0;
        } else {
            console.log('startedBefore')

            nextWord.text('GET STARTED'); 
        }

        d3.select('#foreground').transition().style('transform','scale(1)')
        words.each(function (d,i) {
            d3.select(this).selectAll('span')
            .data(gameResults.guesses[i] != undefined ? gameResults.guesses[i].split('') : gameResults.actualWord.split(''))//d3.range(5).map(()=> ''))
            .join('span')
            .attr('class','letter')
            .text(d=>d)
            .style('color', (d,i)=> '#FFFFFF00')
            .style('background-color', (d,i)=> '#FFFFFFAA')
            .style('border-color', '#CCC');
            })

        //wordsEliminated.attr('r', circleScale(gameResults.wordsLeftByRound[0]))
        //wordsLeft.attr('r', circleScale(gameResults.wordsLeftByRound[0]))
        wordsLeftCount
            .text(gameResults.wordsLeftByRound[0] + ' Possible Words')
            .style('bottom','5px')
        wordsElimCount.text('0 Words Eliminated').style('opacity',0)

        
        let guessCount = 0; 
        nextWord.on('click', () => {
            const col = wordComp(gameResults.guesses[guessCount], gameResults.actualWord)
                console.log('guessCount5 or', guessCount, gameResults.guesses[guessCount] == gameResults.actualWord )

                if(guessCount==5 || gameResults.guesses[guessCount] == gameResults.actualWord) {
                    console.log("changing to replay")
                nextWord.text('REPLAY'); 
                } else {
                    nextWord.text('SHOW NEXT GUESS'); 
                }
                if(guessCount == 6 || gameResults.guesses[guessCount-1] == gameResults.actualWord){
                    console.log("resetting")
                guessCount=-1; 
                wordsWrapper.selectAll('span')
                    .style('background-color', '#FFFFFFAA')
                    .style('color', (d,i)=> '#FFFFFF00')
                    .style('border-color', '#CCC');            
                } 
                if(guessCount!=-1){
                wordsWrapper.selectAll('#guess-' + guessCount + ' span').style('color', (d,i)=> '#FFFFFF')
            .transition().style('background-color', (d,i) => col[i] ).style('border-color', (d,i) => col[i] )
            nextWord
                }
                guessCount++;
                 
                let wordsLeftNow = gameResults.wordsLeftByRound[guessCount] || 1
                let scaleCircleBy = circleScale(wordsLeftNow)
                d3.select('#foreground')
                    .transition()
                    .style('transform','scale('+ scaleCircleBy +')')
                
                let textBottomOffset =  ((1-scaleCircleBy) * d3.select('#chart-wrapper').node().offsetWidth/2 - 60) - 20;
                wordsLeftCount
                    .text(wordsLeftNow + ' Possible Word' + (wordsLeftNow>1 ? 's' :''))
                    .transition()
                    .style('bottom',  d3.max([25,textBottomOffset]) + 'px') // make sure it doesn't go negative
                    
        
                wordsElimCount.text((gameResults.wordsLeftByRound[0] - (wordsLeftNow)) + ' Words Eliminated')
                    .style('opacity', (guessCount==0 ? 0 : 1))
            
            })
        }

    game()
    resetGame.on('click', game)*/
})