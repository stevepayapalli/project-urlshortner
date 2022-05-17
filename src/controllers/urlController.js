const urlModel = require("../models/urlModel");
const nanoId = require("nano-id");
const validUrl = require("valid-url");
const baseUrl = "http://localhost:3000";

const createUrl = async function (req, res) {
  try {
    let long_url = req.body.longUrl;

    if (!long_url) {return res.status(400).send({status: false,message: "Please provide URL in request body."});}
    if (!validUrl.isUri(long_url)) {return res.status(400).send({ status: false, message: "Please enter valid long URL." });}

    const urlData = await urlModel.findOne({ longUrl: long_url })

    if (urlData) {
      const { longUrl, shortUrl, urlCode } = urlData;
      return res.status(200).send({status: true,data: { longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode },});
    } else {
      let url_code = nanoId(8);

      const short_url = baseUrl + "/" + url_code;

      const {longUrl, shortUrl, urlCode} = await urlModel.create({longUrl: long_url,shortUrl: short_url,urlCode: url_code,});

      res.status(201).send({ status: true, data: {longUrl:longUrl, shortUrl:shortUrl, urlCode:urlCode} });
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


module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
