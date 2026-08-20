<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    
    'collector' => [
        'url' => env('COLLECTOR_URL'),
        'export_endpoint' => 'coordination/export',
        'api_key' => env('COLLECTOR_API_KEY'),
    ],

    'alfa_payment' => [
        'base_url' => env('ALFA_PAYMENT_BASE_URL', 'https://alfa.rbsuat.com/payment/rest'),
        'user_name' => env('ALFA_PAYMENT_USER_NAME'),
        'password' => env('ALFA_PAYMENT_PASSWORD'),
        'token' => env('ALFA_PAYMENT_TOKEN'),
        'return_url' => env('ALFA_PAYMENT_RETURN_URL'),
        'fail_url' => env('ALFA_PAYMENT_FAIL_URL'),
        'currency' => env('ALFA_PAYMENT_CURRENCY', '810'),
        'timeout' => env('ALFA_PAYMENT_TIMEOUT', 15),
        'ca_bundle' => env('ALFA_PAYMENT_CA_BUNDLE'),
        'payment_form' => [
            'allowed_hosts' => array_values(array_filter(array_map('trim', explode(',', env('PAYMENT_FORM_ALLOWED_HOSTS', 'alfa.rbsuat.com'))))),
            'allowed_paths' => array_values(array_filter(array_map('trim', explode(',', env('PAYMENT_FORM_ALLOWED_PATHS', '/payment/merchants/'))))),
        ],
    ],

    'mistral' => [
        'api_key' => env('MISTRAL_API_KEY'),
    ],

    'sellico_meet' => [
        'base_url' => env('SELLICO_MEET_API_URL', 'https://meet.sellico.ru/api/v1'),
        'token' => env('SELLICO_MEET_API_TOKEN'),
        'timeout' => env('SELLICO_MEET_TIMEOUT', 10),
    ],
    
    'wb_user_agent' => env('WB_USER_AGENT'),
];
