<?php
$cat = $_REQUEST['cat'] ?? '';
$title = ucfirst($cat);
$uid = $_REQUEST['uid'] ?? 'SID-'.crc32($cat.time());
$cuid = 'content-'.$uid;
$news = [
    "uid" => $cuid,
    "title" => "Some {$title} News!",
    "listing" => [
        [
            "title" => "Good {$title} News",
            "date" => "01-01-1970",
            "content" => "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio."
        ],
        [
            "title" => "Bad {$title} News",
            "date" => "02-01-1970",
            "content" => "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus."
        ]
    ],
    "styles" =><<<STYLES
        #{$cuid}{
            color: #673ab7;
        }
        #{$cuid} h2{
            font-size: 2rem;
            padding: 0;
            margin: 0 0 10px 0;
            color: #311b92;
        }
        #{$cuid} h3{
            padding: 0;
            margin: 0;
            width: unset;
            text-align: left;
        }
        #{$cuid} ul{
            margin: 0;
            padding: 0;
            list-style: none;
        }
        #{$cuid} li{
            padding: 5px 0;
            font-size: 1rem;
            font-weight: normal;
        }
        #{$cuid} a{
            color: #673ab7;
            text-decoration: none;
        }
STYLES,
    "script" =><<<JS

            //set timeout is essential to stack the call,
            //since the element is not there yet
            //because the functions:scripted inserting that script 
            //will pass before doing is render(text)

            //@TODO: 
            //find a way when the states are erased, to re-listen when they are showing again 
            //since it wont reinsert that script again so it wont trigger

            setTimeout(async () => {
                console.log("SCRIPT-NEWS:");
                document.querySelectorAll("#{$cuid} LI").forEach((el) => {
                    el.onclick = onClickable;
                })
            });
            

JS, 
    "functions" => [
        "scripted" =><<<JS

            Appz().then(async (appz) => {
                //minor check on existence
                const n = 'scripted-{$uid}';
                console.log("SCRIPTED-NEWS-ASYNC:", n);
                if(document.getElementById(n) === null){
                    const sc = document.createElement("script");
                    sc.setAttributeNode(attr('id', n))
                    sc.appendChild(document.createTextNode(await appz.gstates('news.script'))); 
                    document.getElementById("body").appendChild(sc);
                }    
            }); 

JS
    ]
];

$json = json_encode($news);

exit($json);

//EOF