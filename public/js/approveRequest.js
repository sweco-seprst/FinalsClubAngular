app.controller('requestController', ['$scope', '$http', function($scope, $http){
  $scope.requests = [];
  $scope.approve = function(user, request_id){
    $http({
      method: 'POST',
      url: '/members',
      data: JSON.stringify({
        user_id: user,
        group_id: window.location.pathname.split('/')[2],
        request_id: request_id
      })
    }).success(function(){
      window.location.href = '/';
    }).error(function(err){
      console.log(err);
      angular.element('.contentWrapper').prepend("<span class='error'>The user is already a member of the group.</span>");
    });
  };
  
  $scope.ignoreRequest = function(id) {
    $http({
      method: 'PUT',
      url: '/requests/' + id
    }).success(function() {
      window.location.href = window.location.pathname;
    }).error(function(err) {
      console.log(err);
    });  
  };
  
}]);
