import {colors, randomAnswer, wordSim, wordComp, playFullGame} from './functions.js';

const chartWrapper = d3.select('#chart-wrapper')

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

d3.json("./data/wordSets.json").then((data) => {
    let wordSets = new Map(data);

    function game() { 
        let wordSet = wordSets.get('common').words
//    console.log(wordSets.get('common').words)
        let gameResults = playFullGame('random',randomAnswer(wordSet),wordSet);
        
        let circleScale = d3.scaleSqrt()
            .domain([0, wordSet.length])
            .range([0, 1]);

        actualWord.html("Actual Word: <b>" + gameResults.actualWord.toUpperCase() + "</b>")
        nextWord.text('REVEAL NEXT GUESS'); 
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
                if(guessCount==5 || gameResults.guesses[guessCount] == gameResults.actualWord) {
                nextWord.text('REPLAY'); 
                }
                if(guessCount == 6 || gameResults.guesses[guessCount-1] == gameResults.actualWord){
                guessCount=-1; 
                wordsWrapper.selectAll('span')
                    .style('background-color', '#FFFFFFAA')
                    .style('color', (d,i)=> '#FFFFFF00')
                    .style('border-color', '#CCC');
            
                nextWord.text('REVEAL NEXT GUESS'); 
            
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
    resetGame.on('click', game)
})