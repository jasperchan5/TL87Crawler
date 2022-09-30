import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const router = express.Router();

router.get("/", (_,res) => res.status(200).send("Hello"))

router.get("/getText", async(req,res) => {
    console.log("Start");
    // const url = req.query.url;
    
    const pagination = await axios.get("https://forum.gamer.com.tw/C.php?page=1&bsn=60076&snA=5653856&s_author=TL87", {
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36'}
    }).then().catch(() => console.log("Get pagination fail"));
    let $ = cheerio.load(pagination.data);
    let pagesButton = $('.BH-pagebtnA').find('a');
    let pageNum = $(pagesButton.slice(-1)[0]).text();
    let response = []
    for(let page = 1; page <= pageNum; page++) {
        const url = `https://forum.gamer.com.tw/C.php?page=${page}&bsn=60076&snA=5653856&s_author=TL87`;
        const pageHTML = await axios.get(url, {
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36'}
        }).then().catch(() => console.log("Get content fail"));
        $ = cheerio.load(pageHTML.data);
        // console.log(url);
        $('#BH-background').each((_, eachSec) => {
            $(eachSec).find('.c-section__main', '.c-post').each((_,e) => {
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
                }
            })
            // console.log(response);
        })
    }
    console.log("End");
    res.status(200).send(response);
})

export default router;