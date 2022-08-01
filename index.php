<?php 

$dataBindersPersonal = base64_encode(json_encode([
  
  //standard props
  'firstName' => 'John',
  'lastName' => 'Doe',
  'age' => '54',
  'gender' => 'homme',

  //those need to be "use strict" compliant JS, also we cannot use those quotes: `blabla`
  //the access to render() and text [which is the text between {#}...{/}] 
  //will always be present in those func
  //some sync work around ex: https://javascript.plainenglish.io/async-await-javascript-5038668ec6eb

  'functions' => [

    'bold' =><<<JS
      
      //that just suround the content in bold
      //console.log("FUNCTIONS[bold]:", text);
      return '<i><b>' + render(text) + '</b></i>';

JS,

    'clickable' =><<<JS
      
      //that just make the content clickable and use a global js function
      //console.log("FUNCTIONS[clickable]:", text);
      return '<span class="clickable" onclick="onClickable(this);">' + render(text) + '</span>';

JS,
    
    'asyncMarital' =><<<JS
        
      //that just testing the acces to window.appz states via global function
      console.log("FUNCTIONS[asyncMarital]:", text);
      //async/await not working in that context
      //needs to return render(text) right now, 
      //so will build one so the async can write too it later when ready
      const id = ('marital-msg-' + Math.random()).replace('.', '');
      //the async states call later
      Appz().then(async (appz) => {
        const m = await appz.gstates('personal.marital');
        //its an async func so the element with that id was created
        //but if another changed occur since its async it wont be there anymore
        //so check existence
        const el = document.getElementById(id);
        console.log("FUNCTIONS-ASYNCHED[asyncMarital]:", m, el);
        if(m && el){
          if(m.toLowerCase() === 'm'){
            el.innerHTML = " ---> <b> Soooo sad :{</b> ";
          }else{
            el.innerHTML = " ---> <b style=\"color:#ab47bc;\"> Wow that's funtastic !!!</b> ";
          }  
        }
      }); 
      //right now no choice thats the way mustache works
      //but we will return a modify templace content with some id the retrieve it when async 
      return render(text.replace('{{id}}', id));
          
JS,    
  ]
]));

$dataBindersInterest = base64_encode(json_encode([
  'musics' => [
    'listing' => ['rap', 'muzak', 'rock', 'metal', 'funk', 'classic', 'blues', 'jazz']
  ],  
  'sport' => 'soccer'
]));

