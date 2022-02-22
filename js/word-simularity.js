import {colors, randomAnswer, wordSim, wordComp, getSimWords} from './functions.js';


d3.json("./data/wordSets.json").then((data) => {
    let wordSets = new Map(data);
    let curWord = d3.select('#word-selection button:first-of-type').property('value');
    d3.select('#word-selection button:first-of-type').style('background-color', 'rgb(var(--color-right)')
    
    let similarityThreshold = 3.5;
       
    const word = d3.select('#current-word')
    const annotation = d3.select('#annotation')

    const wordInput = d3.select('#word-input')
        .on('input', function() {
            if(this.value.split('').length == 5) {
                updateChart(this.value.toLowerCase());
            }
        })

    d3.select('#sim-threshold')
        .on('input', function() {
            d3.select('#cur-sim-threshold').text(this.value)
            similarityThreshold = +this.value;
            (updateChart(curWord))
        })

    function updateChart(chosenWord){ 
        curWord = chosenWord;
        let simWords = getSimWords(chosenWord, wordSets.get('common').words);    
        let curSimWords = simWords.filter(d=> d.simScore >= similarityThreshold)    

        word.selectAll('span')
            .data(chosenWord.split(''))
            .join('span')
            .attr('class','letter')
            .text(d=> d)
            .style('background-color', colors.right)
            .style('border','2px solid ' + colors.right)

        annotation.text(curSimWords.length + ' similar words')

        let words = d3.select('#sim-words')
            .selectAll('div')
            .data(curSimWords.map(d=> d.word))
                .join('div')
                .attr('id', (d,i)=> 'guess-' + i)
                .each(function (d,i) {
                    const col = wordComp(d, chosenWord)
                    d3.select(this)
                        .selectAll('span')
                        .data(d.split(''))
                            .join('span').attr('class','letter')
                            .text(d=> d)
                            .style('background-color', (d,i)=> col[i])
                            .style('border',(d,i)=> '2px solid ' + col[i])
                    })
    }
    updateChart(curWord)

    let selectionButtons = d3.select('#word-selection').selectAll('button')
    
    selectionButtons.on('click', function (){ 
            selectionButtons.style('background-color', colors.wrong)
            d3.select(this).style('background-color', colors.right)
            if (d3.select(this).attr('id') == 'random-word'){
                wordInput.style('display','none')
                updateChart(randomAnswer(wordSets.get('common').words));
            } else if(d3.select(this).attr('id') == 'pick-your-own'){
                wordInput.style('display','inline-block')
                if(wordInput.property('value').split('').length == 5){
                    updateChart(wordInput.property('value').toLowerCase())
                }
            } else {
                wordInput.style('display','none')
                updateChart(this.value);
            }
        })

});