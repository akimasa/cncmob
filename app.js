http = require("http");
express = require("express");
app = express();

app.use('/', express.static('static'));
var fs = require("fs");
var settings = JSON.parse(fs.readFileSync("settings.json",'utf8'));
var mqtt = require("mqtt");
var mqttc = mqtt.connect(settings.mqttendpoint,{username:settings.mqttusername,password:settings.mqttpassword});
mqttc.on("connect", function(){
	mqttc.subscribe(settings.mqtttopic+"/req/#");
});
mqttc.on("message",function (topic, message){
	if(topic.indexOf(settings.mqtttopic+"/req/") != -1){
		var session = topic.split("/")[2];
		var json;
		try {
			json = JSON.parse(message);
		} catch (e) {
			console.log("invalid json");
			return;
		}
		if(json.path && json.method){
			var opts = {
				host: "localhost",
				port: 10772,
				path: "/api/"+json.path+".json",
				auth: "akari:bakuhatsu",
				method:json.method
			};
			hReq = http.request(opts, function(hRes){
				var buf = [];
				hRes.setEncoding("utf8");
				hRes.on("data",function(d){
					buf.push(Buffer.from(d));
				});
				
				hRes.on("aborted", function(){
					console.log("aborted");
				});
				hRes.on("close", function(){
					console.log("close");
				});
				hRes.on("end", function(){
					console.log("end");
					var buffer = Buffer.concat(buf);
					var chunk = Buffer.alloc(10240);
					var j=0;
					for(var i=0;i<buffer.length;i+=10240-4,j++){
						chunk.fill(0);
						buffer.copy(chunk,4,i,(i+10240-4 > buffer.length)?buffer.length:i+10240-4);
						chunk.writeInt32BE(j,0);
						mqttc.publish(settings.mqtttopic+"/res/"+session,chunk)
					}
					chunk = Buffer.alloc(4);
					chunk.writeInt32BE(-1,0);
					mqttc.publish(settings.mqtttopic+"/res/"+session,chunk)
				});
			});
			hReq.end();
			
		}
	}
});
app.listen(3000);
