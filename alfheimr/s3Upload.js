var express  = require('express');
var app      = express();                    
var morgan = require('morgan');           
var bodyParser = require('body-parser'); 
var multer  =   require('multer');
var fs = require("fs");
var redis = require("redis"),
client = redis.createClient();
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
    accessKeyId: "XXXXXXXXXXXXXXXXXXXXXXXXX",
    secretAccessKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
});

app.use(express.static(__dirname + '/public'));                 
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(morgan('dev'));                   
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

var storage = multer.diskStorage({ 
    destination: function (_req, _file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (_req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var uploadImage = multer({ 
        storage: storage
    }).single('file');

var uploadFile = (userName,path,filename) => {                
    const fileContent = fs.readFileSync(path);
    const params = {
        Bucket: "ldvideo",
        Key: filename,
        Body: fileContent
    };
    s3.upload(params, function(err, data) {
        if (err) { throw err; }
        console.log(`File uploaded successfully. ${data.Location}`);
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.rpush("user:" + userName + ":imageList", data.Location);
        console.log("pushed successfully");
    });
};


/*####################################### add image post  ###########################################*/
app.post('/api/uploadPhoto', function(req, res) {
    var userName =req.query.userName;
    uploadImage(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        else{
            uploadFile(userName,req.file.path, req.file.filename);
            res.json(req.file);
        }  
    })
});
/*####################################### retrieve image post  #######################################*/
app.get('/api/imageList', (req, res) => {
    var userName = req.query.userName;
    client.on("error", function (err) {
      console.log("Error " + err);
    });
    client.lrange("user:" + userName + ":imageList", 0, -1, function (err, reply) {
      res.send(JSON.stringify(reply));
    });
  });


app.listen(process.env.PORT || 9000, function(){
    console.log("App listening on port 9000");
});