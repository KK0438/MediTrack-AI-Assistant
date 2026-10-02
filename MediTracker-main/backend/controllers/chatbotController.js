const axios = require("axios")

exports.chatbot = async(req,res)=>{

 try{

  const {question,userId} = req.body

  const ai = await axios.post(
   "http://localhost:8000/chat",
   {question,userId}
  )

  res.json(ai.data)

 }

 catch(err){
  res.status(500).json({error:"AI error"})
 }

}