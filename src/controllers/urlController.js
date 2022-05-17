// const mongoose = require('mongoose')
const urlModel = require('../models/urlModel')
const nanoId = require('nano-id')
const validUrl = require('valid-url')
const baseUrl = 'http://localhost:3000'

const createUrl = async function(req,res){
    let long_url = req.body.longUrl


    if(!long_url){
        return res.status(400).send({status:false, message:"Please provide URL in request body."})
    }
    if (!validUrl.isUri(long_url)){
        return res.status(400).send({status:false, message:"Please enter valid long URL."})
    }

    const urlData = await urlModel.findOne({longUrl:long_url}).select({_id:0,__v:0, createdAt:0, updatedAt:0})
        
                                                                                    /// prefecto....
    if(urlData){
        const {longUrl, shortUrl, urlCode} = urlData 
        return res.status(200).send({status:true, data:{longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode}})
    }
    else{ let urlCode = nanoId(8)

    const shortUrl = baseUrl + '/' + urlCode
    
    const url = ({
        long_url,
        shortUrl,
        urlCode
        
    })
    await urlModel.create({longUrl:long_url,shortUrl:shortUrl,urlCode:urlCode})
    
    res.status(200).send({status:true,data:url})}
}


module.exports.createUrl = createUrl                