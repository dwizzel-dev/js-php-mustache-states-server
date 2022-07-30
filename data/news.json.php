<?php
$title = ucfirst($_REQUEST['cat'] ?? '');
$uid = 'UID-'.time();
$news = [
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
    "style" => $uid,
    "styles" =><<<STYLES
        .{$uid}{
            color: #673ab7;
        }
        .{$uid} h2{
            font-size: 2rem;
            padding: 0;
            margin: 0 0 10px 0;
            color: #311b92;
        }
        .{$uid} h3{
            padding: 0;
            margin: 0;
            width: unset;
            text-align: left;
        }
        .{$uid} ul{
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .{$uid} li{
            padding: 5px 0;
            font-size: 1rem;
            font-weight: normal;
        }
        .{$uid} a{
            color: #673ab7;
            text-decoration: none;
        }
STYLES,
    "functions" => [
        "show" =><<<JS

            //to test the template using the same for multiple type news
            console.log("FUNCTIONS-NEWS[show]:", text);
            return render(text);

JS
    ]
];

$json = json_encode($news);

exit($json);

//EOF