<?php

require_once __DIR__ . '/../../../vendor/autoload.php';

use Dompdf\Dompdf;

include(__DIR__ . '/../../config/database.php');

$id_proyecto = $_GET["id_proyecto"];

//
// PROYECTO
//

$query = "
SELECT *
FROM proyectos
WHERE id_proyecto=:id
";

$stmt = $conn->prepare($query);

$stmt->execute([
    ":id"=>$id_proyecto
]);

$proyecto = $stmt->fetch(PDO::FETCH_ASSOC);

//
// TRANSACCIONES
//

$query = "
SELECT *
FROM transacciones
WHERE id_proyecto=:id
AND is_active=TRUE
";

$stmt = $conn->prepare($query);

$stmt->execute([
    ":id"=>$id_proyecto
]);

$transacciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

//
// TOTAL
//

$query = "
SELECT COALESCE(SUM(monto),0) total
FROM transacciones
WHERE id_proyecto=:id
AND is_active=TRUE
";

$stmt = $conn->prepare($query);

$stmt->execute([
    ":id"=>$id_proyecto
]);

$total = $stmt->fetch(PDO::FETCH_ASSOC);

$restante =
$proyecto["presupuesto"] - $total["total"];

//
// HTML PDF
//

$html = "

<h1>Reporte Financiero</h1>

<h2>Proyecto</h2>

<p>
<b>Nombre:</b>
{$proyecto["nombre"]}
</p>

<p>
<b>Responsable:</b>
{$proyecto["responsable"]}
</p>

<p>
<b>Presupuesto:</b>
$ {$proyecto["presupuesto"]}
</p>

<p>
<b>Total Gastado:</b>
$ {$total["total"]}
</p>

<p>
<b>Restante:</b>
$ {$restante}
</p>

<h2>Transacciones</h2>

<table border='1' width='100%' cellpadding='5'>

<tr>
<th>ID</th>
<th>Tipo</th>
<th>Monto</th>
<th>Fecha</th>
<th>Descripción</th>
</tr>

";

foreach($transacciones as $t){

$html .= "

<tr>
<td>{$t["id_transaccion"]}</td>
<td>{$t["tipo"]}</td>
<td>$ {$t["monto"]}</td>
<td>{$t["fecha"]}</td>
<td>{$t["descripcion"]}</td>
</tr>

";

}

$html .= "</table>";

//
// PDF
//

$dompdf = new Dompdf();

$dompdf->loadHtml($html);

$dompdf->setPaper('A4', 'portrait');

$dompdf->render();

$dompdf->stream(
    "reporte_proyecto.pdf",
    ["Attachment"=>false]
);
?>