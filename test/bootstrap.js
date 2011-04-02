function pass(id) {
  $('#' + id + ' td.result').removeClass('failed').addClass('success').html('success');
}

$(document).ready(function() {
  // Change everything to failed at start
  $('table tr').find('td:last').addClass('result failed').html('failed');
  // Disable logging
  Socky.Utils.log = function() {};
});