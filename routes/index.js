
/*
 * GET home page.
 */

var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://nugen21:online14@ds037627.mongolab.com:37627/heroku_app27605447'); //database에 연결합니다.
var Schema = mongoose.Schema;

//Post 모델을 정의합니다.
var Post = new Schema({
	author: String, // 작성자.
	picture: String, // 작성자 사진.
	contents: String, // 글 내용.
	date: Date, // 작성 일자.
	like: Number, // 좋아요 카운트.
	comments: Array //코멘트는 각 포스팅에 배열 형태로 구성되어 있습니다.
});

var postModel = mongoose.model('Post', Post);


//인덱스 페이지를 처리하는 부분입니다. 구글 계정을 통해 인증되었다는 것을 가정하고, 인증 정보로부터 이름과 사진을 가져옵니다.
//exports.index = function(req, res){ 
//	if (req.session.auth) {
//		
//		var name = req.session.auth.google.user.name;
//		var picture = req.session.auth.google.user.picture;
//
//		res.render('index', { name: name, picture: picture });
//	}
//	else {
//		res.render('index', { name: "", picture: "" });
//	}
//};

//index.js 페이지를 처리하는 부분. 페이스북 계정을 통해 인증되었다면 인증 정보로부터 이름과 사진을 가져옴.
exports.index = function(req, res) {
	if(req.session.auth) {
		// 이름과 사진 가져오는 부분 - scope에 정의된
		var name = req.session.auth.facebook.user.name;
		var picture = req.session.auth.facebook.user.picture.data.url;

		res.render('index', { name: name, picture: picture });
		console.log(name);
		console.log(picture);
	} else {
		res.render('index', { name: "", picture: "" });
	}
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
}

//포스팅 정보를 로딩하는 부분입니다.
exports.load = function(req, res) {
	//Post 모델의 모든 정보를 JSON형태로 반환한다.
	postModel.find({}, function(err, data) {
		res.json(data);
	});
};

//포스팅을 데이터 베이스에 쓰는 부분입니다.
exports.write = function(req, res) {
	var author = req.body.author;
	var picture = req.body.picture;
	var contents = req.body.contents;
	var date = Date.now();
	
	var post = new postModel();
	
	post.author = author;
	post.picture = picture;
	post.contents = contents;
	post.date = date;
	post.like = 0;
	post.comments = [];
	
	//mongoose를 이용하여 실제 저장하는 부분입니다.
	post.save(function (err) {
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};

//LIKE 버튼을 눌렀을 때 발생하는 요청을 처리하는 부분입니다. 
exports.like = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	//_id값을 통해 해당 포스팅에 대한 포스팅을 찾고 그 포스팅의 like값을 증가시키고 저장합니다.
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.like++;
			
			post.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({status: "SUCCESS"});
				}
			});
		}
	});
};

//LIKE를 취소하는 부분입니다.
exports.unlike = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			if (post.like > 0) {
				post.like--;
				
				post.save(function (err) {
					if (err) {
						throw err;
					}
					else {
						res.json({status: "SUCCESS"});
					}
				});
			}
		}
	});
};

//포스팅 삭제 요청을 처리합니다.
exports.del = function(req, res) {
	var _id = req.body._id;
	
	postModel.remove({_id: _id}, function(err, result) {
		if (err) {
			throw err;
		}
		else {
			res.json({status: "SUCCESS"});
		}
	});
};

//포스팅 내용을 수정하는 부분입니다.
exports.modify = function(req, res) {
	var _id = req.body._id;
	var contents = req.body.contents;
	
	
	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.contents = contents;
			
			post.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({status: "SUCCESS"});
				}
			});
		}
	});
};

//코멘트를 남기는 부분입니다.
exports.comment = function(req, res) {
	var _id = req.body._id;
	var author = req.body.author;
	var comment = req.body.comment;
	var date = Date.now();

	postModel.findOne({_id: _id}, function(err, post) {
		if (err) {
			throw err;
		}
		else {
			post.comments.push({author: author, comment: comment, date: date});
			
			post.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({status: "SUCCESS"});
				}
			});
		}
	});
			
};