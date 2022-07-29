<?php
$title = $_REQUEST['cat'] ?? '';
$news = [
    "title" => "Some {$title}!",
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