var module = ons.bootstrap('my-app', ['onsen']);

module.filter('trustUrl', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
});
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
		
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
function arrayObjectIndexOfForm(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
		
        if (myArray[i][property] === searchTerm)
		{
			if(myArray[i].type=="form")
				return i;
		}
    }
    return -1;
}
module.controller('menuController', function($scope, $http, $sce) {
	ons.ready(function() {
		
		$scope.showCodingPopup = function(){
			if($scope.dialog)
				$scope.dialog.hide();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "get_coding_task_popups",
					callback:'JSON_CALLBACK'
				},data: {
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id")
				},
			}).then(function(response) {
				//alert(response.data);
				$scope.popupsData = {popups: response.data};
				if($scope.popupsData.popups.task_msg)
				{
					ons.createDialog('coding-task.html', {parentScope: $scope}).then(function(dialog) {
						$scope.dialog = dialog;
						$scope.dialog.show();
					});
				}
			});
		}
		
		$scope.showCodingSuccess = function(){
			ons.createDialog('coding-task-success.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.showCodingFail = function(){
			ons.createDialog('coding-task-fail.html', {parentScope: $scope}).then(function(dialog) {
				$scope.dialog = dialog;
				$scope.dialog.show();
			});
		}
		
		$scope.closeDialog = function(){
			$scope.dialog.hide();
		}
		
		$scope.menuCodingPageClick = function(){
			$scope.getHiearchy();
			$scope.getSelectedHiearchy();
			menu.setMainPage('coding-page.html', {closeMenu: true});
			$scope.showCodingPopup();
		}
		
		$(document).on("click","ul#suggestionHolder li",function(){
			$("ul#suggestionHolder li ul").slideUp();
			$(this).find("ul").slideDown();
		});
		
		
		//$scope.item.pages[0] = {name:"Page0"};
		//$scope.item.pages[1] = {name:"Page1", elems:[{name:'Form0',type:'form'}]};
		$scope.codeline = {newcode:""};
		$scope.codelines = [];
		var noCacheParameter = new Date().getTime();
		$scope.iframeUrl = "http://www.letsgetstartup.com/blank-app?cach="+noCacheParameter;
		$scope.goToPreview = function (){
			menu.setMainPage('preview.html', {closeMenu: true});
			noCacheParameter = new Date().getTime();
			//alert(noCacheParameter);
			$scope.iframeUrl = "http://www.letsgetstartup.com/"+localStorage.getItem("project_id")+"_"+localStorage.getItem("id")+"?cach="+noCacheParameter;
			//$("#preview_screen").attr("src",iframeUrl);
			//document.getElementById("preview_screen").setAttribute("src", iframeUrl);
			$scope.iframeUrl = $sce.trustAsResourceUrl($scope.iframeUrl);
		}
		
		$scope.suggestionArray = {page:[],form:[],postpage:[],singlepost:[]};
		$scope.suggestionArray.page = ['addPage(pagename)','selectPage(pagename)','addText(Content)'];
		$scope.suggestionArray.form = ['addForm(Formname)','selectForm(Formname)','addFormElement(Element name,text)','addFormElement(Element name,textarea)','addFormElement(Element name,coord)'];
		$scope.suggestionArray.postpage = ['addPostsPage(pagename)','addPostsItem(Content,header)','addPostsItem(Content,description)'];
		
		$scope.markCodingDone = function(){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "set_coding_task_answer",
					callback:'JSON_CALLBACK'
				},data: {
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id"),
					task_id: $scope.popupsData.popups.post_id
				},
			}).then(function(response) {
				//alert(response.data);
				//$scope.showCodingPopup();
			});
		}
		
		$scope.startExec = function(){
			//alert($scope.popupsData.popups.ct_code);
			if(!$scope.popupsData.popups.task_msg)
			{
				$scope.execCode();
			}
			else if($scope.codeline.newcode == $scope.popupsData.popups.ct_code)
			{
				$scope.execCode();
				if($scope.milestoneList[$scope.currentTaskLessonId].status=="unlocked")
				{
					$scope.setTaskUnlockedDone($scope.currentTaskLessonId, "done");
					if($scope.next!="last")
					{
						if($scope.milestoneList[$scope.next].status=="locked")
							$scope.setTaskUnlockedDone($scope.next, "unlocked");
					}
				}
				$scope.showCodingSuccess();
				$scope.markCodingDone();
			}
			else if($scope.codeline.newcode != $scope.popupsData.popups.ct_code)
			{
				$scope.showCodingFail();
			}
		}
		
		$scope.execCode = function(){
			$scope.codelines.push($scope.codeline.newcode);
			//Page commands
			var addPageRegexp = /^ *addPage\((.+)\) *$/;
			var matchPage = addPageRegexp.exec($scope.codeline.newcode);
			var pageNameRegexp = /^ *selectPage\((.+)\) *$/;
			var matchPageName = pageNameRegexp.exec($scope.codeline.newcode);
			var addTextRegexp = /^ *addText\((.+)\) *$/;
			var matchText = addTextRegexp.exec($scope.codeline.newcode);
			var addPageStyleRegexp = /^ *addPageStyle\((.+),([a-zA-Z0-9-:;%# ]+)\) *$/;
			var matchPageStyle = addPageStyleRegexp.exec($scope.codeline.newcode);
			//Form commands
			var addFormRegexp = /^ *addForm\((.+)\) *$/;
			var matchForm = addFormRegexp.exec($scope.codeline.newcode);
			var formNameRegexp = /^ *selectForm\((.+)\) *$/;
			var matchFormName = formNameRegexp.exec($scope.codeline.newcode);
			var addFormElementRegexp = /^ *addFormElement\('(.+)',([a-zA-Z0-9- ]+)\) *$/;
			var matchFormElement = addFormElementRegexp.exec($scope.codeline.newcode);
			//Posts commands
			var addPostsPageRegexp = /^ *addPostsPage\((.+)\) *$/;
			var matchPostsPage = addPostsPageRegexp.exec($scope.codeline.newcode);
			var addPostsItemRegexp = /^ *addPostsItem\('(.+)',([a-zA-Z0-9- ]+)\) *$/;
			var matchPostsItem = addPostsItemRegexp.exec($scope.codeline.newcode);
			var postsNameRegexp = /^ *selectPosts\((.+)\) *$/;
			var matchPosts = postsNameRegexp.exec($scope.codeline.newcode);
			var addPostsStyleRegexp = /^ *addPostsStyle\((.+),([a-zA-Z0-9-:;%# ]+)\) *$/;
			var matchPostsStyle = addPostsStyleRegexp.exec($scope.codeline.newcode);
			//Single posts commands
			var addSinglePostRegexp = /^ *addSinglePost\((.+)\) *$/;
			var matchSinglePost = addSinglePostRegexp.exec($scope.codeline.newcode);
			var addSinglePostItemRegexp = /^ *addSinglePostItem\('(.+)',([a-zA-Z0-9- ]+)\) *$/;
			var matchSinglePostItem = addSinglePostItemRegexp.exec($scope.codeline.newcode);
			var singlePostNameRegexp = /^ *selectSinglePost\((.+)\) *$/;
			var matchSinglePostName = singlePostNameRegexp.exec($scope.codeline.newcode);
			var addSinglePostStyleRegexp = /^ *addSinglePostStyle\((.+),([a-zA-Z0-9-:;%# ]+)\) *$/;
			var matchSinglePostStyle = addSinglePostStyleRegexp.exec($scope.codeline.newcode);
			
			if(matchPage)
			{
				if(arrayObjectIndexOf($scope.item.pages, matchPage[1], 'name')==-1)
				{
					$scope.addNewPage(matchPage[1]);
				}
				else
				{
					$scope.codelines.push("This page is already existed!");
				}
			}
			else if(matchPageName)
			{
				$scope.currentPage = arrayObjectIndexOf($scope.item.pages, matchPageName[1], 'name');
				if($scope.currentPage!=-1)
				{
					$scope.codelines.push("You selected page name '"+matchPageName[1]+"'");
					$scope.saveHiearchy();
				}
				else
				{
					$scope.codelines.push("You selected wrong page name!");
				}
			}
			else if(matchText)
			{
				if($scope.currentPage!=-1)
				{
					$scope.addNewText($scope.currentPage,matchText[1]);
				}
			}
			else if(matchForm)
			{
				if($scope.currentPage!=-1)
				{
					$scope.addNewForm($scope.currentPage,matchForm[1]);
				}
			}
			else if(matchFormName)
			{
				if($scope.currentPage!=-1)
				{
					$scope.currentForm = arrayObjectIndexOfForm($scope.item.pages[$scope.currentPage].elems, matchFormName[1], 'name');
					if($scope.currentForm == -1)
						$scope.codelines.push("The name you selected is wrong!!!");
					else
					{
						$scope.codelines.push("You selected form name '"+matchFormName[1]+"'");
						$scope.saveHiearchy();
					}	
				}
				else
				{
					$scope.codelines.push("You need to select page!");
				}
			}
			else if(matchFormElement)
			{
				if($scope.currentPage!=-1)
				{
					if($scope.currentForm != -1)
					{
						$scope.addNewFormElem($scope.currentPage, $scope.currentForm, matchFormElement[1], matchFormElement[2]);
					}
					else
						$scope.codelines.push("You need to select form!");
				}
				else
				{
					$scope.codelines.push("You need to select page!");
				}
			}
			else if(matchPostsPage)
			{
				if($scope.currentForm!=undefined&&$scope.currentForm != -1)
				{
					if(arrayObjectIndexOf($scope.item.posts, matchPostsPage[1], 'name')==-1)
					{
						$scope.addNewPostsPage(matchPostsPage[1], $scope.currentForm, $scope.currentPage);
					}
					else
					{
						$scope.codelines.push("This page is already existed!");
					}
				}
				else
					$scope.codelines.push("You need to select form!");
			}
			else if(matchPostsItem)
			{
				if($scope.currentPostsPage!=-1&&$scope.currentPostsPage!=undefined){
					$scope.addNewPostsPageItem(matchPostsItem[1], $scope.currentPostsPage, matchPostsItem[2]);
				}
				else
					$scope.codelines.push("You need to create/select Posts page!");
			}
			else if(matchPosts)
			{
				
				if(arrayObjectIndexOf($scope.item.posts, matchPosts[1], 'name')!=-1)
				{
					$scope.currentPostsPage = arrayObjectIndexOf($scope.item.posts, matchPosts[1], 'name');
					$scope.codelines.push("You selected form name '"+matchPosts[1]+"'");
					$scope.saveHiearchy();
				}
				else
				{
					$scope.codelines.push("The name you selected is wrong!!!");
				}
			}
			else if(matchSinglePost)
			{
				if($scope.currentPostsPage!=undefined&&$scope.currentPostsPage != -1)
				{
					$scope.addNewSinglePostPage(matchSinglePost[1], $scope.currentPostsPage);
				}
				else
					$scope.codelines.push("You need to create/select Posts page!");
			}
			else if(matchSinglePostItem)
			{
				//alert($scope.currentSinglePostPage);
				if($scope.currentSinglePostPage!=-1&&$scope.currentSinglePostPage!=undefined){
					$scope.addSinglePostPageItem(matchSinglePostItem[1], $scope.currentSinglePostPage, matchSinglePostItem[2]);
				}
				else
					$scope.codelines.push("You need to create/select SinglePostPage page!");
			}
			else if(matchSinglePostName)
			{
				if(arrayObjectIndexOf($scope.item.singles, matchSinglePostName[1], 'name')!=-1)
				{
					$scope.currentSinglePostPage = arrayObjectIndexOf($scope.item.singles, matchSinglePostName[1], 'name');
					$scope.codelines.push("You selected form name '"+matchSinglePostName[1]+"'");
					$scope.saveHiearchy();
				}
				else
				{
					$scope.codelines.push("The name you selected is wrong!!!");
				}
			}
			else if(matchPageStyle)
			{
				if($scope.currentPage!=-1)
				{
					var pageStyleData = {name:matchPageStyle[1], style:matchPageStyle[2]}
					$scope.buildRequest($scope.item.pages[$scope.currentPage].name, 'add_page_style', pageStyleData);
				}
				else
				{
					$scope.codelines.push("Please, select page first!");
				}
			}
			else if(matchPostsStyle)
			{
				if($scope.currentPostsPage!=-1)
				{
					var postsStyleData = {name:matchPostsStyle[1], style:matchPostsStyle[2]}
					$scope.buildRequest($scope.item.posts[$scope.currentPostsPage].name, 'add_posts_style', postsStyleData);
				}
				else
				{
					$scope.codelines.push("Please, select posts page first!");
				}
			}
			else if(matchSinglePostStyle)
			{
				if($scope.currentSinglePostPage!=-1)
				{
					var singlePostStyleData = {name:matchSinglePostStyle[1], style:matchSinglePostStyle[2]}
					$scope.buildRequest($scope.item.singles[$scope.currentSinglePostPage].name, 'add_single_post_style', singlePostStyleData);
				}
				else
				{
					$scope.codelines.push("Please, select posts page first!");
				}
			}
			$scope.codeline.newcode = "";
			$scope.itemNotClicked = true;
			//var strCode = $scope.codelines[$scope.codelines.length-1];
			//alert($scope.codelines[$scope.codelines.length-1]);
			//var mainString = "hjk";
			//alert(mainString.includes(strCode));
		}
		$scope.itemNotClicked = true;
		$(document).on("input",".codeline-text-field",function(){$scope.itemNotClicked = true;});
		$scope.includeWord = function(string){
			var subString = $scope.codeline.newcode;
			return string.includes(subString);
		}
		$scope.includeWordArray = function(array){
			var flag = false;
			var subString = $scope.codeline.newcode;
			$.each(array,function(index,value){
				if(value.includes(subString))
				{
					flag = true;
					return false;
				}
				//alert(value.includes(subString));
			});
			if($scope.codeline.newcode=="") flag = false;
			return flag;
		}
		$scope.completeText = function(line){
			$scope.itemNotClicked = false;
			$scope.codeline.newcode = line;
		}
		$scope.getSelectedHiearchy = function(){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "get_selected_hiearchy",
					callback:'JSON_CALLBACK'
				},data: {
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id"),
				},
			}).then(function(response) {
				//alert();
				//alert(response.data);
				$scope.currentPage = response.data[0];
				$scope.currentForm = response.data[1];
				$scope.currentPostsPage = response.data[2];
				$scope.currentSinglePostPage = response.data[3];
				//alert("Current form "+$scope.currentForm);
				//alert("Current page "+$scope.currentPage);
				//alert("Current post page "+$scope.currentPostsPage);
			});
		}
		$scope.saveHiearchy = function(){
			if($scope.currentPage==undefined)
				$scope.currentPage = -1;
			if($scope.currentPostsPage==undefined)
				$scope.currentPostsPage = -1;
			if($scope.currentForm==undefined)
				$scope.currentForm = -1;
			if($scope.currentSinglePostPage==undefined)
				$scope.currentSinglePostPage = -1;
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "save_coding_hiearchy",
					callback:'JSON_CALLBACK'
				},data: {
					hiearchy: $scope.item,
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id"),
					currentPage: $scope.currentPage,
					currentForm: $scope.currentForm,
					currentPostsPage: $scope.currentPostsPage,
					currentSinglePostPage: $scope.currentSinglePostPage
				},
			}).then(function(response) {
				//alert();
				//alert(response.data);
			});
		}
		$scope.getHiearchy = function(){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "get_coding_hiearchy",
					callback:'JSON_CALLBACK'
				},data: {
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id"),
				},
			}).then(function(response) {
				//alert(response.data);
				if(response.data!=0)
					$scope.item = response.data;
				else
				{
					$scope.item = {pages:[], posts:[], singles:[]};
				}
			});
		}
		$scope.addNewPage = function(name){
			if($scope.item.pages[0])
			{
				$scope.currentPage = $scope.item.pages.length;
				$scope.item.pages[$scope.item.pages.length] = {name:name};
			}
			else
			{
				$scope.item.pages[0] = {name:name};
				$scope.currentPage = 0;
			}
			$scope.buildRequest(name, 'create_page', '');
			$scope.codelines.push("Page with name '"+name+"' has been created");
			
			$scope.saveHiearchy();
		}
		
		$scope.addNewText = function(pageId, name){
			if($scope.item.pages[pageId].elems)
			{
				$scope.item.pages[pageId].elems[$scope.item.pages[pageId].elems.length]={name:name,type:'elems'};
				$scope.codelines.push("Element with name '"+name+"' added to page");
			}
			else
			{
				$scope.item.pages[pageId].elems=[];
				$scope.item.pages[pageId].elems[0]={name:name};
				$scope.codelines.push("Element with name '"+name+"' added to page");
			}
			$scope.buildRequest($scope.item.pages[pageId].name, 'add_text', name);
			$scope.saveHiearchy();
		}
		
		$scope.addNewForm = function(pageId, name){
			if($scope.item.pages[pageId].elems)
			{
				$scope.currentForm = $scope.item.pages[pageId].elems.length;
				$scope.item.pages[pageId].elems[$scope.item.pages[pageId].elems.length]={name:name,type:'form'};
			}
			else
			{
				$scope.currentForm = 0;
				$scope.item.pages[pageId].elems=[];
				$scope.item.pages[pageId].elems[0]={name:name,type:'form'};
			}
			$scope.buildRequest($scope.item.pages[pageId].name, 'add_form', name);
			$scope.saveHiearchy();
		}
		
		$scope.addNewFormElem = function(pageId, formId, name, type){
			if($scope.item.pages[pageId].elems[formId].formelems)
			{
				$scope.item.pages[pageId].elems[formId].formelems[$scope.item.pages[pageId].elems[formId].formelems.length]={name:name};
			}
			else
			{
				$scope.item.pages[pageId].elems[formId].formelems=[];
				$scope.item.pages[pageId].elems[formId].formelems[0]={name:name};
			}
			var formData={ pageName: $scope.item.pages[pageId].name, formName: $scope.item.pages[pageId].elems[formId].name };
			if(jQuery.trim(type)=='text')
			{
				$scope.buildRequest(name, 'add_form_text', formData);
			}
			else if(jQuery.trim(type)=='textarea')
			{
				$scope.buildRequest(name, 'add_form_textarea', formData);
			}
			else if(jQuery.trim(type)=='coord')
			{
				$scope.buildRequest(name, 'add_form_coord', formData);
			}
			else if(jQuery.trim(type)=='image')
			{
				$scope.buildRequest(name, 'add_form_image', formData);
			}
			else if(jQuery.trim(type)=='youtube')
			{
				$scope.buildRequest(name, 'add_form_youtube', formData);
			}
			$scope.saveHiearchy();
		}
		$scope.addNewPostsPage = function(name, currentFormId, currentPageId)
		{
			if($scope.item.posts[0])
			{
				$scope.currentPostsPage = $scope.item.posts.length;
				$scope.item.posts[$scope.item.posts.length] = {name:name,formName:$scope.item.pages[currentPageId].elems[currentFormId].name};
			}
			else
			{
				$scope.currentPostsPage = 0;
				$scope.item.posts[0] = {name:name,formName:$scope.item.pages[currentPageId].elems[currentFormId].name};
			}
			var pageFormName = $scope.item.pages[currentPageId].elems[currentFormId].name + "_" + $scope.item.pages[currentPageId].name;
			$scope.buildRequest(name, 'add_posts_page', pageFormName);
			$scope.saveHiearchy();
		}
		$scope.addNewPostsPageItem = function(name, currentPostsPage, type)
		{
			//$scope.codelines.push("And You here!");
			if($scope.item.posts[currentPostsPage].postItems)
				$scope.item.posts[currentPostsPage].postItems[$scope.item.posts[currentPostsPage].postItems.length] = {name: name};
			else
			{
				$scope.item.posts[currentPostsPage] = {name:$scope.item.posts[currentPostsPage].name,formName:$scope.item.posts[currentPostsPage].formName,postItems: []};
				$scope.item.posts[currentPostsPage].postItems[0] = {name: name};
			}
			var postsPageName = $scope.item.posts[currentPostsPage].name;
			if(jQuery.trim(type)=='header')
			{
				$scope.buildRequest(name, 'add_posts_header', postsPageName);
			}
			else if(jQuery.trim(type)=='description')
			{
				$scope.buildRequest(name, 'add_posts_description', postsPageName);
			}
			else if(jQuery.trim(type)=='coord')
			{
				$scope.buildRequest(name, 'add_posts_coord', postsPageName);
			}
			else if(jQuery.trim(type)=='image')
			{
				$scope.buildRequest(name, 'add_posts_image', postsPageName);
			}
			else if(jQuery.trim(type)=='link')
			{
				$scope.buildRequest(name, 'add_posts_link', postsPageName);
			}
			else if(jQuery.trim(type)=='youtube')
			{
				$scope.buildRequest(name, 'add_posts_youtube', postsPageName);
			}
			$scope.saveHiearchy();
		}
		$scope.addNewSinglePostPage = function(name, currentPostsId)
		{
			if($scope.item.singles)
			{
				$scope.currentSinglePostPage = $scope.item.singles.length;
				$scope.item.singles[$scope.item.singles.length] = {name:name,postsPage:$scope.item.posts[currentPostsId].name};
			}
			else
			{
				$scope.item.singles = [];
				$scope.currentSinglePostPage = 0;
				$scope.item.singles[0] = {name:name,postsPage:$scope.item.posts[currentPostsId].name};
			}
			$scope.buildRequest(name, 'add_single_post_page', $scope.item.posts[currentPostsId].name);
			$scope.saveHiearchy();
		}
		$scope.addSinglePostPageItem = function(name, currentSinglePostPage, type)
		{
			if($scope.item.singles[currentSinglePostPage].singleItems)
				$scope.item.singles[currentSinglePostPage].singleItems[$scope.item.singles[currentSinglePostPage].singleItems.length] = {name: name};
			else
			{
				$scope.item.singles[currentSinglePostPage] = {name:$scope.item.singles[currentSinglePostPage].name,postsPage:$scope.item.singles[currentSinglePostPage].postsPage,singleItems: []};
				$scope.item.singles[currentSinglePostPage].singleItems[0] = {name: name};
			}
			if(jQuery.trim(type)=='header')
			{
				$scope.buildRequest(name, 'add_single_post_header', $scope.item.singles[currentSinglePostPage].name);
			}
			else if(jQuery.trim(type)=='description')
			{
				$scope.buildRequest(name, 'add_single_post_description', $scope.item.singles[currentSinglePostPage].name);
			}
			else if(jQuery.trim(type)=='coord')
			{
				$scope.buildRequest(name, 'add_single_post_coord', $scope.item.singles[currentSinglePostPage].name);
			}
			else if(jQuery.trim(type)=='image')
			{
				$scope.buildRequest(name, 'add_single_post_image', $scope.item.singles[currentSinglePostPage].name);
			}
			else if(jQuery.trim(type)=='link')
			{
				$scope.buildRequest(name, 'add_single_post_link', $scope.item.singles[currentSinglePostPage].name);
			}
			else if(jQuery.trim(type)=='youtube')
			{
				$scope.buildRequest(name, 'add_single_post_youtube', $scope.item.singles[currentSinglePostPage].name);
			}
			$scope.saveHiearchy();
		}
		$scope.buildRequest = function(name, command, data)
		{
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "execute_command",
					callback:'JSON_CALLBACK'
				},data: {
					name: name,
					data: data,
					command: command,
					user_id: localStorage.getItem("id"),
					project_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				//alert(response.data);
			});
		}
		
		$scope.changeLang = function(lang){
			localStorage.setItem("lang", lang);
			$scope.lang = lang;
		}
		
		//translation array
		if(localStorage.getItem("lang"))
		{
			$scope.lang = localStorage.getItem("lang");
		}
		else
		{
			$scope.lang = 'hb';
		}
		$scope.vocabulary=[];
		$scope.vocabulary["en"] = [];
		$scope.vocabulary["hb"] = [];
		$scope.vocabulary["en"]["Task"]="Task";
		$scope.vocabulary["hb"]["Task"]="Task";
		$scope.vocabulary["en"]["Lessons"]="Lessons";
		$scope.vocabulary["hb"]["Lessons"]="דף הבית";
		$scope.vocabulary["en"]["Post list"]="Post list";
		$scope.vocabulary["hb"]["Post list"]="בניית אפליקציה";
		$scope.vocabulary["en"]["Edit apps layout"]="Edit apps layout";
		$scope.vocabulary["hb"]["Edit apps layout"]="ערוך תבנית אפליקציה";
		$scope.vocabulary["en"]["Profile page"]="Profile page";
		$scope.vocabulary["hb"]["Profile page"]="עריכת פרופיל משתמש";
		$scope.vocabulary["en"]["Logout"]="Logout";
		$scope.vocabulary["hb"]["Logout"]="יציאה";
		$scope.vocabulary["en"]["New post name"]="New post name";
		$scope.vocabulary["hb"]["New post name"]="שם נקודת עניין";
		$scope.vocabulary["en"]["Address"]="Address";
		$scope.vocabulary["hb"]["Address"]="כתובת";
		$scope.vocabulary["en"]["Longitude"]="Longitude";
		$scope.vocabulary["hb"]["Longitude"]="קו אורך";
		$scope.vocabulary["en"]["Latitude"]="Latitude";
		$scope.vocabulary["hb"]["Latitude"]="קו רוחב";
		$scope.vocabulary["en"]["Add post"]="Add post";
		$scope.vocabulary["hb"]["Add post"]="הוסף";
		$scope.vocabulary["en"]["All lessons"]="All lessons";
		$scope.vocabulary["hb"]["All lessons"]="שעור";
		$scope.vocabulary["en"]["Edit posts"]="Edit posts";
		$scope.vocabulary["hb"]["Edit posts"]="ערוך נקודת עניין";
		$scope.vocabulary["en"]["Update"]="Update";
		$scope.vocabulary["hb"]["Update"]="שלח";
		$scope.vocabulary["en"]["Edit layout"]="Edit layout";
		$scope.vocabulary["hb"]["Edit layout"]="ערוך אפליקציה";
		$scope.vocabulary["en"]["Change main page title"]="Change main page title";
		$scope.vocabulary["hb"]["Change main page title"]="שנה את כותרת האפליקציה";
		$scope.vocabulary["en"]["Change apps title"]="Change apps title";
		$scope.vocabulary["hb"]["Change apps title"]="שנה את שם האפליקציה";
		$scope.vocabulary["en"]["Get image from device"]="Get image from device";
		$scope.vocabulary["hb"]["Get image from device"]="שמור תמונה";
		$scope.vocabulary["en"]["Get image from Camera"]="Get image from Camera";
		$scope.vocabulary["hb"]["Get image from Camera"]="העלה תמונה מהמצלמה";
		$scope.vocabulary["en"]["Rebuild application"]="Rebuild application";
		$scope.vocabulary["hb"]["Rebuild application"]="שמור את כל השינוים";
		$scope.vocabulary["en"]["App is building..."]="App is building...";
		$scope.vocabulary["hb"]["App is building..."]="המתן בבקשה...";
		$scope.vocabulary["en"]["Download updated application"]="Download updated application";
		$scope.vocabulary["hb"]["Download updated application"]="הורד האפליקציה שלך כאן";
		$scope.vocabulary["en"]["Hello"]="Hello";
		$scope.vocabulary["hb"]["Hello"]="שלום";
		$scope.vocabulary["en"]["Enter your login"]="Enter your login";
		$scope.vocabulary["hb"]["Enter your login"]="שם משתמש או כתובת דוא״ל";
		$scope.vocabulary["en"]["Password"]="Password";
		$scope.vocabulary["hb"]["Password"]="סיסמה";
		$scope.vocabulary["en"]["Login"]="Login";
		$scope.vocabulary["hb"]["Login"]="כניסה";
		$scope.vocabulary["en"]["Don't have an account?"]="Don't have an account?";
		$scope.vocabulary["hb"]["Don't have an account?"]="טרם יצרת חשבון?";
		$scope.vocabulary["en"]["Register"]="Register";
		$scope.vocabulary["hb"]["Register"]="הרשמה";
		$scope.vocabulary["en"]["Username"]="Username";
		$scope.vocabulary["hb"]["Username"]="שם משתמש";
		$scope.vocabulary["en"]["Your email"]="Your email";
		$scope.vocabulary["hb"]["Your email"]="כתובת דוא״ל";
		$scope.vocabulary["en"]["Registration"]="Registration";
		$scope.vocabulary["hb"]["Registration"]="הצטרף ל";
		$scope.vocabulary["en"]["Already have an account?"]="Already have an account?";
		$scope.vocabulary["hb"]["Already have an account?"]="משתמש קיים?";
		$scope.vocabulary["en"]["login here"]="login here";
		$scope.vocabulary["hb"]["login here"]="אני משתמש רשום";
		$scope.vocabulary["en"]["Build your application"]="Build your application";
		$scope.vocabulary["hb"]["Build your application"]="בית הספר לבניית אפליקציות";
		$scope.vocabulary["en"]["or"]="or";
		$scope.vocabulary["hb"]["or"]="או";
		$scope.vocabulary["en"]["Enter class id"]="Enter class id";
		$scope.vocabulary["hb"]["Enter class id"]="קוד קורס";
		$scope.vocabulary["en"]["Join class"]="Join class";
		$scope.vocabulary["hb"]["Join class"]="הצטרף לקורס";
		$scope.vocabulary["en"]["Join a trial lesson"]="Join a trial lesson";
		$scope.vocabulary["hb"]["Join a trial lesson"]="הצטרף לשעורי ניסיון";
		$scope.vocabulary["en"]["Save text"]="Save text";
		$scope.vocabulary["hb"]["Save text"]="טקסט שמור";
		$scope.vocabulary["en"]["Page adding done!"]="Page adding done!";
		$scope.vocabulary["hb"]["Page adding done!"]="הודעה הנתונים נשמרו אישור";
		$scope.vocabulary["en"]["Coding page"]="Coding page";
		$scope.vocabulary["hb"]["Coding page"]="פיתוח אפליקציה";
		$scope.vocabulary["en"]["Add post adding and registration page"]="Add post adding and registration page";
		$scope.vocabulary["hb"]["Add post adding and registration page"]="אפשר למשתמשים להוסיף נקודות עניין";
		$scope.vocabulary["en"]["App's elements tree"]="App's elements tree";
		$scope.vocabulary["hb"]["App's elements tree"]="עץ האפליקציה";
		$scope.vocabulary["en"]["The task you trying to reach out is locked, you need to finish current task first!"]="The task you trying to reach out is locked, you need to finish current task first!";
		$scope.vocabulary["hb"]["The task you trying to reach out is locked, you need to finish current task first!"]="הודעה עליך לכתוב את התשובה שלך בטרם תוכל להמשיך למשימה הבאה. אישור";
		$scope.vocabulary["en"]["Next"]="Next";
		$scope.vocabulary["hb"]["Next"]="הבא";
		$scope.vocabulary["en"]["Previous"]="Previous";
		$scope.vocabulary["hb"]["Previous"]="קודם";
		$scope.vocabulary["en"]["Your final answer"]="Your final answer";
		$scope.vocabulary["hb"]["Your final answer"]="לאחר סיעור מוחות, יש כתוב כאן את התשובה הקבוצתית";
		$scope.vocabulary["en"]["Your answer or comment"]="Your answer or comment";
		$scope.vocabulary["hb"]["Your answer or comment"]="כתוב כאן את התשובה שלך";
		$scope.vocabulary["en"]["Insert answer"]="Insert answer";
		$scope.vocabulary["hb"]["Insert answer"]="שמור תשובה הקבוצתית";
		$scope.vocabulary["en"]["Final answer is"]="Final answer is";
		$scope.vocabulary["hb"]["Final answer is"]="התשובה הסופית היא";
		
		
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
				$scope.addPageFunc('Add post page', 'www/menu.html', 'add_registration_page');
			}
			if(item===false)
			{
				$scope.addPageFunc('Add post page', 'www/menu.html', 'remove_registration_page');
			}
		}
		$scope.addPageFunc = function(tag_name, file_path, page_type){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "change_app_page",
				},
				data: {
					tag_name: tag_name,
					file_path: file_path,
					page_type: page_type,
					proj_id: localStorage.getItem("project_id")
				},
			}).then(function(response) {
				jQuery("#loader").fadeOut();
				//alert(response);
				alert($scope.vocabulary[$scope.lang]["Page adding done!"]);
				//alert("Page removing done!");
			});
		}
		
		
		$scope.project_id = localStorage.getItem("project_id");
		//function get a list of posts from server or opens a login page if user is not registered
		$scope.menuEditClickFunc = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php?proj_id="+localStorage.getItem("project_id"), 
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
		$scope.appLinkDownload = {link:"#", text:$scope.vocabulary[$scope.lang]['App is building...']};
		$scope.getAppLink = function(){
			$scope.appLinkDownload.link = "#";
			$scope.appLinkDownload.text = $scope.vocabulary[$scope.lang]['App is building...'];
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
					$scope.appLinkDownload.text = $scope.vocabulary[$scope.lang]['Download updated application'];
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
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
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
			//ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
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
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
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
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
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
			ft.upload(fileURI, encodeURI("http://letsgetstartup.com/wp-admin/admin-ajax.php"), win, fail, options);
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "list_lesson_menu",
					project_id: localStorage.getItem("project_id"),
					user_id: localStorage.getItem("id"),
					callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				//alert(response.data);
				jQuery("#loader").fadeOut();
				$scope.milestoneList = response.data;
				/*$.each(response.data, function(key,value){
					alert(key);
				});*/
			});
		}
		if(localStorage.getItem("login"))
		{
			//if(localStorage.getItem("type")=="student")
			$scope.addClassesToLeftMenu();
		}
		
		//declaring variable for task commenting form
		$scope.newTaskComment = {content:"", final_answer:""};
		
		//function getting classes if someone wants to join class
		$scope.joinClass = function(){
			//localStorage.setItem("chosen_proj_id", proj_id);
			$scope.registrationType = 'join';
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
			if($scope.milestoneList[id].block_status==undefined)
			{
				menu.setMainPage('classes-list.html', {closeMenu: true});
				return;
			}
			if($scope.milestoneList[id].block_status!="enabled")
				return;
			if($scope.dialog)
				$scope.dialog.hide();
			if($scope.milestoneList[id].status != "locked")
			{
				if($scope.milestoneList[id].status != "done"||$scope.milestoneList[id].type!="coding-task")
				{
					//alert(id);
					//alert($scope.milestoneList[id].type);
					$scope.currentCommentsTaskId = $scope.milestoneList[id].id;
					$scope.currentTaskLessonId = id;
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
						$scope.setTaskUnlockedDone(id, "done");
						$scope.getMilestoneMeta($scope.milestoneList[id].id);
						if($scope.next != "last")
						{
							if($scope.milestoneList[$scope.next].status=="locked")
								$scope.setTaskUnlockedDone($scope.next, "unlocked");
						}
					}
					else if($scope.milestoneList[id].type=="task")
					{
						//if($scope.milestoneList[id].final_answer)
						//$scope.final_answer=$scope.milestoneList[id].final_answer;
						$scope.getFinalAnswer($scope.currentCommentsTaskId);
						$scope.getTaskComment($scope.currentCommentsTaskId);
					}
					else if($scope.milestoneList[id].type=="coding-task")
					{
						$scope.menuCodingPageClick();
					}
				}
				else if($scope.next == "last")
				{
					menu.setMainPage('classes-list.html', {closeMenu: true});
				}
				else if($scope.milestoneList[id].status == "done"&&$scope.milestoneList[id].type=="coding-task")
				{
					menu.setMainPage('classes-list.html', {closeMenu: true});
				}
			}
			else
			{
				alert($scope.vocabulary[$scope.lang]["The task you trying to reach out is locked, you need to finish current task first!"]);
			}
			//menuCodingPageClick()
		}
		
		$scope.menuTeacherLessonClickFunc = function(id,$event){
			if(jQuery($event.target).attr("type")=="checkbox")
				return;
			if(jQuery($event.target).attr("class")=="data-time")
				return;
			if($scope.dialog)
				$scope.dialog.hide();
			$scope.currentCommentsTaskId = $scope.milestoneList[id].id;
			$scope.currentTaskLessonId = id;
			$scope.milestone_title=$scope.milestoneList[id].title;
			$scope.milestone_content=$scope.milestoneList[id].content;
			$scope.milestone_content=$sce.trustAsHtml($scope.milestone_content);
			$scope.milestone_info=$scope.milestoneList[id].info;
			$scope.milestone_info=$sce.trustAsHtml($scope.milestone_info);
			$scope.info_video=$scope.milestoneList[id].video;
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
			else if($scope.milestoneList[id].type=="task")
			{
				$scope.getFinalAnswer($scope.currentCommentsTaskId);
				$scope.getTaskComment($scope.currentCommentsTaskId);
			}
			else if($scope.milestoneList[id].type=="coding-task")
			{
				//$scope.menuCodingPageClick();
			}
		}
		
		$scope.setTaskUnlockedDone =function(id, new_status){
			$scope.milestoneList[id].status = new_status;
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				params: {
					action: "change_status",
				},
				data: {
					task_id: $scope.milestoneList[id].id,
					status: new_status,
					user_id: localStorage.getItem("id"),
				},
			}).then(function(response) {
				//alert(response.data);
			});
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "get",
				params: {
					action: "list_task_comments_mobile",
					task_id: task_id,
					//callback:'JSON_CALLBACK'
				},
			}).then(function(response) {
				alert(response.data);
				$scope.currentTaskComments = response.data;
				menu.setMainPage('task.html', {closeMenu: true});
			});
		}
		
		$scope.getFinalAnswer = function(task_id){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
		
		$scope.checkGoogle = function(link){
			var matches = link.match(/^(http(s)?:\/\/)?docs.([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/);
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
		
		$scope.refreshComments = function(){
			$scope.getFinalAnswer($scope.currentCommentsTaskId);
			$scope.getTaskComment($scope.currentCommentsTaskId);
		}
		
		//function sending new task comment to the server
		$scope.insertTaskComment = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				if($scope.milestoneList[$scope.currentTaskLessonId].status=="unlocked")
				{
					$scope.setTaskUnlockedDone($scope.currentTaskLessonId, "done");
					if($scope.next!="last")
					{
						if($scope.milestoneList[$scope.next].status=="locked")
							$scope.setTaskUnlockedDone($scope.next, "unlocked");
					}
				}	 
			});
		}
		$scope.insertFinalAnswer = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
			$scope.user_type = localStorage.getItem("type");
		}
		
		//checking if set page to login or go to home main page
		if(localStorage.getItem("login"))
		{
			if(localStorage.getItem("type")=="student")
				menu.setMainPage('classes-list.html', {closeMenu: true});
			else
				menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
			//$scope.menuEditClickFunc();
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
		
		$scope.getUsersPerProject = function(){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					user_id: localStorage.getItem("id"),
				},
				params: {
					'action': "get_teacher_courses",
					callback:'JSON_CALLBACK'
				}
			}).then(function(response) {
				$scope.coursesIDs = response.data;
			});
			
			
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					project_id: localStorage.getItem("project_id")
				},
				params: {
					'action': "get_students_of_proj",
				}
			}).then(function(response) {
				//alert(response.data);
				//alert(response.data[0].data.status);
				$scope.projStudents = response.data;
				menu.setMainPage('teacher-coding-apps.html', {closeMenu: true});
			});
		}
		$scope.switchStudent = function(){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					project_id: localStorage.getItem("project_id")
				},
				params: {
					'action': "get_students_of_proj",
				}
			}).then(function(response) {
				//alert(response.data);
				//alert(response.data[0].data.status);
				$scope.projStudents = response.data;
				menu.setMainPage('switch-user-page.html', {closeMenu: true});
			});
		}
		
		$scope.goToTeachCodingPage = function(id){
			//alert(id);
		}
		
		//function adds posts to server database through api and renewing the list of posts
		$scope.addItemFunc = function(name,image){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
				jQuery("#loader").fadeIn();
				$http({
					url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
						localStorage.setItem("first_name",response.data['user_name']);
						localStorage.setItem("id",response.data['user_id']);
						localStorage.setItem("project_id",response.data['project_id']);
						localStorage.setItem("type",response.data['user_type']);
						$scope.user_type = response.data['user_type'];
						$scope.user_login = response.data['user_login'];
						$scope.project_id = response.data['project_id'];
						if($scope.registrationType=="join")
						{
							$scope.addClassesToLeftMenu();
							//$scope.menuEditClickFunc();
							menu.setMainPage('classes-list.html', {closeMenu: true});
						}
						else
						{
							$scope.addClassesToLeftMenu();
							menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
						}
						//menu.setMainPage('login.html', {closeMenu: true});
						//$scope.swappable = true;
						$scope.swappable = true;
					}
					$scope.registration_error = response.data['error'];
					jQuery("#loader").fadeOut();
				});
		}
		
		$scope.userRegisterByTeacher = function(){
				jQuery("#loader").fadeIn();
				$http({
					url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
					$scope.getUsersPerProject();
					jQuery("#loader").fadeOut();
				});
		}
		
		$scope.getProjectSwitchIds = function(){
			jQuery("#loader").fadeIn();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					user_id: localStorage.getItem("id"),
				},
				params: {
					'action': "get_teacher_courses",
					callback:'JSON_CALLBACK'
				}
			}).then(function(response) {
				//alert(response.data);
				$scope.teacherCourses = response.data;
				menu.setMainPage('switch-project-id.html', {closeMenu: true});
				jQuery("#loader").fadeOut();
			});
		}
		
		$scope.switchCourse = function(id){
			localStorage.setItem("project_id",id);
			$scope.project_id = id;
			$scope.addClassesToLeftMenu();
		}
		
		$scope.new_user = {name:""};
		if (!Date.now) {
			Date.now = function() { return new Date().getTime(); }
		}
		
		$scope.addNewUser = function(){
			/*data: {
						registration_data: $scope.registration,
						project_id: $scope.chosenProjId,
						registration_type: $scope.registrationType
					},*/
			//$scope.userRegister();
			$scope.registration.name = $scope.new_user.name;
			$scope.registration.email = Date.now()+"@mail.com";
			$scope.registration.password = "111222333";
			$scope.chosenProjId = localStorage.getItem("project_id");
			$scope.registrationType = "join";
			$scope.userRegisterByTeacher();
			//alert($scope.registration.email);
			$scope.new_user.name = "";
		}
		
		//logging in the student user
		$scope.userLogin = function(){
				jQuery("#loader").fadeIn();
				$http({
					url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
					//alert(response.data);
					if(!response.data['error'])
					{
						jQuery("#loader").fadeOut();
						localStorage.setItem("login",response.data['user_login']);
						localStorage.setItem("first_name",response.data['user_name']);
						localStorage.setItem("id",response.data['user_id']);
						localStorage.setItem("project_id",response.data['project_id']);
						localStorage.setItem("type",response.data['user_type']);
						localStorage.setItem("status",response.data['students_status']);
						$scope.user_type = response.data['user_type'];
						$scope.students_status = response.data['students_status'];
						$scope.students_login = response.data['user_login'];
						if(response.data['user_type'] == "student")
						{
							$scope.addClassesToLeftMenu();
							menu.setMainPage('classes-list.html', {closeMenu: true});
						}
						else
						{
							$scope.addClassesToLeftMenu();
							menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
						}
						//$scope.menuEditClickFunc();
						$scope.swappable = true;
						$scope.user_login = response.data['user_login'];
						$scope.project_id = response.data['project_id'];
						if(response.data['users_profile_image'])
						{
							localStorage.setItem("users_profile_image",response.data['users_profile_image']);
							$scope.userdata = {profile_image: localStorage.getItem("users_profile_image")};
						}
						jQuery("#loader").fadeOut();
					}
					$scope.registration_error = response.data['error'];
				});
		}
		
		$scope.switchUser=function(id,login,usersName,profileImage){
			jQuery("#loader").fadeIn();
			localStorage.setItem("login",login);
			localStorage.setItem("first_name",usersName);
			$scope.students_login = login;
			$scope.students_name = usersName;
			localStorage.setItem("id",id);
			$scope.addClassesToLeftMenu();
			menu.setMainPage('classes-list.html', {closeMenu: true});
			if(profileImage!="")
				localStorage.setItem("users_profile_image",profileImage);
		}
		  
		 if(localStorage.getItem("users_profile_image")) 
			 $scope.userdata = {profile_image: localStorage.getItem("users_profile_image")};
		 else $scope.userdata = {profile_image: 'img/anon.gif'};
		//logout the user and pushing the login page
		$scope.menuLogoutClickFunc = function(){
			$scope.swappable = false;
			localStorage.removeItem("login");
			localStorage.removeItem("type");
			localStorage.removeItem("project_id");
			localStorage.removeItem("status");
			menu.setMainPage('login.html', {closeMenu: true});
		}
		
		//listing the posts
		$http({
			url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
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
		$scope.setFormInfoTab = function(destId,currentId)
		{
			jQuery(".info-form-holder input").removeClass("error");
			var error = 0;
			jQuery(".info-block[data-info-block="+currentId+"] .info-form-holder input").each(function(){
				//alert(jQuery(this).val());
				/*if(jQuery(this).val()=="")
				{
					error++;
					jQuery(this).addClass("error");
				}*/
			});
			if(error == 0)
			{
				jQuery(".info-form-holder").slideUp();
				jQuery(".info-block[data-info-block="+destId+"] .info-form-holder").slideDown();
				if(destId==5)
				{
					$scope.userRegister();
				}
			}
		}
		$scope.toggleCourseContent = function(courseId)
		{
			if(jQuery(".course-items-managing[data-course-id="+courseId+"]").is(":visible"))
			{
				jQuery(".course-items-managing[data-course-id="+courseId+"]").slideUp();
				jQuery(".display-course-content[ng-click='toggleCourseContent("+courseId+")']").text("+");
			}
			else
			{
				jQuery(".course-items-managing[data-course-id="+courseId+"]").slideDown();
				jQuery(".display-course-content[ng-click='toggleCourseContent("+courseId+")']").text("-");
			}
		}
		$scope.toggleCourseItemContent = function(itemId)
		{
			if(jQuery(".course-udate-holder[data-item-id="+itemId+"]").is(":visible"))
			{
				jQuery(".course-udate-holder[data-item-id="+itemId+"]").slideUp();
				jQuery(".display-item-content[ng-click='toggleCourseItemContent("+itemId+")']").text("+");
			}
			else
			{
				jQuery(".course-udate-holder[data-item-id="+itemId+"]").slideDown();
				jQuery(".display-item-content[ng-click='toggleCourseItemContent("+itemId+")']").text("-");
			}
		}
		jQuery(document).on("click",".teacher_enabling", function(e){
			//if("")
			var id = jQuery(this).attr("data-id");
			var value = "";
			var key = "block_status";
			menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
			if(jQuery(this).is(":checked"))
			{
				value = "enabled";
				$scope.addPostMeta(id,key,value);
				$scope.milestoneList[jQuery(this).attr("data-arr-id")].block_status = value;
				menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
			}
			else
			{
				value = "disabled";
				$scope.addPostMeta(id,key,value);
				$scope.milestoneList[jQuery(this).attr("data-arr-id")].block_status = value;
				menu.setMainPage('teacher-classes-list.html', {closeMenu: true});
			}
		});
		jQuery(document).on("click",".mark-student", function(e){
			var id = jQuery(this).attr("data-id");
			var value = "";
			var key = "students_status";
			if(jQuery(this).is(":checked"))
			{
				value = "super_student";
				$scope.addUserMeta(id,key,value);
			}
			else
			{
				value = "simple_student";
				$scope.addUserMeta(id,key,value);
			}
		});
		//data-time
		$scope.currentTimeId=0;
		var timeObj = {};
		var timeSecStr="";
		var timeMinStr="";
		setInterval(function(){
			if($scope.currentTimeId!=0&&$scope.seconds!=0)
			{
				$scope.seconds = $scope.seconds-1;
				timeObj = secondsToTime($scope.seconds);
				timeSecStr = ":"+timeObj.s;
				timeMinStr = ":"+timeObj.m;
				if(timeObj.s>=0&&timeObj.s<=9)
					timeSecStr = ":0"+timeObj.s;
				if(timeObj.m>=0&&timeObj.m<=9)
					timeMinStr = ":0"+timeObj.m;
				jQuery("div[data-time-id='"+$scope.currentTimeId+"']").find(".data-time-holder").text(timeObj.h+timeMinStr+timeSecStr);
			}
			else if($scope.currentTimeId!=0&&$scope.seconds==0)
			{
				jQuery("div[data-time-id='"+$scope.currentTimeId+"']").find(".data-time-holder").text("Time expired!");
			}
		},1000);
		jQuery(document).on("click",".data-time", function(e){
			jQuery(".data-time-holder").text("");
			jQuery(".data-time").text("Play");
			jQuery(this).text("");
			$scope.seconds = jQuery(this).attr("data-time-seconds");
			$scope.currentTimeId = jQuery(this).parent().attr("data-time-id");
		});
		jQuery(document).on("change","select[name=current-user-id]", function(){
			//alert(jQuery(this).val());
			var user_id = jQuery(this).attr("data-user-id");
			var course_id = jQuery(this).val();
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					user_id: user_id,
					course_id: course_id,
				},
				params: {
					'action': "change_course_for_student",
					callback:'JSON_CALLBACK'
				}
			}).then(function(response) {
				//alert(response.data);
			});
		});
		$scope.addPostMeta = function(id,key,value){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					id: id,
					key: key,
					value: value
				},
				params: {
					'action': "insert_postmeta_mobile",
					//callback:'JSON_CALLBACK'
				}
			}).then(function(response) {
				//alert(response.data);
			});
		}
		$scope.addUserMeta = function(id,key,value){
			$http({
				url: "http://letsgetstartup.com/wp-admin/admin-ajax.php", 
				method: "POST",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: {
					id: id,
					key: key,
					value: value
				},
				params: {
					'action': "insert_usermeta_mobile",
					//callback:'JSON_CALLBACK'
				}
			}).then(function(response) {
				//alert(response.data);
			});
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
function secondsToTime(secs)
{
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}