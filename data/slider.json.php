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
            "title" => "Flower #1",
            "src" => "/images/slider/1.webp"
        ],
        [
            "title" => "Flower #2",
            "src" => "/images/slider/2.webp"
        ]
    ],
    "styles" =><<<STYLES
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
        #{$cuid} h3{
            padding: 20px 0 0 0;
            margin: 10px 0 0 0;
            width: unset;
            text-align: left;
            border-top: 1px dotted #ccc;
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
            cursor: pointer;
        }
        #{$cuid} li img{
            width: calc(100vw - (100vw - 100%));
            height: auto;
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
                const find = () => {
                    document.querySelectorAll("#{$cuid} LI").forEach((el) => {
                        el.onclick = onClickable;
                    });    
                }
                //our parent container of the news which use the template
                const el = document.getElementById('{$cuid}').parentElement;
                //set an observer in case content was removed and put back, 
                //we need to remap the event to it
                const observer = new MutationObserver((ev) => {
                    ev.forEach((mutation) => {
                        //check if it was cleared so we can remove the event from it
                        //just for debug
                        [...mutation.removedNodes].forEach((entry) => {
                            if(entry.id === '{$cuid}'){
                                console.log('MUTATION-REMOVEDNODES[{$cuid}]');     
                            }
                        });
                        //check if it was readded like a undo states, to put the event back
                        [...mutation.addedNodes].forEach((entry) => {
                            if(entry.id === '{$cuid}'){
                                console.log('MUTATION-ADDEDNODES[{$cuid}]');             
                                find();
                            }
                        });
                    })
                });
                // Start observing the target node for configured mutations
                observer.observe(el, { childList: true });
                //stop observing
                //observer.disconnect();
                console.log("SCRIPT-NEWS:", el, observer);
                //apply the event to the LI
                find();
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
                    console.log("SCRIPTED-INNER-INJECTION[news.script]:", n, script);
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
                const script = await appz.gstates('news.script');
                if(document.getElementById(n) === null){
                    console.log("SCRIPTED-INJECTION[news.script]:", n, script);
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