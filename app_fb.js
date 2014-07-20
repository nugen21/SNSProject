var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , everyauth = require('everyauth') //everyauth 모듈을 추가합니다.
  , path = require('path')
  , conf = require('./conf'); // 로그인 관련 conf 모음.

everyauth.debug = true;

var app = express();

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
	var user;
	if (arguments.length === 1) { // password-based
		user = sourceUser = source;
		user.id = ++nextUserId;
		return usersById[nextUserId] = user;
	} else { // non-password-based
		user = usersById[++nextUserId] = {id: nextUserId};
		user[source] = sourceUser;
	}
	return user;
}

var usersByFbId = {};
//var usersByGoogleId = {};

//인증받지 않은 상태로 접속할 경우 인증을 받도록 리다이렉션 합니다.
var check_auth = function (req, res, next){
	if (!req.loggedIn) {
//		res.redirect('/auth/google');

		res.redirect('/auth/facebook');
	}

	next();
};


//현재 세션에 접속되어 있는 사용자가 아니면 사용자를 추가하도록 합니다.
var addUser = function (source, sourceUser) {
  var user;
  if (arguments.length === 1) {
    user = sourceUser = source;
    user.id = ++nextUserId;
    
    return usersById[nextUserId] = user;
  } else {
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

////구글 계정을 통해 인증을 처리하기 위한 부분입니다.
//everyauth.google
//  .entryPath('/auth/google')
//  .callbackPath('/auth/google/callback')
//  .appId('470639416334.apps.googleusercontent.com')
//  .appSecret('LhfnkRI3wpRnU6ov6lecw9aS')
//  .scope('https://www.googleapis.com/auth/userinfo.profile')
//  .handleAuthCallbackError( function (req, res) {
//    
//  })
//  .findOrCreateUser( function (session, accessToken, extra, googleUser) {
//    googleUser.refreshToken = extra.refresh_token;
//    googleUser.expiresIn = extra.expires_in;
//    
//    //해당 구글 아이디를 통해 접속했던 것이 확인되지 않으면 사용자를 추가하고 그 값을 반영합니다.
//    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
//  })
//  .redirectPath('/');
 
//Facebook 계정 인증
everyauth.facebook
	.entryPath('/auth/facebook')
	.callbackPath('/auth/facebook/callback')
	.appId(conf.fb.appId)
	.appSecret(conf.fb.appSecret)
	.scope('email,user_location,user_photos')
//	.scope('public_profile, user_about_me, user_photos')
	.fields('id, name, email, picture')
	.handleAuthCallbackError( function(req, res) {

	})
	.findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    }).redirectPath('/');

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
   app.use(express.cookieParser());
//  app.use(express.cookieParser('znzlvktj'));  
//  app.use(express.session({secret:'qlalfzl'}));
  app.use(express.session({secret: 'asdfgh'}));
  app.use(everyauth.middleware(app));
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExeption: true, showStack: true }));
});

//필요한 API들의 페이지 라우팅입니다.
app.get('/', check_auth, routes.index);
app.get('/users', check_auth, user.list);
app.get('/load', check_auth, routes.load);
app.get('/logout', check_auth, routes.logout);
app.post('/write', check_auth, routes.write);
app.post('/like', check_auth, routes.like);
app.post('/unlike', check_auth, routes.unlike);
app.post('/comment', check_auth, routes.comment);
app.post('/del', check_auth, routes.del);
app.post('/modify', check_auth, routes.modify);


//서버를 생성하고 바로 실행합니다.
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
