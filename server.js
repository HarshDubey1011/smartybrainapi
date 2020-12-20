const express =require('express');
const bodyparser=require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
var knex = require('knex')

const mysqldb=knex({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'harshapp',
    password : 'India@1011',
    database : 'smartdb'
  }
});

const app =express();
app.use(bodyparser.json());
app.use(cors());
const database ={
  user:[{
  	id:'123',
  	name:'harsh',
  	email:'harshcode@gmail.com',
  	password:'cookies',
  	entries:0,
  	joined:new Date()
  },
  {
  		id:'124',
  	name:'harshit',
  	email:'harshit456@gmail.com',
  	password:'India@1011',
  	entries:0,
  	joined:new Date()
  }
]
}

app.get('/',(req,res)=>{
     res.send(database.user);
});
app.post('/signin',(req,res)=>{
mysqldb.select('email','hash').from('login')
.where('email','=',req.body.email)
.then(data =>{
  const isValidData=bcrypt.compareSync(req.body.password,data[0].hash)
  if(isValidData){
    return mysqldb.select('*').from('user')
    .where('email','=',req.body.email)
    .then(user =>{
      res.json(user[0])
    })
    .catch(err => res.status(400).json('error logging on'))
  }else{
    res.status(400).json('wrong credentials')
  }
}).catch(err => res.status(400).json('wrong credentials'));
    })

app.post('/register',(req,res)=>{
	const {name,password,email}=req.body;
  const hash =bcrypt.hashSync(password);
  mysqldb.transaction(trx =>{
    trx.insert({
      hash:hash,
      email:email
    }).into('login')
    .then(loginentered =>{
      mysqldb.select('email').from('user')
      .then(loginemail =>{
         return trx('user').insert({
  name: name,
  email:email,
  joined:new Date()
})
.then(inserted =>{
mysqldb.select('*').from('user').where("id",inserted)
.then(selected =>{
  return res.json(selected[0]);
})
      })
     .then(trx.commit)
     .catch(trx.rollback)
      })
      .catch(err => res.status(400).json("Unable t Register"))
      })
    })
  })





app.get('/profile/:id',(req,res) =>{
	const {id}=req.params;
	let found=false;
  mysqldb.select('*').from('user').where({id})
  .then(user =>{
    if(user.length){
        res.json(user[0]);
      }else{
        res.status(400).json('error');
      }
  
  }).catch(error => res.status(400).json('not found'));
    }
)

app.put('/image',(req,res) =>{
	const {id}=req.body;
  mysqldb('user').where('id','=',id)
  .increment('entries',1)
  .then(returning =>{
    mysqldb.select('entries').from('user')
    .then(user =>{
       res.json(user[0].entries); 
    })
  })
    }
)

app.listen(process.env.port || 3000,()=>{
	console.log('app is working');
});