const urlModel = require("../models/urlModel");
const nanoId = require("nano-id");
const validUrl = require("valid-url");
const baseUrl = "http://localhost:3000"; 


const redis = require("redis");
const { promisify } = require("util");  /// don't know from where it is coming..??

const redisClient = redis.createClient(
  10204,
  "redis-10204.c299.asia-northeast1-1.gce.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("XTAwfJw6tbOouRbMmMT7uics1fOnpuYh", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);   /////// END



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

const getUrl = async function (req, res) {
  const getDataFromCache = await GET_ASYNC(`${req.params.urlCode}`);
  let url = JSON.parse(getDataFromCache)
  if (url) {
    // console.log(getDataFromCache)
    return res.status(302).redirect(url.longUrl);
    
  } 
  else {
    const urlData = await urlModel.findOne({ urlCode: req.params.urlCode });
    if (!urlData) {
      return res
        .status(404)
        .send({
          status: false,
          message:
            "No URL is found with the given code. Please enter valid URL code",
        });}
    await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(urlData))
    res.status(302).redirect(urlData.longUrl);
    // console.log(urlData.longUrl)
  }
}; 


module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
