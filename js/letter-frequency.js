import {colors} from './functions.js';

const barsRow = d3.select('#letterBars')
const lettersRow = d3.select('#letterMarkers')
const letterChecksRow = d3.select('#letterChecks')

const showAllButton = d3.select('#showAllLetterFreq')
const resetButton = d3.select('#reset')
const reorderButton = d3.select('#reorder')

let wordSetName = 'common';
let showingAllFrequencies = 0; 
const barCellHeight = 100;
let curData, letterOrder, top5letters, letterCountDomain, barHeightScale, colorScale, curOrder, bars, letters, letterChecks;

d3.json("./data/letterFrequencies.json").then((data) => {

  const wordSetStats = new Map(data.map(d=> [d[0], {...d[1], letterCounts: (new Map(d[1].letterCounts)) }]));

  function initialize(){ 
    showingAllFrequencies = 0;

    curData = wordSetStats.get(wordSetName);

    letterOrder = 
    Array.from(curData.letterCounts)
        .map(d=> ({letter: d[0], count: d[1]}))
        .sort((a,b)=> d3.descending(a.count,b.count))
        .map(d=> d.letter);

    top5letters = letterOrder.slice(0,5);

    letterCountDomain = [0,d3.max( Array.from(curData.letterCounts).map(lc=>lc[1]))];
    
    barHeightScale = d3.scaleLinear().domain(letterCountDomain).range([0,barCellHeight]);
    
    colorScale = d3.scaleLinear()
      .domain(letterCountDomain)
      .range([colors.wrong, colors.right])
      .interpolate(d3.interpolateRgb)


    d3.select('#description').html("Click the letters to guess the five most frequent letters in " + curData.description + ' (' + curData.wordCount + " total words)")

    bars = barsRow.selectAll('span')
      .data(curData.letterCounts).join('span')
      .attr('class','letter')

    letters = lettersRow.selectAll('span')
      .data(curData.letterCounts).join('span')
      .attr('class','letter')
      .text(d=> d[0])

    letterChecks = letterChecksRow.selectAll('span')
      .data(curData.letterCounts).join('span')
      .attr('class','letter')
      .attr('id', d=> 'check-for-' + d[0])
      .text("")

    bars
      .style('height','0px')
      .style('order',0)
      .style('background-color','none')
      .style('border','none')

    letterChecks
      .style('order',0) 

    letters
      .style('background-color', "white")
      .style('border-color','#d3d6da')
      .style('color', "black")
      .style('order',0)
      .on('click', function(event, d) {
        if (showingAllFrequencies == 0){
            d3.select(this)
            .style('background-color', top5letters.indexOf(d[0]) != -1 ?  colors.right : colors.wrong)
            .style('border-color', top5letters.indexOf(d[0]) != -1 ?  colors.right : colors.wrong)
            .style('color','white')
               
            d3.select('#check-for-' + d[0])
                .text(d=> top5letters.indexOf(d[0]) != -1 ? '√' : 'x')
                .style('color', d=> top5letters.indexOf(d[0]) != -1 ? colors.right : colors.wrong)
            }

      })
    
    reorderButton
      .style('visibility','hidden')
      .text('Order by frequency')

    curOrder = 'alpha';
  }
  
  initialize() 
  
  resetButton.on('click', initialize) 

  showAllButton.on('click', () => {
    showingAllFrequencies = 1;
    barsRow
      .transition()
        .style('height', barCellHeight + 'px')

    bars
      .transition()
        .style('height', (d) =>  barHeightScale(d[1]) + 'px')
        .style('background-color', (d) => colorScale(d[1]))
        .style('border-color', (d) => colorScale(d[1]))
      

    letters
      .transition() 
        .style('color', "white")
        .style('background-color', (d) => colorScale(d[1]))
        .style('border-color', (d) => colorScale(d[1]))

    reorderButton.style('visibility','visible')
  })
  
  
  reorderButton.on('click', () => {
    if( curOrder == 'alpha' ) { 
      curOrder = 'freq'
      bars.style('order', d=> letterOrder.indexOf(d[0]))
      letters.style('order', d=> letterOrder.indexOf(d[0]))
      letterChecks.style('order', d=> letterOrder.indexOf(d[0]))
      reorderButton.text('Order alphabetically')
    } else { 
      curOrder = 'alpha'
      bars.style('order',  0 )
      letters.style('order', 0 )
      letterChecks.style('order', 0)
      reorderButton.text('Order by frequency')
    }
  })


})