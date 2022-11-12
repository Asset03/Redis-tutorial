const express = require('express')
const morgan = require('morgan')
const redis = require('redis')
const util = require('util')
const axios = require('axios')


const redisUrl = "redis://127.0.0.1:6379"
const client = redis.createClient(redisUrl)
client.on('connect', () => console.log('Connected to Redis!'));
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();


///// istemidi eken
// client.set = util.promisify(client.set)
// client.get = util.promisify(client.get)

const app = express()
app.use(express.json())
app.use(morgan('tiny'))


app.post('/', async (req, res) => {
    const { key, value } = req.body
    const response = await client.set(key, value)
    res.send(response)
})

app.get('/', async (req,res)=>{
    const key = req.body.key
    const value = await client.get(key)
    console.log(value);
    console.log("Hi");
    res.json(value)
})


app.get("/posts/:id",async (req,res)=>{
    const {id} = req.params
    
    const cachedPost = await client.get(`post-${id}`)
    
    if(cachedPost){
        return res.json(JSON.parse(cachedPost))
    }

    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)

    await client.set(`post-${id}`,JSON.stringify(response.data),'EX',10)

    return res.json(response.data)
})

app.listen(8080, () => {
    console.log(`Server started on port 8080...`);
})