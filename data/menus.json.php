<?php

$lang = $_REQUEST['lang'] ?? 'en';

if($lang === 'fr'){
    $menu = [
        'listing' => [
            [
                'text' => 'Accueil',
                'link' => '/',
                'id' => 'menu-home'
            ],
            [
                'text' => 'Contactez-nous!',
                'link' => '/contactez-nous/',
                'id' => 'menu-contact'
            ]
        ]
    ];
}else{
    $menu = [
        'listing' => [
            [
                'text' => 'Home',
                'link' => '/',
                'id' => 'menu-home'
            ],
            [
                'text' => 'Contact Us!',
                'link' => '/contact-us/',
                'id' => 'menu-contact'
            ]
        ]    
    ];
}

$json = json_encode($menu);

exit($json);


//EOF