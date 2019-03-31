var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var sftools = require('./sf-tools');
var app = express();
var PORT = process.env.PORT || 5000;

//SF app secret
var SF_CANVASAPP_CLIENT_SECRET = process.env.SF_CANVASAPP_CLIENT_SECRET;


app.use('/public',express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(cookieParser());

//session enabled to store token data
app.use(session({
    secret: 'cs secret'
}));

app.use(bodyParser.json({type:'application/*+json'}));

app.use(logger('combined'));

app.get('/',function(req,res){
    //get the canvas details from session (if any)
    var canvasDetails = sftools.getCanvasDetails(req);
    //the page knows if the user is logged into SF
    res.render('index',{canvasDetails : canvasDetails});
});

//canvas callback
app.post('/canvas/callback', function(req,res){
    sftools.canvasCallback(req.body, SF_CANVASAPP_CLIENT_SECRET, function(error, canvasRequest){
        if(error){
            res.statusCode = 400;
            return res.render('error',{error: error});
        }
        //saves the token details into session
        sftools.saveCanvasDetailsInSession(req,canvasRequest);
        return res.redirect('/');
    });
});

exports.server = app.listen(PORT, function() {
    console.log("Listening on " + PORT);
});

