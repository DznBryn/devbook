const express = require('express');
const app = express();

const PORT = process.env.PORT || 3003;

app.get('/', (req, res) => {
	res.send('API Running');
});

app.listen(PORT, () => {
	console.log(`> Ready on port ${PORT}`);
});
