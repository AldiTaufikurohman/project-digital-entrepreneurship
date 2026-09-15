<?php

header("Content-Type: application/json; charset=UTF-8");

/*
====================================================
KONEKSI DATABASE
====================================================
*/

// Memanggil file koneksi
require_once __DIR__ . "/../config/koneksi.php";


/*
====================================================
CEK KONEKSI DATABASE
====================================================
*/

if (!isset($conn) || !$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Database tidak terhubung"
    ]);
    exit;
}


/*
====================================================
FILTER PERIODE
====================================================
*/

// Ambil periode dari URL
// Contoh:
// dashboard.php?period=1
// dashboard.php?period=2

$period = isset($_GET["period"])
    ? intval($_GET["period"])
    : 1;


// Hanya izinkan 1, 2, 3, atau 5 tahun
if (!in_array($period, [1, 2, 3, 5])) {
    $period = 1;
}


/*
====================================================
TAHUN SEKARANG
====================================================
*/

$currentYear = date("Y");

$startYear = $currentYear - $period + 1;


/*
====================================================
TOTAL USER
====================================================
*/

$totalUsers = 0;

$queryUsers = mysqli_query(
    $conn,
    "SELECT COUNT(*) AS total FROM users"
);

if ($queryUsers) {

    $rowUsers = mysqli_fetch_assoc($queryUsers);

    if ($rowUsers) {
        $totalUsers = intval($rowUsers["total"]);
    }
}


/*
====================================================
TOTAL PENJUALAN
====================================================
*/

$totalSales = 0;

$querySales = mysqli_query(
    $conn,
    "
    SELECT COALESCE(SUM(total_harga), 0) AS total
    FROM orders
    WHERE status = 'completed'
    AND YEAR(tanggal_order) BETWEEN $startYear AND $currentYear
    "
);

if ($querySales) {

    $rowSales = mysqli_fetch_assoc($querySales);

    if ($rowSales) {
        $totalSales = floatval($rowSales["total"]);
    }
}


/*
====================================================
TOTAL E-LEARNING
====================================================
*/

$totalElearning = 0;

$queryElearning = mysqli_query(
    $conn,
    "
    SELECT COALESCE(SUM(od.jumlah), 0) AS total
    FROM order_details od
    INNER JOIN orders o
        ON od.order_id = o.id
    INNER JOIN products p
        ON od.product_id = p.id
    WHERE o.status = 'completed'
    AND p.kategori = 'E-Learning'
    AND YEAR(o.tanggal_order) BETWEEN $startYear AND $currentYear
    "
);

if ($queryElearning) {

    $rowElearning = mysqli_fetch_assoc($queryElearning);

    if ($rowElearning) {
        $totalElearning = intval($rowElearning["total"]);
    }
}


/*
====================================================
TOTAL BOOTCAMP
====================================================
*/

$totalBootcamp = 0;

$queryBootcamp = mysqli_query(
    $conn,
    "
    SELECT COALESCE(SUM(od.jumlah), 0) AS total
    FROM order_details od
    INNER JOIN orders o
        ON od.order_id = o.id
    INNER JOIN products p
        ON od.product_id = p.id
    WHERE o.status = 'completed'
    AND p.kategori = 'Bootcamp'
    AND YEAR(o.tanggal_order) BETWEEN $startYear AND $currentYear
    "
);

if ($queryBootcamp) {

    $rowBootcamp = mysqli_fetch_assoc($queryBootcamp);

    if ($rowBootcamp) {
        $totalBootcamp = intval($rowBootcamp["total"]);
    }
}


/*
====================================================
DATA GRAFIK PENJUALAN PER BULAN
====================================================
*/

$chartLabels = [];
$chartValues = [];

$monthlySales = [];


/*
====================================================
BUAT DATA 12 BULAN
====================================================
*/

for ($month = 1; $month <= 12; $month++) {

    $monthName = date(
        "M",
        mktime(0, 0, 0, $month, 1)
    );

    $chartLabels[] = $monthName;

    $monthlySales[$month] = 0;
}


/*
====================================================
QUERY PENJUALAN BULANAN
====================================================
*/

$queryMonthly = mysqli_query(
    $conn,
    "
    SELECT
        YEAR(tanggal_order) AS tahun,
        MONTH(tanggal_order) AS bulan,
        COALESCE(SUM(total_harga), 0) AS total
    FROM orders
    WHERE status = 'completed'
    AND YEAR(tanggal_order) BETWEEN $startYear AND $currentYear
    GROUP BY YEAR(tanggal_order), MONTH(tanggal_order)
    ORDER BY tahun ASC, bulan ASC
    "
);


