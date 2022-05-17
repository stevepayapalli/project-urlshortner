// const mongoose = require('mongoose')
const urlModel = require("../models/urlModel");
const nanoId = require("nano-id");
const validUrl = require("valid-url");
const baseUrl = "http://localhost:3000";

const createUrl = async function (req, res) {
  try {
    let long_url = req.body.longUrl;

    if (!long_url) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide URL in request body.",
        });
    }
    if (!validUrl.isUri(long_url)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid long URL." });
    }

    const urlData = await urlModel
      .findOne({ longUrl: long_url })
      .select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

    if (urlData) {
      const { longUrl, shortUrl, urlCode } = urlData;
      return res
        .status(200)
        .send({
          status: true,
          data: { longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode },
        });
    } else {
      let urlCode = nanoId(8);

      const shortUrl = baseUrl + "/" + urlCode;

      const url = {
        long_url,
        shortUrl,
        urlCode,
      };
      await urlModel.create({
        longUrl: long_url,
        shortUrl: shortUrl,
        urlCode: urlCode,
      });

      res.status(200).send({ status: true, data: url });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const getUrl = async function (req, res){
    const url_code = req.params.urlCode
    const urlData = await urlModel.findOne({urlCode:url_code})
    if(!urlData){
      return  res.status(404).send({status:false, message:"No URL is found with the given code. Please enter valid URL code"})
        
    }
        res.status(302).redirect(urlData.longUrl)
} 
// const getlongURl = async function (req, res) {
//     try{
//         const urlCode = req.params.urlCode;

//         if (Object.keys(urlCode).length = 0) { return res.status(400).send({ status: false, message: 'Please provide URL Code in Params' }) }
        

//         const URL = await urlModel.findOne({ urlCode: urlCode })   

//         if (!URL) { return res.status(404).send({ status: false, message: 'No URL found with this URL Code. Please check input and try again' }) }

//       return res.status(302).redirect(URL.longUrl);
//     }
//     catch(err){
//         return res.status(500).send({ message: err.message })
//     }
// }



module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
