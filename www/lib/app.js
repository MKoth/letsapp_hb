var module = ons.bootstrap('my-app', ['onsen']);

module.filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
});

module.controller('menuController', function($scope, $http, $sce) {
	ons.ready(function() {
		
		/*$scope.checkConnection = function checkConnection() {
			var networkState = navigator.network.connection.type;

			var states = {};
			states[Connection.UNKNOWN]  = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI]     = 'WiFi connection';
			states[Connection.CELL_2G]  = 'Cell 2G connection';
			states[Connection.CELL_3G]  = 'Cell 3G connection';
			states[Connection.CELL_4G]  = 'Cell 4G connection';
			states[Connection.NONE]     = 'No network connection';
			if(states[networkState] == 'No network connection')
				alert(states[networkState]);
		}

		$scope.checkConnection();*/
		
		$scope.page = {post_adding:"", registration:""};
		
		$scope.addPageToApp = function(item){
			//alert(item);
			if(item===true)
			{
				$scope.addPageFunc('Registration page', 'www/menu.html', 'add_registration_page');
			}
			if(item===false)
			{
				$scope.addPageFunc('Registration page', 'www/menu.html', 'remove_registration_page');
			}
			if(item==="YES")
			{
				$scope.addPageFunc('Add post page', 'www/menu.html', 'add_post_page');
			}
			if(item==="NO")
			{
				$scope.addPageFunc('Add post page', 'www/menu.html', 'remove_post_page');
			}
		}
		$scope.addPageFunc = function(tag_name, file_path, page_type){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "change_app_heading",
				},
				data: {
					tag_name: tag_name,
					file_path: file_path,
					page_type: page_type,
					proj_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				jQuery("#loader").fadeOut();
				alert("השינוים נשמרו באפליקציה שלך");
			});
		}
		
		
		$scope.project_id = localStorage.getItem("project_id");
		//function get a list of posts from server or opens a login page if user is not registered
		$scope.menuEditClickFunc = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php?proj_id="+localStorage.getItem("project_id"), 
				method: "get",
				params: {
					action: "list_edit_arr",
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				//alert(response.data);
				jQuery("#loader").fadeOut();
				$scope.editFieldList = response.data;
				if(localStorage.getItem("login"))
				{
					menu.setMainPage('edit-item.html', {closeMenu: true});
				}
				else
				{
					menu.setMainPage('login.html', {closeMenu: true});
					$scope.swappable = false;
				}
			});
		}
		
		$scope.openInBrowser=function(link){
			navigator.app.loadUrl(link, {openExternal : true});
			window.open(link, '_system');
		}
		//function to get picture from library
		
	/*navigator.camera.getPicture(onSuccess, onFail, { 
		quality: 100,
		destinationType: Camera.DestinationType.DATA_URL,
		//sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
	});*/
	
	
	
		$scope.getCurrentPositionFunc = function(){
			if(navigator.geolocation)
				navigator.geolocation.getCurrentPosition($scope.geolocationSuccess,$scope.geolocationError);
		}
		$scope.addNewItemPage = function(){
			menu.setMainPage('add-item.html', {closeMenu: true});
			$scope.post={addNewItemImage:"new-photo.jpg"};
			$scope.getCurrentPositionFunc();
		}
		
		
		
		$scope.geolocationSuccess = function(position){
		  jQuery("#add-item-area input.latitude").val(position.coords.longitude);
		  jQuery("#add-item-area input.longitude").val(position.coords.latitude);
		}
		$scope.geolocationError = function(error){
			alert(error);
		}
		$scope.appLinkDownload = {link:"#", text:"המתן בבקשה..."};
		$scope.getAppLink = function(){
			$scope.appLinkDownload.link = "#";
			$scope.appLinkDownload.text = "המתן בבקשה...";
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "GET",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "get_app_link",
					proj_id: localStorage.getItem("project_id")
				}
			}).then(function(response) {
				//alert(response.data.location);
				if(response.data.location)
				{
					//$scope.appLinkDownload.link = trustSrc(response.data.location);
					//trustSrc(response.data.location);
					$scope.appLinkDownload.link = response.data.location;
					$scope.appLinkDownload.text = "הורד האפליקציה שלך כאן";
				}
				else
				{
					setTimeout($scope.getAppLink, 5000);
				}
			});
		}
		
		$scope.getAppLink();
	
		$scope.startBuildingApp = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "rebuild_app",
				},
				data: {
					proj_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				jQuery("#loader").fadeOut();
				//alert(response.data);
				$scope.getAppLink();
			});
		}
		
		$scope.getUserCam  = function(){
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getUserPictureSuccess, $scope.onFail, { quality: 30,
			destinationType: Camera.DestinationType.FILE_URI });
		}
		
		$scope.getUserFile  = function(){
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getUserPictureSuccess, $scope.onFail, { quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY	});
		}
		
		$scope.getRegistrationUserCam  = function(){
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getRegUserPictureSuccess, $scope.onFail, { quality: 30,
			destinationType: Camera.DestinationType.FILE_URI });
		}
		
		$scope.getRegistrationUserFile  = function(){
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getRegUserPictureSuccess, $scope.onFail, { quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY	});
		}
		
		$scope.getPicFile = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getPictureSuccess, $scope.onFail, { quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY	});
		}
		
		$scope.getPicCam = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getPictureSuccess, $scope.onFail, { quality: 30,
			destinationType: Camera.DestinationType.FILE_URI });
		}
		
		$scope.getPostUserFile = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getPostSuccess, $scope.onFail, { quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY	});
		}
		
		$scope.getPostUserCam = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getPostSuccess, $scope.onFail, { quality: 30,
			destinationType: Camera.DestinationType.FILE_URI });
		}
		
		$scope.getEditUserFile = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getEditSuccess, $scope.onFail, { quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY	});
		}
		
		$scope.getEditUserCam = function(){
			//alert();
			$scope.dialog.hide();
			navigator.camera.getPicture($scope.getEditSuccess, $scope.onFail, { quality: 30,
			destinationType: Camera.DestinationType.FILE_URI });
		}
    
		$scope.clearCache = function() {
			navigator.camera.cleanup();
		}
		$scope.getPictureSuccess=function(fileURI) {
			jQuery("#loader").fadeIn();
			//document.getElementById('img').src = fileURI;
			var win = function (r) {
				$scope.clearCache();
				retries = 0;
				//alert('Done!');
				//alert(r.response.toString());
				jQuery("#loader").fadeOut();
				alert('התמונה שהוספת נשמרה');
			}
		 
			var fail = function (error) {
				if (retries == 0) {
					retries ++
					setTimeout(function() {
						getPictureSuccess(fileURI)
					}, 1000)
				} else {
					retries = 0;
					$scope.clearCache();
					alert('Ups. Something wrong happens!');
					jQuery("#loader").fadeIn();
				}
			}
		 
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = {action:"change_app_image", 'proj_id':localStorage.getItem("project_id")}; // if we need to send parameters to the server request
			var ft = new FileTransfer();
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
		}
		
		$scope.getUserPictureSuccess=function(fileURI) {
			jQuery("#loader").fadeIn();
			//document.getElementById('img').src = fileURI;
			var win = function (r) {
				$scope.clearCache();
				retries = 0;
				//alert('Done!');
				//alert(r.response.toString());
				$scope.userdata.profile_image = r.response.toString();
				localStorage.setItem("users_profile_image",$scope.userdata.profile_image);
				jQuery("#loader").fadeOut();
				alert('User Photo saved!');
			}
		 
			var fail = function (error) {
				if (retries == 0) {
					retries ++
					setTimeout(function() {
						getUserPictureSuccess(fileURI)
					}, 1000)
				} else {
					retries = 0;
					$scope.clearCache();
					alert('Ups. Something wrong happens!');
					jQuery("#loader").fadeIn();
				}
			}
		 
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = {action:"upload_user_profile", user_id: localStorage.getItem("id")}; // if we need to send parameters to the server request
			var ft = new FileTransfer();
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
			//ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
		}
		
		
		$scope.getRegUserPictureSuccess=function(fileURI) {
			jQuery("#loader").fadeIn();
			var win = function (r) {
				//alert(r.response.toString());
				$scope.clearCache();
				retries = 0;
				$scope.registration.profile_image = r.response.toString();
				localStorage.setItem("users_profile_image",$scope.registration.profile_image);
				jQuery("#loader").fadeOut();
				alert('User Photo saved!');
			}
		 
			var fail = function (error) {
				if (retries == 0) {
					retries ++
					setTimeout(function() {
						getUserPictureSuccess(fileURI)
					}, 1000)
				} else {
					retries = 0;
					$scope.clearCache();
					alert('Ups. Something wrong happens!');
					jQuery("#loader").fadeIn();
				}
			}
		 
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = {action:"upload_user_profile", user_id: localStorage.getItem("id")};
			var ft = new FileTransfer();
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
		}
		
		$scope.getPostSuccess=function(fileURI) {
			jQuery("#loader").fadeIn();
			var win = function (r) {
				//alert(r.response.toString());
				var str = r.response.toString();
				var json = JSON.parse(str);
				alert(json.image_url);
				$scope.clearCache();
				retries = 0;
				$scope.post = {addNewItemImage:json.image_url,attachment_id:json.attachment_id};
				$scope.$digest();
				
				//$("#add-attachment").attr('src',r.response.toString());
				//localStorage.setItem("upload_post_image",$scope.registration.profile_image);
				jQuery("#loader").fadeOut();
				alert('Post Photo saved!');
				//alert(r);
			}
		 
			var fail = function (error) {
				if (retries == 0) {
					retries ++
					setTimeout(function() {
						getUserPictureSuccess(fileURI)
					}, 1000)
				} else {
					retries = 0;
					$scope.clearCache();
					alert('Ups. Something wrong happens!');
					jQuery("#loader").fadeIn();
				}
			}
		 
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = {action:"upload_post_image"};
			var ft = new FileTransfer();
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
		}
		
		$scope.getEditSuccess=function(fileURI) {
			jQuery("#loader").fadeIn();
			var win = function (r) {
				//alert(r.response.toString());
				var str = r.response.toString();
				var json = JSON.parse(str);
				alert(json.image_url);
				$scope.clearCache();
				retries = 0;
				$scope.post = {updateNewItemImage:json.image_url,update_attachment_id:json.attachment_id};
				$scope.$digest();
				
				//$("#add-attachment").attr('src',r.response.toString());
				//localStorage.setItem("upload_post_image",$scope.registration.profile_image);
				jQuery("#loader").fadeOut();
				alert('Post Photo saved!');
				//alert(r);
			}
		 
			var fail = function (error) {
				if (retries == 0) {
					retries ++
					setTimeout(function() {
						getUserPictureSuccess(fileURI)
					}, 1000)
				} else {
					retries = 0;
					$scope.clearCache();
					alert('Ups. Something wrong happens!');
					jQuery("#loader").fadeIn();
				}
			}
		 
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = {action:"upload_post_image"};
			var ft = new FileTransfer();
			ft.upload(fileURI, encodeURI("http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php"), win, fail, options);
		}
		
		$scope.onFail=function(message) {
			//alert('Failed because: ' + message);
		}
		
		$scope.layout = {main_title:"",app_title:""};
		//function replacing text in app
		$scope.saveText = function(type, content){
			jQuery("#loader").fadeIn();
			if(type=="main_title")
			{
				$scope.tag_name = "h2";
				$scope.file_path = "www/welcome.html";
				$scope.new_title = $scope.layout.main_title;
			}
			else if(type=="app_title")
			{
				$scope.tag_name = "name";
				$scope.file_path = "config.xml";
				$scope.new_title = $scope.layout.app_title;
			}
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "change_app_heading",
				},
				data: {
					tag_name: $scope.tag_name,
					file_path: $scope.file_path,
					new_title: $scope.new_title,
					proj_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				jQuery("#loader").fadeOut();
				//alert(response.data);
				alert("השינוים נשמרו באפליקציה שלך");
			});
		}
		
		//adding the milestone to left menu
		$scope.addClassesToLeftMenu = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "list_lesson_menu",
					project_id: localStorage.getItem("project_id"),
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				jQuery("#loader").fadeOut();
				$scope.milestoneList = response.data;
				/*$.each(response.data, function(key,value){
					alert(key);
				});*/
			});
		}
		if(localStorage.getItem("login"))
			$scope.addClassesToLeftMenu();
		
		//declaring variable for task commenting form
		$scope.newTaskComment = {content:"", final_answer:""};
		
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
			if($scope.milestoneList[id+1]){
				$scope.next = id+1;
			}
			else
			{
				$scope.next = "last";
			}
			if(id!=0){
				$scope.prev = id-1;
			}
			else
			{
				$scope.prev = "first";
			}
			if($scope.milestoneList[id].type=="lesson")
			{
				$scope.getMilestoneMeta($scope.milestoneList[id].id);
			}
			if($scope.milestoneList[id].type=="task")
			{
				//if($scope.milestoneList[id].final_answer)
				//$scope.final_answer=$scope.milestoneList[id].final_answer;
				$scope.getFinalAnswer($scope.currentCommentsTaskId);
				$scope.getTaskComment($scope.currentCommentsTaskId);
			}
		}
		
		$scope.getPhotoDialog = function(){
			ons.createDialog('get-photo-dialog.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.getRegistrationPhotoDialog = function(){
			ons.createDialog('get-registration-photo-dialog.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.getPostPhotoDialog = function(){
			ons.createDialog('get-post-photo-dialog.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.getEditPhotoDialog = function(){
			ons.createDialog('get-edit-photo-dialog.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.createNewApp = function(){
			//alert();
			$scope.dialog.hide();
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
				menu.setMainPage('task.html', {closeMenu: true});
			});
		}
		
		$scope.getFinalAnswer = function(task_id){
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "get_final_answer_mobile",
					task_id: task_id,
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				$scope.final_answer = response.data;
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
				menu.setMainPage('milestone.html', {closeMenu: true});
			});
		}
		
		//function checking if the link got from milestonePostmetaMedia variable is mp4 video, if not returns false
		$scope.checkVideo = function(link){
			var extn = link.split(".").pop();
			var matches = link.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
			if((extn=="mp4"||extn=="avi")&&!matches)
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
		$scope.insertTaskComment = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "insert_task_comments_mobile",
				},
				data: {
					task_id: $scope.currentCommentsTaskId,
					content: $scope.newTaskComment.content,
					user_id: localStorage.getItem("id"),
					proj_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				//alert(response.data);
				jQuery("#loader").fadeOut();
				$scope.getTaskComment($scope.currentCommentsTaskId);
				$scope.newTaskComment.content = "";
			});
		}
		$scope.insertFinalAnswer = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "insert_final_answer_mobile",
				},
				data: {
					task_id: $scope.currentCommentsTaskId,
					content: $scope.newTaskComment.final_answer,
				},
			}).then(function(response) {
				$scope.final_answer=response.data;
				jQuery("#loader").fadeOut();
				$scope.getTaskComment($scope.currentCommentsTaskId);
				$scope.newTaskComment.final_answer = "";
			});
		}
		
		//variable responsible for making the left menu swappable or not
		$scope.swappable = true;
		
		//variable responsible for login, registration data
		$scope.registration = {
			login: "",
			email: "",
			password: "",
			repeat_pass: "",
			name: "",
			last_name: "",
			profile_image: ""
		};
		
		if(localStorage.getItem("login"))
		{
			$scope.registration.login = localStorage.getItem("login");
		}
		
		//checking if set page to login or go to home main page
		if(localStorage.getItem("login"))
		{
			//menu.setMainPage('classes-list.html', {closeMenu: true});
			$scope.menuEditClickFunc();
		}
		else
		{
			menu.setMainPage('start-page.html', {closeMenu: true});
			$scope.swappable = false;
		}
		
		//function updates the posts after user clicks update and return renewed list of posts
		$scope.updateItemFunc = function(update_data){
			jQuery("#loader").fadeIn();
			if(!$scope.post.update_attachment_id){
				$scope.post = {update_attachment_id:""};
			}
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					update_data: update_data,
					attachment_id: $scope.post.update_attachment_id
				},
				params: {
					'action': "update_mobile_items_post",
				}
			}).then(function(response) {
				//alert(response);
				$scope.post.updateNewItemImage = false;
				$scope.menuEditClickFunc();
				jQuery("#loader").fadeOut();
			});
		}
		
		$scope.deleteItemFunc = function(post_id){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					post_id: post_id
				},
				params: {
					'action': "delete_mobile_item_post",
				}
			}).then(function(response) {
				//alert(response);
				$scope.menuEditClickFunc();
				jQuery("#loader").fadeOut();
			});
		}
		
		//function adds posts to server database through api and renewing the list of posts
		$scope.addItemFunc = function(name,image){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://www.letsgetstartup.com/app-cloud/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					add_data: $scope.addNewItemFields,
					add_name: name,
					add_image: image,
					proj_id: localStorage.getItem("project_id")
				},
				params: {
					action: "add_mobile_items_data",
				}
			}).then(function(response) {
				jQuery("#loader").fadeOut();
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
						//menu.setMainPage('login.html', {closeMenu: true});
						//$scope.swappable = true;
						$scope.user_login = response.data['user_login'];
						$scope.addClassesToLeftMenu();
						$scope.menuEditClickFunc();
						$scope.swappable = true;
						$scope.project_id = response.data['project_id'];
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
						//menu.setMainPage('classes-list.html', {closeMenu: true});
						$scope.menuEditClickFunc();
						$scope.swappable = true;
						$scope.user_login = response.data['user_login'];
						$scope.addClassesToLeftMenu();
						$scope.project_id = response.data['project_id'];
						if(response.data['users_profile_image'])
						{
							localStorage.setItem("users_profile_image",response.data['users_profile_image']);
							$scope.userdata = {profile_image: localStorage.getItem("users_profile_image")};
						}
					}
					$scope.registration_error = response.data['error'];
				});
		}
		  
		 if(localStorage.getItem("users_profile_image")) 
			 $scope.userdata = {profile_image: localStorage.getItem("users_profile_image")};
		 else $scope.userdata = {profile_image: 'img/anon.gif'};
		//logout the user and pushing the login page
		$scope.menuLogoutClickFunc = function(){
			$scope.swappable = false;
			localStorage.removeItem("login","Michael");
			menu.setMainPage('login.html', {closeMenu: true});
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

function onSuccess(imageURI) {
    // here we can upload imageData to the server
	//alert(imageURI);
	var image = document.getElementById("myImg");
	image.src = "data:image/jpeg;base64,"+imageURI;
}
 
function onFail(message) {
    alert('Failed because: ' + message);
}