$templatePersonalInterest = base64_encode(utf8_decode(<<<HTML

  <div style="padding:10px;"> 
    <p>
      {{#personal}}
        <span>{{personal.firstName}} {{personal.lastName}}</span>
        {{#personal.age}}
          {{#personal.functions.getAge}}{{/personal.functions.getAge}}
          {{#personal.functions.clickable}}
            {{#personal.functions.bold}}
                <span>à {{personal.age}}<span>
            {{/personal.functions.bold}}
          {{/personal.functions.clickable}}  
        {{/personal.age}}   
      {{/personal}}
      {{#interest.sport}}
        aime le 
        <span class="clickable" onclick="onClickable(this, 'interest.sport');">{{interest.sport}}</span>  
      {{/interest.sport}}
      {{#interest.musics}}
        and musics: 
        {{#interest.musics.listing}}
          {{{.}}},
        {{/interest.musics.listing}}  
      {{/interest.musics}}
    </p> 
</div> 

HTML));

?>
<!DOCTYPE html>
<html lang="fr-CA">
  <head>
    
    <link rel="preload" as="image" href="/images/slider/1.webp">
    <link rel="preload" href="js/global.js" as="script">
        
    <meta name="viewport" content="height=device-height,width=device-width,initial-scale=1,maximum-scale=1">
    <meta charset="utf-8">
    <title>Binding-Binded-Binders-Mustache</title>
    <style>
      ::placeholder {
        color: #bdbdbd;
        font-size: 0.75rem;
        position: absolute;
        top: 3px;
        left: 3px;
      }
      :root{
        --padding: 1rem;
        --margin: 0.5rem;
        --font-size-small:0.75rem;
        --font-size-regular:1rem;
        --font-size-medium:1.25rem;
        --font-size-big:1.5rem;
        --font-size-bigger:2rem;
      }
      body{
        font-family: "Helvetica Neue",Helvetica,Arial;
        margin: 0;
        padding: 10px 10px 100px 10px;
      }
      INPUT[type]{
        border-style: solid;
        border-radius: 0 1rem 1rem 1rem;
        padding: var(--padding);
        margin: var(--margin);
        font-size:var(--font-size-regular);
        width: calc(100% - (var(--margin) * 2));
        box-sizing: border-box;
      }
      .container{
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-evenly;
      }
      .container.wrap{
        flex-wrap: wrap;
      }
      .container h3{
        width: 8rem;
        padding: var(--padding);  
        text-align: right;
        margin: var(--margin);
      }
      .container button{
       margin: 10px;  
       cursor:pointer;
      }
      .response{
        border: 0;
        padding: var(--padding);
        margin: var(--margin);
        font-size: var(--font-size-small);
        word-break: break-all;
        color: #aaa;
        width: 100%;
        box-sizing: border-box;
        background-color: #424242;
        font-family: monospace;
        padding-bottom: 40px;
        position: relative;
        padding-right: 100px;
        max-height: 200px;
        overflow: auto;
      }
      .response > div {
        display: inline;
      }
      .text{
        font-size: var(--font-size-medium);
        padding: 0;
        margin: var(--margin);
        word-break: break-all;
        color: #999;
        width:100%;
        box-sizing: border-box;
        border: 1px dotted #999;
        position: relative;
      }  
      .infos{
        font-size: var(--font-size-regular);
        color: #333;
      }  
      .clickable{
        font-weight: bold;
        cursor: pointer;
        text-decoration: underline;
      }
      .double-binding-binded{
        border-color:#ff9900;
      }
      .binding-binded{
        border-color:#ab47bc;
      }
      .binding{
        border-color:#009688;
      }
      .floating{
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 100px;
        height: 50px;
        z-index:1;
      }
      .floating button{
        height: 100%;
        width: 100%;
        box-shadow: 5px 5px 10px #000000a3;
        background: #2196f3;
        border: 0;
        color: #b2ebf2;
        font-size: 1rem;
        border-radius: 5px;
        cursor:pointer;
      }
      button.clear{
        border: 0;
        border-radius: 5px;
        color: #fff;
        background: #b71c1c77;
        cursor: pointer;
        margin: 0;
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 5px;
      }
      .loading::before {
        display: flex;
        position: absolute;
        content: "";
        font-size: 1rem;
        line-height: 1rem;
        color: #ccc;
        animation: loading-anim 2s linear infinite;
        justify-content: center;
        letter-spacing: 0.25rem;
        align-items: center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      @keyframes loading-anim {
        0% { content: "";}
        25%{ content: "❤";}
        50%{ content: "❤❤";}
        75%{ content: "❤❤❤";}
      }
      @media only screen and (max-width: 480px) {
        .text {
          min-height: calc((100vw / 3));
        }
        .response{
          max-height: calc((100vw / 2.5));
          min-height: calc((100vw / 2.5));
        }
        #slider-top .text{
          min-height: calc((100vw * 1.25) + 30px + 20px + 2rem); /* + the bottom slider bar height + h2 + h2 margin */
        }
      }
      

    </style>
    
    <script src="../js/global.js" defer></script>

    <!-- to load faster they dont inialize anything -->
    <script type="module" src="../js/modules/states.mjs" async></script>
    <script type="module" src="../js/modules/mustache.mjs" async></script>
    <script type="module" src="../js/index.mjs" async></script>

    <script type="module">
      //impot those functionnality will map them to a window object gloabal accessible
      import {binded, binders, binding, action, gstates, sstates, obsstates} from '../js/index.mjs';
      //element that can init a state from json base64 encoded or files, first thing to check
      for await (const item of document.querySelectorAll('[data-binders]')) {
          await binders(item)
      }
      //element that cam modify the state, second thing to check
      for await (const item of document.querySelectorAll('[data-binding]')) {
          await binding(item)
      }
      //element that receive the state, third thing to check!!!
      for await (const item of document.querySelectorAll('[data-binded]')) {
          await binded(item)
      }
      //element that can delete or change object from json input, fourth thing
      for await (const item of document.querySelectorAll('[data-action]')) {
          await action(item)
      }
      //map some functionnality
      //test async func or/and make it non blocking
      setTimeout(() => {
        window.appz = {binded, binders, binding, action, gstates, sstates, obsstates}
      })
    </script>
        
  
  </head>
  <body id="body" class="body">
    <!-- directly base64 json object -->
    <input type="hidden" value="personal" data-binders="<?=$dataBindersPersonal?>">
    <input type="hidden" value="interest" data-binders="<?=$dataBindersInterest?>">
    <!-- from file: /data/phones.json -->
    <input type="hidden" value="phones" data-binders="@phones.json">

    <!-- a template to be used by data-templated, this one will use the personal.getAge functions to show age -->
    <template data-template="infos">
      <div style="padding:10px;">
        {{#personal}}
          <h2>
            {{personal.firstName}} 
            {{personal.lastName}} 
            {{#personal.age}}
              {{personal.age}} ans
            {{/personal.age}}
          </h2>
        {{/personal}}
        {{#phones}}
          <p><b>Phones :</b></p>    
          <p>
            Home: {{phones.home}} <br />
            Office: {{phones.office}} 
            {{#personal.marital}}
              <br />Marital: {{{personal.marital}}}
              {{#personal.functions.asyncMarital}}
                <span id="{{id}}"></span>
              {{/personal.functions.asyncMarital}}
            {{/personal.marital}}
          </p>
        {{/phones}}  
        {{#interest.musics}}
          <p><b>Musics :</b></p>    
          <ul>
          {{#interest.musics.listing}}
            <li>{{{.}}}</li>
          {{/interest.musics.listing}}
          </ul>
        {{/interest.musics}}
      </div>
    </template>  

    <div id="slider-top">  
      <input type="hidden" value="slider.flowers" data-binders="@slider.json.php?cat=flowers&uid=slider-top">
        <div class="container wrap">
            <div class="response">
                <span>Slider Data:</span>
                <div data-binded="slider.flowers"></div>        
                <button class="clear" data-action="delete" data-prop="slider.flowers">clear state</button>
            </div>    
            <div class="text infos" data-binded="slider.flowers" data-templated="@slider.html.php?cat=flowers">
              <div class="loading"></div>
            </div>
        </div>
    </div>

    <div class="container">
      <div class="response">
        <span>Personal Data: </span>
        <div data-binded="personal"></div>
        <button data-action="delete" data-prop="personal" class="clear">clear state</button>  
      </div>  
    </div>  
    
    <div class="container">  
      <input type="text" value="" data-binding="personal.firstName" placeholder="First Name :" class="binding">
      <input type="text" value="" data-binding="personal.lastName" placeholder="Last Name : " class="binding">
      <!-- that one will overide the value from the states since its not empty -->
      <input type="number" value="666" data-binding="personal.age" data-binded="personal.age" placeholder="Age :" class="double-binding-binded">
    </div>
    
    <div class="container" id="personal-row-text">
      <input type="text" value="" data-binded="personal.firstName" disabled>
      <input type="text" value="" data-binded="personal.lastName" disabled>
      <input type="number" data-binding="personal.age" data-binded="personal.age" placeholder="Age :" class="double-binding-binded">
    </div>  
    
    <div class="container">
      <div class="response">
        <span>Interest Data:</span>
        <div data-binded="interest"></div>
        <button data-action="delete" data-prop="interest" class="clear">clear state</button>  
      </div> 
    </div>  
    
    <div class="container">
      <input type="text" value="" data-binding="interest.sport" placeholder="Sport :" class="binding">
    </div> 

    <div class="container">
       <!-- with template encoded base64 -->
      <div class="text" data-binded="personal, interest" data-templated="<?=$templatePersonalInterest?>">
        <div class="loading"></div>
      </div>  
    </div>  
    
    <div class="container">
      <div class="response">
        <span>Phones Data:</span>
        <div data-binded="phones"></div>
        <button data-action="delete" data-prop="phones" class="clear">clear state</button>  
      </div> 
    </div> 
    
    <div class="container">
      <!-- with template html from the page -->
      <div class="text infos" data-binded="personal, phones, interest.musics" data-templated="#infos">
        <div class="loading"></div>
      </div>  
    </div>  

    <div class="floating">
      <button data-action="undo">undo states</button>  
    </div>

  </body>
</html>
