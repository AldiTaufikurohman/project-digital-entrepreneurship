<?php

/*
|--------------------------------------------------------------------------
| MIDTRANS SANDBOX
|--------------------------------------------------------------------------
*/

define(
    'MIDTRANS_SERVER_KEY',
    getenv('MIDTRANS_SERVER_KEY') ?: ''
);

define(
    'MIDTRANS_CLIENT_KEY',
    getenv('MIDTRANS_CLIENT_KEY') ?: ''
);


/*
|--------------------------------------------------------------------------
| SANDBOX
|--------------------------------------------------------------------------
*/

define(
    'MIDTRANS_API_URL',
    'https://app.sandbox.midtrans.com/snap/v1/transactions'
);


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

define(
    'DB_HOST',
    'localhost'
);

define(
    'DB_USER',
    'root'
);

define(
    'DB_PASS',
    ''
);

define(
    'DB_NAME',
    'db_belajaryuk'
);


/*
|--------------------------------------------------------------------------
| CONNECTION
|--------------------------------------------------------------------------
*/

$conn = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME
);

if ($conn->connect_error) {

    die(
        'Koneksi database gagal: ' .
        $conn->connect_error
    );

}

$conn->set_charset('utf8mb4');