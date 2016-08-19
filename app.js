http = require("http");
express = require("express");
app = express();

app.use('/', express.static('static'));
app.get('/api/*', function (req,res){
	console.log(req.params[0]);
	var opts = {
		host: "localhost",
		port: 10772,
		path: "/api/"+req.params[0],
		auth: "akari:bakuhatsu",
		method:req.method
	};
	hReq = http.request(opts, function(hRes){
		res.writeHead(hRes.statusCode, {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": hRes.headers["content-type"]
		});
		hRes.setEncoding("utf8");
		hRes.on("data",function(d){
			res.write(d);
		});
		
		hRes.on("aborted", function(){
			res.end();
		});
		hRes.on("close", function(){
			res.end();
		});
		hRes.on("end", function(){
			res.end();
		});
	});
	hReq.end();
});
app.listen(3000);
