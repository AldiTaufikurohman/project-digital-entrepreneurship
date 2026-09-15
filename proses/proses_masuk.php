<?php

session_start();

include "../config/koneksi.php";

/** @var mysqli $conn */

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$query = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {

    $user = mysqli_fetch_assoc($result);

    // Cek password:
    // Bisa password yang sudah di-hash atau password teks biasa
    $passwordBenar =
        password_verify($password, $user['password']) ||
        $password === $user['password'];

    if ($passwordBenar) {

        // Simpan data login
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['nama'] = $user['nama'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];

        // Jika ADMIN
        if ($user['role'] === 'admin') {

            header("Location: ../admin/dashboard.html");
            exit;

        }

        // Jika USER biasa
        header(
            "Location: ../pages/index.html?login=success&nama=" .
            urlencode($user['nama']) .
            "&email=" .
            urlencode($user['email'])
        );
        exit;

    } else {

        header(
            "Location: masuk.php?error_login=" .
            urlencode("Password salah!")
        );
        exit;
    }

} else {

    header(
        "Location: masuk.php?error_login=" .
        urlencode("Email tidak ditemukan!")
    );
    exit;
}

?>