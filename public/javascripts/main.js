var timer = null;

var editing = false;

//포스팅 목록을 로딩하고 출력하는 부분입니다.
var load = function () {

	if (!editing) {
		$.get('/load', function (data) {
			$("#wall").empty();
			
			$(data).each(function (i) {
				var id = this._id;
				
				$("#wall").prepend("<div class='item'><div class='left'></div><div class='right'></div></div>");
				
				$("#wall .item:first .left").append("<div class='photo_thumb' style='background-image:" + this.picture + "'></div>");
				$("#wall .item:first .right").append("<div class='author'><b>" + this.author + "</b> (" + this.date + ")&nbsp;&nbsp; | <span class='text_button modify'>MODIFY</span> | <span class='text_button del'>DELETE</span> | <span class='text_button like'>LIKE</span></div>");
				$("#wall .item:first .right").append("<div class='contents " + id + "'>" + this.contents + "</div>");
				$("#wall .item:first .right").append("<div class='likes'>LIKE: " + this.like + "</div>");
				
				$("#wall .item:first .right").append("<div class='comments'></div>");
				
				
				$(this.comments).each(function (j) {
					$("#wall .item:first .right .comments").append("<div class='comment_item'>" + this.author + ": " + this.comment + "</div>");
				});
				
				$("#wall .item:first .comments").append("<input class='input_comment' type='text' /><input class='comment_button' type='button' value='COMMENT' />");
				
				
				var id = this._id;
				
				$("#wall .item:first .input_comment").on("focus", function() {
					editing = true;
				});
				
				$("#wall .item:first .input_comment").keypress(function(evt){
					if((evt.keyCode || evt.which) == 13){
						if (this.value != "") {
							comment(this.value, id);
							
							evt.preventDefault();
							
							$(this).val("");
							
							editing = false;
						}
					}
				});
				
				$("#wall .item:first .comment_button").click(function(evt) {
					comment($("#wall .item:first .input_comment").val(), id);
					
					editing = false;
				});
				
				$("#wall .item:first .modify").click(function(evt) {
					editing = true;
					
					var contents = $("#wall ." + id).html();
					$("#wall ." + id).html("<textarea id='textarea_" + id + "' class='textarea_modify'>" + contents + "</textarea>");
					
					$("#textarea_" + id).keypress(function(evt){
						if((evt.keyCode || evt.which) == 13){
							if (this.value != "") {
								modify(this.value, id);
								
								evt.preventDefault();
								
								editing = false;
							}
						}
					});
				});
				
				$("#wall .item:first .del").click(function(evt) {
					del(id);
				});
				
				$("#wall .item:first .like").click(function(evt) {
					like(id);
				});
			});
			
			
			
			
			
		});
	}
	$("#logout_button").bind('click', function(req) {
		req.logout();
	});
};

//쓰기 요청을 처리하는 부분입니다.
var write = function (contents) {
	var postdata = {
		'author': $("#author").val(),
		'contents': contents,
		'picture': $("#message").find(".photo").css('background-image')
	};

	$.post('/write', postdata, function() {
		load();
	});
};

//수정 요청을 처리하는 부분입니다.
var modify = function (contents, id) {
	var postdata = {
		'author': $("#author").val(),
		'contents': contents,
		'_id': id
	};

	$.post('/modify', postdata, function() {
		load();
	});
};

//댓글을 달 때 처리하는 부분입니다.
var comment = function (comment, id) {
	var postdata = {
		'author': $("#author").val(),
		'comment': comment,
		'_id': id
	};

	$.post('/comment', postdata, function() {
		load();
	});
};

//포스팅을 삭제할 때 처리하는 부분입니다.
var del = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/del', postdata, function() {
		load();
	});
};

//LIKE를 눌렀을 때를 처리하는 부분입니다.
var like = function (id) {
	var postdata = {
		'_id': id
	};

	$.post('/like', postdata, function() {
		load();
	});
};

//페이지가 로딩되면 수행을 시작합니다.
$(document).ready(function () {
	//에디팅을 시작하면 새로 고침이 되지 않도록 처리합니다.
	$("#message textarea").on("focus", function() {
		editing = true;
	});

	//작성을 완료하고 엔터키를 누르면 메시지가 써지도록 처리하는 부분입니다.
	$("#message textarea").keypress(function(evt){
		if((evt.keyCode || evt.which) == 13){
			if (this.value != "") {
				write(this.value);
				
				evt.preventDefault();
				
				$(this).val("");
				
				editing = false;
			}
		}
	});
	
	//쓰기 버튼을 눌렀을 때를 처리하는 부분이다.
	$("#write_button").click(function(evt) {
		write($("#message textarea").val());
		
		editing = false;
	});
	
	//내용을 로딩하는 부분이다.
	load();
	
	//5초마다 새로 고치도록 처리합니다.
	timer = setInterval("load();", 5000);
});