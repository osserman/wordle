import {colors} from './functions.js';

const guessDistrib = d3.select('#guess-distrib')
const barWidthMultiplier = 600

d3.json("./data/winByRound.json").then((data) => {
    const winByRoundX = new Map(data);
    let curSim = d3.select('#sim-selection button:first-of-type').property('value');
    d3.select('#sim-selection button:first-of-type').style('background-color', 'rgb(var(--color-right)')

    guessDistrib.selectAll('div').data(d3.range(1,7))
        .join('div').style('display','flex').style('gap','10px')
        .each(function(d,i){
            let curWinPct = winByRoundX.get(curSim).winInRound[i];
            d3.select(this).append('span').text(d).style('font-weight','normal');
            d3.select(this).append('span').attr('class','win-pct-bar')
                .style('display','inline-block')
                .style('width', barWidthMultiplier * curWinPct + 'px')
                .style('height', '1.5rem')
                .style('background-color', 'var(--color-wrong)')
            d3.select(this).append('span').attr('class','win-pct-bar-annote').style('display','inline-block').text(d3.format('.0%')(curWinPct))
        })

    function updateChart(chosenWord){ 
        curSim = chosenWord;
        let curWinByRound = winByRoundX.get(curSim).winInRound
        let prevWinPct = +d3.select('#stats #win-pct').node().innerText.replace(/[^0-9]/, "")
        let targetWinPct = Math.round(100 * (1 - winByRoundX.get(curSim).lost))
        d3.select('#stats #played').text(d3.format(',')(winByRoundX.get(curSim).gamesPlayed))
        d3.select('#stats #win-pct').transition().textTween(() => t => Math.round(prevWinPct+ t*(targetWinPct-prevWinPct)) + '%')
        d3.selectAll('.win-pct-bar').transition().style('width',(_,i) => barWidthMultiplier * curWinByRound[i] + 'px')
        d3.selectAll('.win-pct-bar-annote').text((_,i) => d3.format('.0%')(curWinByRound[i]))

    }
    updateChart(curSim)

    let selectionButtons = d3.select('#sim-selection').selectAll('button')
    
    selectionButtons.on('click', function (){ 
            selectionButtons.style('background-color', colors.wrong)
            d3.select(this).style('background-color', colors.right)
            updateChart(this.value);
        })

});