/*
====================================================
MASUKKAN DATA PENJUALAN KE ARRAY
====================================================
*/

if ($queryMonthly) {

    while ($rowMonthly = mysqli_fetch_assoc($queryMonthly)) {

        $month = intval($rowMonthly["bulan"]);

        $total = floatval($rowMonthly["total"]);

        if (isset($monthlySales[$month])) {
            $monthlySales[$month] += $total;
        }
    }
}


/*
====================================================
BUAT DATA UNTUK CHART
====================================================
*/

for ($month = 1; $month <= 12; $month++) {

    $chartValues[] = $monthlySales[$month];
}


/*
====================================================
RINGKASAN PRODUK
====================================================
*/

$productElearning = 0;

$productBootcamp = 0;


/*
====================================================
QUERY PRODUK E-LEARNING
====================================================
*/

$queryProductElearning = mysqli_query(
    $conn,
    "
    SELECT COALESCE(SUM(od.jumlah), 0) AS total
    FROM order_details od
    INNER JOIN orders o
        ON od.order_id = o.id
    INNER JOIN products p
        ON od.product_id = p.id
    WHERE o.status = 'completed'
    AND p.kategori = 'E-Learning'
    AND YEAR(o.tanggal_order) BETWEEN $startYear AND $currentYear
    "
);

if ($queryProductElearning) {

    $rowProductElearning = mysqli_fetch_assoc(
        $queryProductElearning
    );

    if ($rowProductElearning) {

        $productElearning = intval(
            $rowProductElearning["total"]
        );
    }
}


/*
====================================================
QUERY PRODUK BOOTCAMP
====================================================
*/

$queryProductBootcamp = mysqli_query(
    $conn,
    "
    SELECT COALESCE(SUM(od.jumlah), 0) AS total
    FROM order_details od
    INNER JOIN orders o
        ON od.order_id = o.id
    INNER JOIN products p
        ON od.product_id = p.id
    WHERE o.status = 'completed'
    AND p.kategori = 'Bootcamp'
    AND YEAR(o.tanggal_order) BETWEEN $startYear AND $currentYear
    "
);

if ($queryProductBootcamp) {

    $rowProductBootcamp = mysqli_fetch_assoc(
        $queryProductBootcamp
    );

    if ($rowProductBootcamp) {

        $productBootcamp = intval(
            $rowProductBootcamp["total"]
        );
    }
}


/*
====================================================
TRANSAKSI TERBARU
====================================================
*/

$transactions = [];


/*
====================================================
QUERY TRANSAKSI
====================================================
*/

$queryTransactions = mysqli_query(
    $conn,
    "
    SELECT
        o.id,
        u.nama,
        o.total_harga,
        o.tanggal_order,
        o.status
    FROM orders o
    LEFT JOIN users u
        ON o.user_id = u.id
    ORDER BY o.tanggal_order DESC
    LIMIT 10
    "
);


/*
====================================================
AMBIL DATA TRANSAKSI
====================================================
*/

if ($queryTransactions) {

    while ($rowTransaction = mysqli_fetch_assoc(
        $queryTransactions
    )) {

        $transactions[] = [
            "id" => intval($rowTransaction["id"]),

            "nama" => $rowTransaction["nama"]
                ?? "User",

            "total_harga" => floatval(
                $rowTransaction["total_harga"]
            ),

            "tanggal_order" => $rowTransaction[
                "tanggal_order"
            ],

            "status" => $rowTransaction["status"]
        ];
    }
}


/*
====================================================
RESPONSE JSON
====================================================
*/

echo json_encode(
    [
        "success" => true,

        "period" => $period,

        "current_year" => intval($currentYear),

        "start_year" => intval($startYear),

        "stats" => [

            "total_sales" => $totalSales,

            "total_elearning" => $totalElearning,

            "total_bootcamp" => $totalBootcamp,

            "total_users" => $totalUsers
        ],

        "chart" => [

            "labels" => $chartLabels,

            "values" => $chartValues
        ],

        "monthly_sales" => $monthlySales,

        "products" => [

            "elearning" => $productElearning,

            "bootcamp" => $productBootcamp
        ],

        "transactions" => $transactions
    ],

    JSON_PRETTY_PRINT
);

?>