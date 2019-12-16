import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

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

function verifyToken (req, res, next) {
    let token = req.headers.authorization
    if (typeof token === 'string' &&
    token.startsWith('Bearer ')){
        token = token.substring(7)
        try{
            jwt.verify(token, process.env.SECRET)
            return next()
        }catch (e) {
            resp.status(401)
            res.json({
                error: "Invalid access token"
            })
        }
    }else{
        res.status(401)
        res.json({
            error: "Acces token is required"
        })
    }
}

app.get('/me', verifyToken, (req, res)=>{
    res.send('hey oh')
})


app.get('*', (req, res)=>{
    res.status(404)
    res.send("la requête est introuvable")
})

app.post('/user',async(req, res)=>{
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    //controle des ID//
    const hash = bcryptjs.hashSync(password, 8)
    const newUser = new user({
        email: email,
        password: hash,
        name: name,
    })
    try {
        const data = (await newUser.save()).toObject()
        delete data.password
        res.json (data)
    }catch (e){
        res.status(401)
        res.json({
            error: e.errmsg
        })
    }
})

app.post('/login',async(req, res)=>{
    const email = req.body.email
    const password = req.body.password

    const data = await user.findOne({
        email
    })
    if (bcryptjs.compareSync(password, data.password)){
        const token = jwt.sign({
            id: data._id,
            name: data.name,
            email: data.email,
        },process.env.SECRET, {
            expiresIn: 86400 //60*60*24=24 heures//
        })
        res.json({
            token: token
        })
    }else{

    }
    console.log(data)
})

app.listen(3000, ()=>{
    console.log('http://localhost:3000')
})
