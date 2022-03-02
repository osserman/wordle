d3.select('button#more').on('click',function(){
    d3.selectAll('#modals aside').style('visibility','hidden')
    d3.select('#modals aside#more-modal').style('visibility','visible')
        .select('a,button').node().focus();
})

d3.select('button#share').on('click',function(){
    d3.selectAll('#modals aside').style('visibility','hidden')
    d3.select('#modals aside#share-modal').style('visibility','visible')
        .select('a,button,input').node().focus();
})

d3.selectAll('button.close-modal').on('click',function(){
    d3.selectAll('#modals aside').style('visibility','hidden')
    d3.select('nav').select('button').node().focus()
})

d3.select('#copy-url').on('click', function() {
    let url_to_share = d3.select('#modals #url').node().innerHTML
    navigator.clipboard.writeText(url_to_share)
    .then(
        function(){
            d3.select('#share-copy-result').style('display','block').style('font-weight','bold').style('color','rgb(var(--color-right))').text("copied to your clipboard!"); // success  
        })
      .catch(
         function() {
            d3.select('#share-copy-result').style('display','block').style('font-weight','bold').style('color','var(--color-wrong)').text("failed to copy. Please manually select, copy and paste!"); // success  
            // error
      });
})