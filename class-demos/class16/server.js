const express = require('express');

const app = express()

app.use(express.static('public'))

app.get('/',(req,res) => {
    res.send('Hello World');
})

app.get('/api/messages',(request,response) => {
    response.json({testData:'hi'})
})


app.listen(4001,()=> {
    console.log('Server is running on port 4001');
})