import express, { Application, Request, Response } from 'express';
import amqp from 'amqplib';

const app: Application = express()
app.use(express.json());

const rabbitUrl='amqp://localhost:5672';

let recieveMessage:string
async function consumeMessages() {
    try {
      const connection = await amqp.connect(rabbitUrl);
      const channel = await connection.createChannel();
      await channel.assertExchange("logExchange","direct");
  
      const q=await channel.assertQueue('hey-queue');
      await channel.bindQueue(q.queue,'logExchange','Info')
      channel.consume(q.queue, (message: any) => {
        recieveMessage = message.content.toString()
        console.log(recieveMessage);
        channel.ack(message);
      });
    } catch (error) {
      console.log('error--at consumeMessages', error);
    }
  }
  consumeMessages()


  app.get('/', (req: Request, res: Response) => {
    res.json({ ___: "This is Consumer" });
  });

  app.get('/consumer', (req: Request, res: Response) => {
    consumeMessages()
      .then(() => {
        res.json({ status: recieveMessage });
      })
      .catch((error) => {
        console.log('error--at /consumer', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });

  app.listen(3001, () => {
    console.log('Consumer server is connected at 3001');
    consumeMessages();
  });
  
