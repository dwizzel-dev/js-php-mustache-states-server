<?php

$prop = $_REQUEST['prop'] ?? 'default';

$template =<<<HTML

    <!-- a template to be used by data-templated -->
    <!-- ref: https://css-tricks.com/can-get-pretty-far-making-slider-just-html-css/ -->
    {{#{$prop}}}
        <!-- parse for sscript -->
    {{#{$prop}.functions.scripted}}
        <script>
        (async () => {
            //this will be injected by the functions::scripted from the json data
            //to access the element inside of it only 
            const scopeElementId = "{{{$prop}.cuid}}"
            console.log("SCOPEELEMENTID:", scopeElementId)

        })()
        </script>  
    {{/{$prop}.functions.scripted}}
    {{#{$prop}.styles}}
        <style>
        {{{{$prop}.styles}}}
        </style>  
    {{/{$prop}.styles}}  
    <div id="{{{$prop}.cuid}}">  
        <h2>Slider:</h2>
        <div class="slider">
        <!-- the container slides -->
        <div class="slides">
            {{#{$prop}.listing}}
            <div id="{{{$prop}.cuid}}-slide-{{num}}">
            <img src="{{src}}" title="{{title}}" alt="{{title}}">
            </div>
            {{/{$prop}.listing}}
        </div>
        <!-- the number sliding too -->
        <div class="sliding">
            {{#{$prop}.listing}}
            <a href="#{{{$prop}.cuid}}-slide-{{num}}">{{num}}</a>
            {{/{$prop}.listing}}
        </div>
        </div>
    </div>  
    {{/{$prop}}}

HTML;


exit($template);

//EOF
