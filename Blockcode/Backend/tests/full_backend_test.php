<?php

require_once __DIR__.'/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__.'/../api');
$dotenv->load();

try {

    $conn = new PDO(
        "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS']
    );

    $conn->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

} catch(Exception $e){

    die("❌ ERROR DB: ".$e->getMessage());

}

$base = "https://app.blockcode.site/api/v1";

function request($method,$endpoint,$body=null){

    global $base;

    $ch = curl_init();

    curl_setopt(
        $ch,
        CURLOPT_URL,
        "$base/$endpoint"
    );

    curl_setopt(
        $ch,
        CURLOPT_RETURNTRANSFER,
        true
    );

    curl_setopt(
        $ch,
        CURLOPT_CUSTOMREQUEST,
        $method
    );

    curl_setopt(
        $ch,
        CURLOPT_HTTPHEADER,
        [
            "Content-Type: application/json"
        ]
    );

    if($body){

        curl_setopt(
            $ch,
            CURLOPT_POSTFIELDS,
            json_encode($body)
        );

    }

    $response = curl_exec($ch);

    $httpCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    return [
        "status"=>$httpCode,
        "response"=>json_decode($response,true),
        "raw"=>$response
    ];

}

function success($msg){

    echo "✔ $msg\n";

}

function errorMsg($msg,$detail=""){

    echo "❌ $msg\n";

    if($detail){

        echo "   ➜ $detail\n";

    }

}

echo "\n==============================\n";
echo "PRUEBAS AUTOMATIZADAS BACKEND\n";
echo "==============================\n";

//
// LOGIN
//

echo "\n===== LOGIN =====\n";

$r = request(
    "POST",
    "auth/login.php",
    [
        "correo"=>"andrea@blockcode.com",
        "password"=>"1234"
    ]
);

if(
    isset($r["response"]["success"])
    &&
    $r["response"]["success"] == true
){

    success("LOGIN");

}else{

    errorMsg(
        "LOGIN",
        $r["raw"]
    );

}

//
// PROVEEDOR CREATE
//

echo "\n===== CREATE PROVEEDOR =====\n";

$email = "test_".time()."@mail.com";

$r = request(
    "POST",
    "proveedores/save.php",
    [
        "nombre"=>"Proveedor Test",
        "contacto"=>"Tester",
        "telefono"=>"4421111111",
        "correo"=>$email
    ]
);

if(
    isset($r["response"]["success"])
){

    success("CREATE PROVEEDOR");

}else{

    errorMsg(
        "CREATE PROVEEDOR",
        $r["raw"]
    );

}

//
// VALIDAR EN BD
//

$query = $conn->prepare("
SELECT *
FROM proveedores
WHERE correo=:correo
");

$query->execute([
    ":correo"=>$email
]);

$proveedor = $query->fetch(
    PDO::FETCH_ASSOC
);

if($proveedor){

    success("VALIDACION BD PROVEEDOR");

}else{

    errorMsg(
        "VALIDACION BD PROVEEDOR",
        "No se insertó en PostgreSQL"
    );

}

//
// INVENTARIO CREATE
//

echo "\n===== CREATE INVENTARIO =====\n";

$r = request(
    "POST",
    "inventario/save.php",
    [
        "id_proyecto"=>1,
        "nombre_recurso"=>"AUTO_TEST",
        "cantidad"=>50,
        "estado"=>"Disponible"
    ]
);

if(
    isset($r["response"]["success"])
){

    success("CREATE INVENTARIO");

}else{

    errorMsg(
        "CREATE INVENTARIO",
        $r["raw"]
    );

}

$query = $conn->query("
SELECT *
FROM inventario
WHERE nombre_recurso='AUTO_TEST'
AND is_active=TRUE
ORDER BY id_inventario DESC
LIMIT 1
");

$inventario = $query->fetch(
    PDO::FETCH_ASSOC
);

if($inventario){

    success("VALIDACION BD INVENTARIO");

}else{

    errorMsg(
        "VALIDACION BD INVENTARIO",
        "No se insertó inventario"
    );

}

//
// TRANSACCION CREATE
//

echo "\n===== CREATE TRANSACCION =====\n";

$r = request(
    "POST",
    "transacciones/save.php",
    [
        "id_proyecto"=>1,
        "id_usuario"=>1,
        "id_proveedor"=>$proveedor["id_proveedor"],
        "tipo"=>"Compra",
        "monto"=>1000,
        "fecha"=>"2026-05-27",
        "descripcion"=>"AUTO_TEST"
    ]
);

if(
    isset($r["response"]["success"])
){

    success("CREATE TRANSACCION");

}else{

    errorMsg(
        "CREATE TRANSACCION",
        $r["raw"]
    );

}

$query = $conn->query("
SELECT *
FROM transacciones
WHERE descripcion='AUTO_TEST'
AND is_active=TRUE
ORDER BY id_transaccion DESC
LIMIT 1
");

$transaccion = $query->fetch(
    PDO::FETCH_ASSOC
);

if($transaccion){

    success("VALIDACION BD TRANSACCION");

}else{

    errorMsg(
        "VALIDACION BD TRANSACCION",
        "No se insertó transacción"
    );

}

//
// GET ENDPOINTS
//

echo "\n===== GET ENDPOINTS =====\n";

$endpoints = [

    "roles/index.php",
    "users/index.php",
    "proyectos/index.php",
    "proveedores/index.php",
    "inventario/index.php",
    "transacciones/index.php"

];

foreach($endpoints as $ep){

    $r = request(
        "GET",
        $ep
    );

    if(
        is_array($r["response"])
    ){

        success($ep);

    }else{

        errorMsg(
            $ep,
            $r["raw"]
        );

    }

}

//
// UPDATE PROVEEDOR
//

echo "\n===== UPDATE PROVEEDOR =====\n";

$r = request(
    "PUT",
    "proveedores/update.php",
    [
        "id_proveedor"=>$proveedor["id_proveedor"],
        "nombre"=>"MODIFICADO",
        "contacto"=>"MOD",
        "telefono"=>"442",
        "correo"=>$email
    ]
);

if(
    isset($r["response"]["success"])
){

    success("UPDATE PROVEEDOR");

}else{

    errorMsg(
        "UPDATE PROVEEDOR",
        $r["raw"]
    );

}

//
// DELETE PROVEEDOR
//

echo "\n===== DELETE PROVEEDOR =====\n";

$r = request(
    "DELETE",
    "proveedores/delete.php",
    [
        "id_proveedor"=>$proveedor["id_proveedor"]
    ]
);

if(
    isset($r["response"]["success"])
){

    success("DELETE PROVEEDOR");

}else{

    errorMsg(
        "DELETE PROVEEDOR",
        $r["raw"]
    );

}

echo "\n==============================\n";
echo "FINALIZADO\n";
echo "==============================\n";
?>