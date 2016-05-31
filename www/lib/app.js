var module = ons.bootstrap('my-app', ['onsen']);
module.controller('menuController', function($scope, $http, $sce) {
	ons.ready(function() {
		
		//adding the milestone to left menu
		$scope.addClassesToLeftMenu = function(){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "list_lesson_menu",
					project_id: localStorage.getItem("project_id"),
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.milestoneList = response;
			});
		}
		if(localStorage.getItem("login"))
			$scope.addClassesToLeftMenu();
		
		//declaring variable for task commenting form
		$scope.newTaskCommentContent = "";
		
		//function getting classes if someone wants to join class
		$scope.joinClass = function(){
			//localStorage.setItem("chosen_proj_id", proj_id);
			$scope.registrationType = 'join';
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "get_proj_api",
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.allProjTemplates = response.data;
				menu.setMainPage('select-project.html', {closeMenu: true});
			});
		}
		
		//function getting classes if someone wants to duplicate class
		$scope.createClass = function(){
			//localStorage.setItem("chosen_proj_id", proj_id);
			$scope.registrationType = 'create';
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "get_proj_api",
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.allProjTemplates = response.data;
				menu.setMainPage('select-project.html', {closeMenu: true});
			});
		}
		
		//function fires after class been chosen
		$scope.projChooseFunc = function(id){
			$scope.chosenProjId = id;
			menu.setMainPage('registration.html', {closeMenu: true});
		}
		
		//function which fires after clicking to the left menu lesson or task item
		$scope.menuLessonClickFunc = function(id){
			$scope.currentCommentsTaskId = $scope.milestoneList[id].id;
			$scope.milestone_title=$scope.milestoneList[id].title;
			$scope.milestone_content=$scope.milestoneList[id].content;
			$scope.milestone_content=$sce.trustAsHtml($scope.milestone_content);
			if($scope.milestoneList[id].type=="lesson")
				menu.setMainPage('milestone.html', {closeMenu: true});
			if($scope.milestoneList[id].type=="task")
				menu.setMainPage('task.html', {closeMenu: true});
			$scope.getTaskComment($scope.currentCommentsTaskId);
			$scope.getMilestoneMeta($scope.milestoneList[id].id);
		}
		
		//function which fires if task menu item from left menu clicked
		$scope.getTaskComment = function(task_id){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "list_task_comments_mobile",
					task_id: task_id,
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.currentTaskComments = response.data;
			});
		}
		
		//function that getting media links for milestone click that will be attached to the carousel
		$scope.getMilestoneMeta = function(milestone_id){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "get_milestone_postmeta",
					id: milestone_id,
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.milestonePostmetaMedia = response.data;
			});
		}
		
		//function checking if the link got from milestonePostmetaMedia variable is mp4 video, if not returns false
		$scope.checkVideo = function(link){
			var extn = link.split(".").pop();
			var matches = link.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
			if(extn=="mp4"&&!matches)
				return true;
			else
				return false;
		}
		
		$scope.checkYoutube = function(link){
			var matches = link.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
			if (matches) {
				//$scope.trustSrc(link);
				return true;
			} else {
				return false;
			}
		}
		
		//function allows the link to be used for getting video
		$scope.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		}
		
		//function sending new task comment to the server
		$scope.insertTaskComment = function(content){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "insert_task_comments_mobile",
				},
				data: {
					task_id: $scope.currentCommentsTaskId,
					content: content
				},
			}).then(function(response) {
				$scope.getTaskComment($scope.currentCommentsTaskId);
				$scope.newTaskCommentContent = "";
			});
		}
		
		//variable responsible for making the left menu swappable or not
		$scope.swappable = true;
		
		//variable responsible for login, registration data
		$scope.registration={
			login: "",
			email: "",
			password: "",
			repeat_pass: ""
		};
		
		
		//checking if set page to login or go to home main page
		if(localStorage.getItem("login"))
		{
			menu.setMainPage('home.html', {closeMenu: true});
		}
		else
		{
			menu.setMainPage('start-page.html', {closeMenu: true});
			$scope.swappable = false;
		}
		
		//function get a list of posts from server or opens a login page if user is not registered
		$scope.menuEditClickFunc = function(){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php?proj_id="+localStorage.getItem("project_id"), 
				method: "get",
				params: {
					action: "list_edit_arr",
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.editFieldList = response.data;
				if(localStorage.getItem("login"))
				{
					menu.setMainPage('edit.html', {closeMenu: true});
				}
				else
				{
					menu.setMainPage('start-page.html', {closeMenu: true});
					$scope.swappable = false;
				}
			});
		}
		
		//function updates the posts after user clicks update and return renewed list of posts
		$scope.updateItemFunc = function(update_data){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					update_data: update_data
				},
				params: {
					'action': "update_mobile_items_post",
				}
			}).then(function(response) {
				$scope.menuEditClickFunc();
			});
		}
		
		//function adds posts to server database through api and renewing the list of posts
		$scope.addItemFunc = function(name){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					add_data: $scope.addNewItemFields,
					add_name: name,
					proj_id: localStorage.getItem("project_id")
				},
				params: {
					action: "add_mobile_items_data",
				}
			}).then(function(response) {
				//alert(response.data);
				$scope.menuEditClickFunc();
			});
		}
		
		//registration or login error holding variable
		$scope.registration_error = "";
		
		//user login variable to display hello message
		$scope.user_login = localStorage.getItem("login");
		
		//registering the new student user attaching it to the existing project
		$scope.userRegister = function(){
				$http({
					url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {
						registration_data: $scope.registration,
						project_id: $scope.chosenProjId,
						registration_type: $scope.registrationType
					},
					params: {
						'action': "registration_api",
						callback:'JSON_CALLBACK'
					}
				}).then(function(response) {
					if(!response.data['error'])
					{
						localStorage.setItem("login",response.data['user_login']);
						localStorage.setItem("id",response.data['user_id']);
						localStorage.setItem("project_id",response.data['project_id']);
						menu.setMainPage('login.html', {closeMenu: true});
						//$scope.swappable = true;
						$scope.user_login = response.data['user_login'];
						$scope.addClassesToLeftMenu();
					}
					$scope.registration_error = response.data['error'];
				});
		}
		
		//logging in the student user
		$scope.userLogin = function(){
				$http({
					url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: {
						registration_data: $scope.registration,
					},
					params: {
						'action': "login_api",
						callback:'JSON_CALLBACK'
					}
				}).then(function(response) {
					if(!response.data['error'])
					{
						localStorage.setItem("login",response.data['user_login']);
						localStorage.setItem("id",response.data['user_id']);
						localStorage.setItem("project_id",response.data['project_id']);
						menu.setMainPage('home.html', {closeMenu: true});
						$scope.swappable = true;
						$scope.user_login = response.data['user_login'];
						$scope.addClassesToLeftMenu();
					}
					$scope.registration_error = response.data['error'];
				});
		}
		
		//logout the user and pushing the login page
		$scope.menuLogoutClickFunc = function(){
			$scope.swappable = false;
			localStorage.removeItem("login","Michael");
			menu.setMainPage('start-page.html', {closeMenu: true});
		}
		
		//listing the posts
		$http({
			url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
			method: "get",
			params: {
				action: "add_mobile_items_post",
				callback:'JSON_CALLBACK'
			},
		}).then(function(response) {
			//alert(response.data);
			$scope.addNewItemName='';
			$scope.addNewItemFields=response.data;
		});
		
		//$scope.menuEditClickFunc();
		
		//checking the field type for posts to manage the if statement in posts section
		$scope.checkFieldType = function(field, type){
			if(field==type)
				return true;
			else
				return false;
		}
		
		//handling slideDown, slideUp on clicking on the post to edit or to see it
		$scope.editFieldListSection = function($event){
			jQuery(".editFieldsListHolder").slideUp();
			if(!jQuery($event.target).next().is(":visible"))
				jQuery($event.target).next().slideDown();
		}
	});
});
module.controller('AppController', function($scope) { });
module.controller('PageController', function($scope) {
	ons.ready(function() {
         // Init code here
	});
});	