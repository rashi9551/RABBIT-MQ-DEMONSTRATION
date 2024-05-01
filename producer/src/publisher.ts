import express,{Application,Request,Response} from "express"
import * as amqp from 'amqplib'

const app:Application =express()
app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
    res.json({_:"its from publisher"})
})

const rabbitUrl='amqp://localhost:5672';

app.post('/publisher',async(req:Request,res:Response)=>{
    try {
        const {routingKey,message}=req.body
        const connection=await amqp.connect(rabbitUrl)
        const channel=await connection.createChannel()
        await channel.assertExchange('logExchange','direct')
        const messageBuffer = Buffer.from(JSON.stringify(message));
        await channel.publish("logExchange",routingKey,messageBuffer)
        console.log(`message sent ${message} successfully`);
        res.send("its okey")

    } catch (error) {
        console.log(error,"error undu mwoney");
        
    }
})

app.listen(3000,()=>{
    console.log("local host running 3000");
    
})