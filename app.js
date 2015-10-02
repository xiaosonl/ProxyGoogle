var express = require('express')
    ,app = express()
    ,request = require('request')
    ,Agent = require('socks5-https-client/lib/Agent')
    ,fs = require('fs')
    ,url = require('url')
    ,config = require('./config');

console.log(config);

app.use(express.static('public'));

app.get('/', function(req, res){
    var data = fs.readFileSync('index.html').toString();
    res.send(data);
});

app.get('/search', function(req, res){
    var url =  'https://www.google.com/search?q=' + encodeURIComponent(req.query.q);
    if(req.query.start){
        url += "&start=" + req.query.start;
    }
    proxyRequest(url, function(err, resproxy) {
        res.send(err || resproxy.body);
    });
});

function proxyRequest(url, callback){
    var reqOption = {
        url: url,
        encoding: 'utf-8',
        strictSSL: true
    };
    if(config.evn == 'dev'){
        reqOption.agentClass = Agent;
        reqOption.agentOptions = {
            socksHost: '127.0.0.1', // Defaults to 'localhost'.
            socksPort: 1080 // Defaults to 1080.
        };
    }
    request(reqOption, callback);
}

app.get('/url', function (req, res) {
    var targetUrl = req.query.q;
    targetUrl = url.parse(targetUrl);
    var hostname = targetUrl.hostname;
    if(config.proxySites.indexOf(hostname) > -1){
        proxyRequest(targetUrl.href, function(err, resproxy) {
            res.send(err || resproxy.body);
        });
    }else{
        res.redirect(targetUrl.href);
    }
});


app.listen(config.port);
console.log("App is runing");