const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static('public')); 
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let serverPosts = [];

app.post('/upload', upload.single('theimage'), (req, res) => {
	let currentDate = new Date();

	let data = {
    title: req.body.title,
		text: req.body.text,
		date: currentDate.toLocaleString(),
		timestamp: currentDate.getTime(),
	};

	if (req.file) {
		data.image = '/uploads/' + req.file.filename;
	}

	serverPosts.push(data);

	res.redirect('/forum');
});

app.get('/schedule', (req, res) => {
  res.render('schedule.ejs');
})

app.get('/', (req, res) => {
  res.render('index.ejs', { posts: serverPosts });
})

app.get('/about', (req, res) => {
  res.render('about.ejs');
})

app.get('/forum', (req, res) => {
  res.render('forum.ejs', { posts: serverPosts });
})

app.listen(5001, () => {
  console.log("server is running");
});
