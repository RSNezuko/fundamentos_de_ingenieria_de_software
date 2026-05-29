<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../../config/database.php");

$id_proyecto = $_GET["id_proyecto"] ?? null;

$fecha_inicio = $_GET["fecha_inicio"] ?? null;
$fecha_fin = $_GET["fecha_fin"] ?? null;

if(!$id_proyecto){

    echo json_encode([
        "success"=>false,
        "message"=>"id_proyecto requerido"
    ]);

    exit;

}

//
// INFO PROYECTO
//

$query = "
SELECT
    id_proyecto,
    nombre,
    responsable,
    fecha_inicio,
    fecha_fin,
    presupuesto
FROM proyectos
WHERE id_proyecto = :id
";

$stmt = $conn->prepare($query);

$stmt->execute([
    ":id"=>$id_proyecto
]);

$proyecto = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$proyecto){

    echo json_encode([
        "success"=>false,
        "message"=>"Proyecto no encontrado"
    ]);

    exit;

}

//
// TRANSACCIONES
//

$query = "
SELECT
    id_transaccion,
    tipo,
    monto,
    fecha,
    descripcion
FROM transacciones
WHERE id_proyecto = :id
AND is_active = TRUE
";

$params = [
    ":id"=>$id_proyecto
];

if($fecha_inicio){

    $query .= " AND fecha >= :fecha_inicio ";

    $params[":fecha_inicio"] = $fecha_inicio;

}

if($fecha_fin){

    $query .= " AND fecha <= :fecha_fin ";

    $params[":fecha_fin"] = $fecha_fin;

}

$query .= " ORDER BY fecha ASC ";

$stmt = $conn->prepare($query);

$stmt->execute($params);

$transacciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

//
// TOTAL
//

$query = "
SELECT
    COALESCE(SUM(monto),0) AS total
FROM transacciones
WHERE id_proyecto = :id
AND is_active = TRUE
";

$params = [
    ":id"=>$id_proyecto
];

if($fecha_inicio){

    $query .= " AND fecha >= :fecha_inicio ";

    $params[":fecha_inicio"] = $fecha_inicio;

}

if($fecha_fin){

    $query .= " AND fecha <= :fecha_fin ";

    $params[":fecha_fin"] = $fecha_fin;

}

$stmt = $conn->prepare($query);

$stmt->execute($params);

$total = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([

    "success"=>true,

    "proyecto"=>$proyecto,

    "presupuesto"=>$proyecto["presupuesto"],

    "gastado"=>$total["total"],

    "restante"=>
        $proyecto["presupuesto"] - $total["total"],

    "transacciones"=>$transacciones

]);
?>