// client-side js
// run by the browser each time your view template is loaded

// protip: you can rename this to use .coffee if you prefer

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  
  $.get('/read', function(reading) {
    var threshold = 100;
    
    $('#readings').text(reading);
    
    if (reading < threshold) {
      $('#title').text('OK!');
      $('#image').html('<img src="https://cdn.hyperdev.com/us-east-1%3A9cef1fc3-379d-4e93-b87f-a1ea03317562%2Fpolice-thumbs-up.jpg">');
    }
    
    else {
      $('#title').text('Drunk!');
      $('#image').html('<img src="https://cdn.hyperdev.com/us-east-1%3A9cef1fc3-379d-4e93-b87f-a1ea03317562%2Fsuperhik.jpg">');
    }
  });

});
