import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

mongoose.connect('mongodb://localhost/api-test', {
    useCreateIndex: true,
    useNewUrlParser: true
});

const db = mongoose.connection
db.on('error', console.log)
db.once('open', ()=>{
    console.log ('bien connecté')
})

const userSchema = new mongoose.Schema({
  name: String,
  email: {
      unique: true,
      type: String,
  },
  password: String
})

const user = new mongoose.model('user', userSchema)

const app = express()
app.use(cors({
  origin: '*'
}))

app.use(bodyParser.json())

app.get('*', (req, res)=>{
    res.status(404)
    res.send("la requête est introuvable")
})

app.post('/user',(req, res)=>{
    const email =req.body.email
    const password =req.body.password
    const name =req.body.name
    //controle des ID//
    const hash = bcryptjs.hashSync(password, 8)

    console.log(hash)
})


app.listen(3000, ()=>{
    console.log('http://localhost:3000')
})
