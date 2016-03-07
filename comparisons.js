var app = angular.module('shopRite', []);

app.controller('comparisons', function($scope) {

  $scope.laptops = [];

  // Initialize laptop container
  var string = sessionStorage.getItem('personals')
  var parsedItems = $.parseJSON(string);
  if (parsedItems != null && parsedItems.length > 0) {
    for (item of parsedItems) {
      try {
        restoreItem(item);
        $scope.laptops.push(item);
      }
      catch (e) {
        console.log(e.stack);
      }
    }
  }

  $scope.removeItem = function(index) {
    var item = $scope.laptops[index];
    $scope.laptops.splice(index,1); // Removes from array, angular responds in view
    sessionStorage.setItem('personals', JSON.stringify($scope.laptops));
}
});
