import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import fakeUA from 'fake-useragent';
import mongoose from 'mongoose';
import Comment from './db.js';
import dotenv from 'dotenv-defaults';
import createJieba from 'js-jieba';
import { JiebaDict, HMMModel, UserDict, IDF, StopWords } from 'jieba-zh-tw';

const jieba = createJieba(
  JiebaDict,
  HMMModel,
  UserDict,
  IDF,
  StopWords
)


const router = express.Router();

router.get("/", (_,res) => res.status(200).send("Hello"))

router.get("/getText", async(req,res) => {
    console.log("Start");
    let response = [];

    // Connect to mongo db
    dotenv.config();
    const url = process.env.MONGO_URL;
    console.log(url);
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("mongo db connection created"));

    const findComments = await Comment.find({});
    console.log(findComments.length);
    switch(findComments.length) {
        case 0:
            console.log("Start crawling");
            const pagination = await axios.get("https://forum.gamer.com.tw/C.php?page=1&bsn=60076&snA=5653856&s_author=TL87", { headers: {'User-Agent': fakeUA()}}).then().catch((e) => console.log("Get pagination fail", e));
            let $ = cheerio.load(pagination.data);
            let pagesButton = $('.BH-pagebtnA').find('a');
            let pageNum = $(pagesButton.slice(-1)[0]).text();
            for(let page = 1; page <= pageNum; page++) {
                const url = `https://forum.gamer.com.tw/C.php?page=${page}&bsn=60076&snA=5653856&s_author=TL87`;
                const pageHTML = await axios.get(url, { headers: {'User-Agent': fakeUA()}}).then().catch(() => console.log("Get content fail"));
                $ = cheerio.load(pageHTML.data);
                // console.log(url);
                $('#BH-background').each(async(_, eachSec) => {
                    $(eachSec).find('.c-section__main', '.c-post').each(async(_,e) => {
                        let toPush = {
                            date: "",
                            content: "",
                            replies: []
                        }
                        // Date
                        let date = $(e).find('.c-post__header').find('.edittime', '.tippy-post-info').text();
                        // console.log(date);
                        toPush.date = date;
                
                        // Content
                        let content = $(e).find('.c-article__content').text();
                        toPush.content = content;
                
                        // Replies
                        let replies = $(e).find('.c-post__footer', '.c-reply').find(".c-reply__item")
                        try {
                            replies.each((_, r) => {
                                let replyObj = {
                                    user: "",
                                    content: ""
                                }
                                replyObj.user = $(r).find('.reply-content__user').text();
                                replyObj.content = $(r).find('.comment_content').text();
                                if(replyObj.user !== "" && replyObj.content !== ""){
                                    toPush.replies.push(replyObj);
                                }
                            })
                        }
                        catch(e){}
                        if(toPush.date !== "" && toPush.content !== ""){
                            response.push(toPush);
                            const newComment = new Comment({date: toPush.date, content: toPush.content, replies: toPush.replies});
                            // console.log(newComment);
                            const findOneComment = await Comment.findOne({date: toPush.date, content: toPush.content, replies: toPush.replies});
                            if(findOneComment === null){
                                // console.log("Not exist");
                                await newComment.save().then().catch();
                            }
                            else {
                                // console.log("Exists");
                            }
                        }
                    })
                    // console.log(response);
                })
            }
            break;
        default:
            console.log("Fetch from db");
            const allComments = await Comment.find({});
            allComments.forEach((e, i) => {
                let toPush = {
                    date: e.date,
                    content: e.content,
                    replies: e.replies
                }
                response.push(toPush);
            })
            break;
    }
   
    console.log("End");
    res.status(200).send(response);
})

router.get("/deleteDB", async(_, res) => {
    // Connect to mongo db
    dotenv.config();
    const url = process.env.MONGO_URL;
    console.log(url);
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("mongo db connection created"));
    if((await Comment.find({})).length !== 0){
        await Comment.deleteMany({});
        console.log("Delete many");
    }
    else {
        console.log("Empty nothing to delete");
    }
    res.status(200).send("Delete db")
})

export default router;