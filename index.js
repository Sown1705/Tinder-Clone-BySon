const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var dbConnect = 'mongodb+srv://sonhandsome:sonhandsome01@nodejs.mad96.mongodb.net/nodejs?retryWrites=true&w=majority';
const mongoose = require('mongoose');
mongoose.connect(dbConnect, { useNewUrlParser: true, useUnifiedTopology: true });



var user = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    numberphone: String,
    avatar: String
})


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('connected')
});
//multer
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        //   cb(null,Date.now() + '-' +file.originalname)
        cb(null, file.originalname)
    }
})
//
var userConnect = db.model('users', user);
//
var upload = multer({
    dest: './public/uploads/'
    , storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // gioi han file size <= 1MB
    }
}).single('avatar-file')
// Configure template Engine and Main Template File
app.engine('handlebars', exphbs({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'main'
}));
// Setting template Engine
app.set('view engine', 'handlebars');

app.use(express.static('public'));
// routes
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/swiper', (req, res) => {
    res.render('swiper');
});
app.get('/profile=:id', (req, res) => {
    userConnect.findById(req.params.id, function (err, users) {
        if (err) throw err;
        res.render('profile', { update: users })
    }).lean().exec();
});

var updateUser= new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    numberphone: String,
    location: String
})
app.post('/update=:id',upload, async (req, res) =>{
      var userUpdate=mongoose.model('users',updateUser);
    console.log(req.params.id);
    userUpdate.updateOne({_id:req.params.id}, {$set: { 
                username: req.body.user_name,
                password: req.body.password,
                firstname: req.body.first_name,
                lastname: req.body.last_name,
                email: req.body.email,
                numberphone: req.body.numberPhone,
                location: req.body.location
        }},{ runValidators: true }, function (err) {
            if (err) throw err;
    
            res.render('profile', { message: "Edit success!!!" });
        })
        // await userUpdate.replaceOne({_id:req.params.id}, { username: req.body.user_name,
        //     password: req.body.password,
        //     firstname: req.body.first_name,
        //   lastname: req.body.last_name,
        //   email: req.body.email,
        //   numberphone: req.body.numberPhone,
        //   location: req.body.location });

    // var doc = await userUpdate.findOne({_id:req.params.id});
        // doc.overwrite({username: req.body.user_name,
        //               password: req.body.password,
        //               firstname: req.body.first_name,
        //             lastname: req.body.last_name,
        //             email: req.body.email,
        //             numberphone: req.body.numberPhone,
        //             location: req.body.location});
    //         await doc.save();
})


app.get('/upload', (req, res) => {
    res.render('upload');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/delete/:id', (req, res) => {
    userConnect.findByIdAndDelete(req.params.id, function (err, users) {
        if (err) throw err;
        res.send('delete');
    })

});
app.get('/listFriends', (req, res) => {
    userConnect.find({}, function (error, users) {
        var type = 'home';
        try {
            type = req.query.type;
        } catch (e) {
        }
        if (error) {
            res.render('listFriends', { title: 'List Friends : ' + error });
            return
        }
        if (type == 'json') {
            res.send(users)
        } else {
            res.render('listFriends', { title: 'List Friends', users: users });
        }
        //console.log(req.body.username);
        //console.log(users);
    }).lean().exec();
});
//upload
app.post('/upload', upload, function (req, res) {
    res.render('upload', { title: 'Upload Success!!!' })
})


//createUser
app.post('/createUser', upload, function (req, res) {
    const file = req.file
    if (!file) {
        res.render('register', { title: "Please choose a file !!!" });
    } else
        if (!file.originalname.match(/\.(jpg|JPG)$/)) {
            res.render('register', { title: "Please only choose a file jpg!!!" })
        }
    if (file instanceof multer.MulterError) {
        res.render('register', { title: "File size Maximum is 1MB.Please try again!!!" })
    }

    userConnect({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        numberphone: req.body.numberPhone,
        avatar: req.file.originalname
    }).save(function (error) {
        if (error) {
            res.render('register', { title: 'Could not create account!!!!' });
        }
    })

    res.render('swiper');
})
var port =3000||process.env.PORT;
app.listen(port, () => {
    console.log('The web server has started on port '+port);
});