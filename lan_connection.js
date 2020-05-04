const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/userlogin', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => {
    console.log('Connected to Mongo!')
})
.catch((err) => {
    console.error('Error connecting to Mongo', err)
})