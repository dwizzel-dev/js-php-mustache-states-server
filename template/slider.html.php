<?php

$cat = $_REQUEST['cat'] ?? 'default';

$template =<<<HTML

    <!-- a template to be used by data-templated -->
    <!-- ref: https://css-tricks.com/can-get-pretty-far-making-slider-just-html-css/ -->
    {{#slider.{$cat}}}
        <!-- parse for sscript -->
    {{#slider.{$cat}.functions.scripted}}
        <script>
        (async () => {
            //this will be injected by the functions::scripted from the json data
            //to access the element inside of it only 
            const scopeElementId = "{{slider.{$cat}.cuid}}"
            console.log("SCOPEELEMENTID:", scopeElementId)

        })()
        </script>  
    {{/slider.{$cat}.functions.scripted}}
    {{#slider.{$cat}.styles}}
        <style>
        {{{slider.{$cat}.styles}}}
        </style>  
    {{/slider.{$cat}.styles}}  
    <div id="{{slider.{$cat}.cuid}}">  
        <h2>Slider:</h2>
        <div class="slider">
        <!-- the container slides -->
        <div class="slides">
            {{#slider.{$cat}.listing}}
            <div id="{{slider.{$cat}.cuid}}-slide-{{num}}">
            <img src="{{src}}" title="{{title}}" alt="{{title}}">
            </div>
            {{/slider.{$cat}.listing}}
        </div>
        <!-- the number sliding too -->
        <div class="sliding">
            {{#slider.{$cat}.listing}}
            <a href="#{{slider.{$cat}.cuid}}-slide-{{num}}">{{num}}</a>
            {{/slider.{$cat}.listing}}
        </div>
        </div>
    </div>  
    {{/slider.{$cat}}}

HTML;


exit($template);

//EOF
