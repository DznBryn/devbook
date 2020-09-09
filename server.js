const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require('path');

const PORT = process.env.PORT || 3003;

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// app.get('/', (req, res) => {
// 	res.send('API Running');
// });

// Define Routes
app.use('/api/users', require('./routers/api/users'));
app.use('/api/profile', require('./routers/api/profile'));
app.use('/api/post', require('./routers/api/post'));
app.use('/api/auth', require('./routers/api/auth'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
	//Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}
app.listen(PORT, () => {
	console.log(`> Ready on port ${PORT}`);
});

