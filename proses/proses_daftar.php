<?php

include "../config/koneksi.php";

/** @var mysqli $conn */

$nama = $_POST['nama'];
$email = $_POST['email'];
$password = $_POST['password'];

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$query = "INSERT INTO users (nama, email, password) 
          VALUES ('$nama', '$email', '$password_hash')";

if (mysqli_query($conn, $query)) {
    // Daftar berhasil -> langsung anggap login, kembali ke beranda
    header("Location: ../pages/index.html?login=success&nama=" . urlencode($nama) . "&email=" . urlencode($email));
    exit;
} else {
    header("Location: daftar.php?error_register=" . urlencode("Pendaftaran gagal: " . mysqli_error($conn)));
    exit;
}

?>