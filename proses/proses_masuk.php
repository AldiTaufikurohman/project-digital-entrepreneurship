<?php

include "../config/koneksi.php";

/** @var mysqli $conn */

$email = $_POST['email'];
$password = $_POST['password'];

$query = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);

    if (password_verify($password, $user['password'])) {
        // Login berhasil -> kembali ke beranda, bawa data untuk navbar
        header("Location: ../pages/index.html?login=success&nama=" . urlencode($user['nama']) . "&email=" . urlencode($user['email']));
        exit;
    } else {
        header("Location: masuk.php?error_login=" . urlencode("Password salah!"));
        exit;
    }
} else {
    header("Location: masuk.php?error_login=" . urlencode("Email tidak ditemukan!"));
    exit;
}

?>