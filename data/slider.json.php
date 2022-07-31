<?php
$cat = $_REQUEST['cat'] ?? '';
$title = ucfirst($cat);
$uid = $_REQUEST['uid'] ?? 'SID-'.crc32($cat.time());
$cuid = 'content-'.$uid;

$colors = [
    'color' => '#4caf50', 
    'background' => '#e8f5e977',
    'h2-color' => '#1b5e20'
];

$slider = [
    "cuid" => $cuid,
    "title" => "Some Slider!",
    "listing" => [
        [
            "num" => 1,
            "title" => "Flower #1",
            "src" => "/images/slider/1.webp"
        ],
        [
            "num" => 2,
            "title" => "Flower #2",
            "src" => "/images/slider/2.webp"
        ],
        [
            "num" => 3,
            "title" => "Flower #3",
            "src" => "/images/slider/3.webp"
        ],
        [
            "num" => 4,
            "title" => "Flower #4",
            "src" => "/images/slider/4.webp"
        ],
        [
            "num" => 5,
            "title" => "Flower #5",
            "src" => "/images/slider/5.webp"
        ]
    ],
    "styles" =><<<STYLES
        
        /* our basic */
        
        #{$cuid}{
            color: {$colors['color']};
            padding: 10px;
            background: {$colors['background']};
        }
        #{$cuid} h2{
            font-size: 2rem;
            padding: 0;
            margin: 0 0 10px 0;
            color: {$colors['h2-color']};
        }
        

        /* scoped slider style */

        #{$cuid} * {
            box-sizing: border-box;
        }
        #{$cuid} .slider {
            width: calc(100vw - (100vw - 100%));
            text-align: center;
            overflow: hidden;
            position: relative;
        }
        #{$cuid} .slides {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        #{$cuid} .slides::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        #{$cuid} .slides::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 5px;
            margin-top:5px;
        }
        #{$cuid} .slides::-webkit-scrollbar-track {
            background: transparent;
        }
        #{$cuid} .slides > div {
            scroll-snap-align: start;
            flex-shrink: 0;
            width: calc(100vw - (100vw - 100%));
            height: calc((100vw - (100vw - 100%)) / 1.3);
            margin-right: 0.25rem;
            border-radius: 10px;
            background: #eee;
            transform-origin: center center;
            transform: scale(1);
            transition: transform 0.5s;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 100px;
        }
        #{$cuid} img {
            /*object-fit: cover;*/
            /*position: absolute;*/
            width: calc(100vw - (100vw - 100%));
            /*height: 100%;*/
            top: 0;
            left: 0;
            width: 100%;
            height: calc((100vw - (100vw - 100%)) / 1.3);
        }
        #{$cuid} .slider .sliding{
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            left: 0;
            right: 0;
            bottom: 1.5rem;
        }
        #{$cuid} .slider .sliding > a {
            display: inline-flex;
            width: 1.5rem;
            height: 1.5rem;
            background: white;
            text-decoration: none;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 0 0.25rem;
            position: relative;
            opacity: 0.5;
        }
        #{$cuid} .slider .sliding > a:active {
            top: 1px;
        }
        #{$cuid} .slider .sliding > a:focus {
            background: #000;
            color: #333;
        }
        @supports (scroll-snap-type) {
            #{$cuid} .slider > a {
                display: none;
            }
        }

        
STYLES,
    "script" =><<<JS

            //set timeout is essential to stack the call,
            //since the element is not there yet
            //because the functions:scripted inserting that script 
            //will pass before doing is render(text)

            //set an automatic sliding                
            setTimeout(async () => {
                //get all of them in order of appearence
                const stack = [];
                const automatic = (ev) => {
                    ev.preventDefault();
                    ev.target.focus();
                    const slide = ev.target.dataset.gotoslide;
                    console.log("SLIDE:", slide, ev);
                    document.getElementById(slide).scrollIntoView({ 
                        behavior: 'smooth', block: 'nearest', inline: 'nearest' 
                    });
                }
                document.querySelectorAll("#{$cuid} .sliding A").forEach((el) => {
                    //we will change the default behavior
                    stack.push(el);
                    el.onclick = automatic;
                })
                //swap the last one to the end, 
                //since we start at the second one
                stack.push(stack.shift());
                //make it change in X seconds    
                setInterval(() => {
                    const el = stack.shift();
                    stack.push(el);
                    el.click();
                }, 3000);
            });
            

JS, 
    "functions" => [
        "scripted" =><<<JS

            //this will run right away and render it too at the end
            //we dont need to wait anything, it will be the first runner script
            if(text.indexOf('<script>')  !== -1){
                const n = 'scripted-inner-{$uid}';
                let script = text.replace('<script>', '').replace('</script>', '');
                //maybe we have some replacer mustache in the script too like a scope id maybe
                script = render(script)
                //this one will be created right now and will be there at the next scipter target
                //so it wontt duplicate
                if(document.getElementById(n) === null){
                    console.log("SCRIPTED-INNER-INJECTION[slider.script]:", n, script);
                    const sc = cnode("script", {id: n});
                    sc.appendChild(document.createTextNode(script)); 
                    document.getElementById("{$uid}").appendChild(sc);
                }    
            }

            //that will be later added
            Appz().then(async (appz) => {
                const n = 'scripted-{$uid}';
                //we need to await here or if we have multiple scripted
                //they will all be to null
                const script = await appz.gstates('slider.script');
                if(document.getElementById(n) === null){
                    console.log("SCRIPTED-INJECTION[slider.script]:", n, script);
                    const sc = cnode("script", {id: n});
                    sc.appendChild(document.createTextNode(script)); 
                    document.getElementById("{$uid}").appendChild(sc);
                }    
            }); 

            //we dont want to show the inner script
            return render('')

JS
    ]
];

$json = json_encode($slider);

exit($json);

//EOF