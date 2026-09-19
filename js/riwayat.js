// ============================================================
// RIWAYAT TRANSAKSI
// BELAJARYUK
// ============================================================

const RIWAYAT_API =
    "../proses/riwayat.php";


const PAYMENT_API =
    "../proses/create_payment.php";


const transactionTable =
    document.getElementById(
        "transactionTable"
    );


const transactionCount =
    document.getElementById(
        "transactionCount"
    );


let countdownInterval =
    null;


// ============================================================
// FORMAT RUPIAH
// ============================================================

function formatRupiah(
    value
) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style:
                "currency",

            currency:
                "IDR",

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                0
        }
    ).format(
        Number(value) || 0
    );

}


// ============================================================
// FORMAT TANGGAL
// ============================================================

function formatTanggal(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            String(value)
                .replace(
                    " ",
                    "T"
                )
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// STATUS
// ============================================================

function getStatusInfo(
    transaction
) {

    const status =
        String(
            transaction.transaction_status ||
            ""
        ).toLowerCase();


    if (
        status ===
        "settlement"
    ) {

        return {

            label:
                "Lunas",

            className:
                "status-success",

            printable:
                true

        };

    }


    if (
        status ===
        "capture"
    ) {

        return {

            label:
                "Lunas",

            className:
                "status-success",

            printable:
                true

        };

    }


    if (
        status ===
        "pending"
    ) {

        return {

            label:
                "Menunggu",

            className:
                "status-pending",

            printable:
                false

        };

    }


    if (
        status ===
        "expire" ||
        status ===
        "deny" ||
        status ===
        "cancel"
    ) {

        return {

            label:
                "Kadaluarsa",

            className:
                "status-failed",

            printable:
                false

        };

    }


    return {

        label:
            status ||
            "Tidak diketahui",

        className:
            "status-pending",

        printable:
            false

    };

}


// ============================================================
// JENIS PRODUK
// ============================================================

function getJenisProduk(
    value
) {

    if (
        String(value)
            .toLowerCase() ===
        "bootcamp"
    ) {

        return "Bootcamp";

    }


    return "E-Learning";

}


// ============================================================
// HITUNG SISA WAKTU
// ============================================================

function getRemainingSeconds(
    createdAt
) {

    if (
        !createdAt
    ) {

        return 0;

    }


    const created =
        new Date(
            String(createdAt)
                .replace(
                    " ",
                    "T"
                )
        );


    if (
        isNaN(
            created.getTime()
        )
    ) {

        return 0;

    }


    const expireTime =
        created.getTime() +
        (
            5 *
            60 *
            1000
        );


    return Math.max(
        Math.floor(
            (
                expireTime -
                Date.now()
            ) /
            1000
        ),
        0
    );

}


// ============================================================
// FORMAT COUNTDOWN
// ============================================================

function formatCountdown(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(
            minutes
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )
    );

}


// ============================================================
// BAYAR LAGI
// ============================================================

async function bayarLagi(
    transaction,
    button
) {

    try {

        /* ====================================================
           CEK WAKTU
        ==================================================== */

        const remaining =
            getRemainingSeconds(
                transaction.created_at
            );


        if (
            remaining <=
            0
        ) {

            alert(
                "Waktu pembayaran sudah habis."
            );


            loadRiwayat();

            return;

        }


        /* ====================================================
           CEK MIDTRANS
        ==================================================== */

        if (
            typeof window.snap ===
            "undefined"
        ) {

            alert(
                "Midtrans Snap belum tersedia. Periksa koneksi internet."
            );

            return;

        }


        /* ====================================================
           CEK DATA
        ==================================================== */

        if (
            !transaction.jenis_produk ||
            !transaction.produk_id
        ) {

            console.error(
                "DATA TRANSAKSI:",
                transaction
            );


            alert(
                "Data produk transaksi tidak lengkap."
            );

            return;

        }


        /* ====================================================
           KONFIRMASI
        ==================================================== */

        const yakin =
            confirm(
                "Lanjutkan pembayaran untuk " +
                (
                    transaction.nama_produk ||
                    "produk ini"
                ) +
                "?"
            );


        if (!yakin) {

            return;

        }


        /* ====================================================
           BUTTON LOADING
        ==================================================== */

        if (
            button
        ) {

            button.disabled =
                true;

            button.innerHTML =
                "Memproses...";

        }


        /* ====================================================
           CREATE PAYMENT
        ==================================================== */

        const response =
            await fetch(
                PAYMENT_API,
                {

                    method:
                        "POST",

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            {

                                jenis_produk:
                                    transaction.jenis_produk,

                                produk_id:
                                    Number(
                                        transaction.produk_id
                                    )

                            }
                        )

                }
            );


        /* ====================================================
           BACA RESPONSE
        ==================================================== */

        const rawText =
            await response.text();


        console.log(
            "PAYMENT RAW RESPONSE:",
            rawText
        );


        let result;


        try {

            result =
                JSON.parse(
                    rawText
                );

        }

        catch (
            error
        ) {

            console.error(
                "PAYMENT JSON ERROR:",
                error
            );


            throw new Error(
                "Response pembayaran bukan JSON."
            );

        }


        /* ====================================================
           LOGIN
        ==================================================== */

        if (
            response.status ===
            401
        ) {

            window.location.href =
                "../proses/masuk.php?redirect=" +
                encodeURIComponent(
                    window.location.href
                );

            return;

        }


        /* ====================================================
           CEK SERVER
        ==================================================== */

        if (
            !response.ok ||
            result.success !==
                true
        ) {

            throw new Error(
                result.message ||
                "Gagal membuat pembayaran."
            );

        }


        /* ====================================================
           AMBIL DATA PAYMENT
        ==================================================== */

        const paymentData =
            result.data ||
            {};


        const snapToken =
            paymentData.snap_token ||
            "";


        console.log(
            "PAYMENT DATA:",
            paymentData
        );


        console.log(
            "SNAP TOKEN:",
            snapToken
        );


        /* ====================================================
           CEK SNAP TOKEN
        ==================================================== */

        if (
            snapToken ===
            ""
        ) {

            throw new Error(
                "Snap Token tidak diberikan oleh server."
            );

        }


        /* ====================================================
           BUKA MIDTRANS
        ==================================================== */

        window.snap.pay(
            snapToken,
            {

                onSuccess:
                    function() {

                        alert(
                            "Pembayaran berhasil."
                        );


                        loadRiwayat();

                    },


                onPending:
                    function() {

                        alert(
                            "Pembayaran masih menunggu."
                        );


                        loadRiwayat();

                    },


                onError:
                    function() {

                        alert(
                            "Pembayaran gagal."
                        );


                        loadRiwayat();

                    },


                onClose:
                    function() {

                        if (
                            button
                        ) {

                            button.disabled =
                                false;

                            button.innerHTML =
                                "Bayar Lagi";

                        }

                    }

            }
        );

    }

    catch (
        error
    ) {

        console.error(
            "BAYAR LAGI ERROR:",
            error
        );


        alert(
            error.message ||
            "Terjadi kesalahan saat membuat pembayaran."
        );


        if (
            button
        ) {

            button.disabled =
                false;

            button.innerHTML =
                "Bayar Lagi";

        }

    }

}


// ============================================================
// LOAD RIWAYAT
// ============================================================

async function loadRiwayat() {

    if (
        countdownInterval
    ) {

        clearInterval(
            countdownInterval
        );

        countdownInterval =
            null;

    }


    if (
        transactionTable
    ) {

        transactionTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-history"
                >

                    Memuat transaksi...

                </td>

            </tr>

        `;

    }


    try {

        const response =
            await fetch(
                RIWAYAT_API +
                "?_=" +
                Date.now(),
                {

                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        const rawText =
            await response.text();


        console.log(
            "RIWAYAT RAW RESPONSE:",
            rawText
        );


        let result;


        try {

            result =
                JSON.parse(
                    rawText
                );

        }

        catch (
            error
        ) {

            throw new Error(
                "Response riwayat bukan JSON."
            );

        }


        /* ====================================================
           LOGIN
        ==================================================== */

        if (
            response.status ===
            401
        ) {

            window.location.href =
                "../proses/masuk.php?redirect=" +
                encodeURIComponent(
                    window.location.href
                );

            return;

        }


        /* ====================================================
           RESPONSE ERROR
        ==================================================== */

        if (
            !response.ok ||
            result.success !==
                true
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil riwayat."
            );

        }


        let transactions =
            result.data ||
            [];


        if (
            !Array.isArray(
                transactions
            )
        ) {

            transactions =
                [];

        }


        renderTransactions(
            transactions
        );


        startCountdown(
            transactions
        );

    }

    catch (
        error
    ) {

        console.error(
            "RIWAYAT ERROR:",
            error
        );


        if (
            transactionTable
        ) {

            transactionTable.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="error-history"
                    >

                        Gagal memuat riwayat:
                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }


        if (
            transactionCount
        ) {

            transactionCount.textContent =
                "Gagal memuat";

        }

    }

}


// ============================================================
// RENDER
// ============================================================

function renderTransactions(
    transactions
) {

    if (
        transactionCount
    ) {

        transactionCount.textContent =
            transactions.length +
            " transaksi";

    }


    if (
        !transactionTable
    ) {

        return;

    }


    /* ========================================================
       TIDAK ADA TRANSAKSI
    ======================================================== */

    if (
        transactions.length ===
        0
    ) {

        transactionTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-history"
                >

                    <strong>
                        Belum ada transaksi
                    </strong>

                    Belum ada pembelian
                    E-Learning atau Bootcamp.

                </td>

            </tr>

        `;

        return;

    }


    /* ========================================================
       TABEL
    ======================================================== */

    transactionTable.innerHTML =
        transactions
            .map(
                function(
                    transaction,
                    index
                ) {

                    const status =
                        getStatusInfo(
                            transaction
                        );


                    const jenis =
                        getJenisProduk(
                            transaction.jenis_produk
                        );


                    const namaProduk =
                        escapeHTML(
                            transaction.nama_produk ||
                            "-"
                        );


                    const orderId =
                        escapeHTML(
                            transaction.order_id ||
                            "-"
                        );


                    const tanggal =
                        escapeHTML(
                            formatTanggal(
                                transaction.settlement_time ||
                                transaction.transaction_time ||
                                transaction.created_at
                            )
                        );


                    const total =
                        escapeHTML(
                            formatRupiah(
                                transaction.gross_amount
                            )
                        );


                    let actionButton =
                        "";


                    /* ========================================
                       LUNAS
                    ======================================== */

                    if (
                        status.printable
                    ) {

                        actionButton = `

                            <a
                                href="../proses/cetak_transaksi.php?order_id=${encodeURIComponent(
                                    transaction.order_id
                                )}"
                                target="_blank"
                                class="btn-print"
                            >

                                Cetak Transaksi

                            </a>

                        `;

                    }


                    /* ========================================
                       MENUNGGU
                    ======================================== */

                    else if (
                        String(
                            transaction.transaction_status ||
                            ""
                        ).toLowerCase() ===
                        "pending"
                    ) {

                        const remaining =
                            getRemainingSeconds(
                                transaction.created_at
                            );


                        if (
                            remaining >
                            0
                        ) {

                            actionButton = `

                                <div
                                    class="payment-action"
                                >

                                    <button
                                        type="button"
                                        class="btn-print btn-pay-again"
                                        data-pay-order="${escapeHTML(
                                            transaction.order_id
                                        )}"
                                    >

                                        Bayar Lagi

                                    </button>


                                    <div
                                        class="payment-countdown"
                                        data-countdown-order="${escapeHTML(
                                            transaction.order_id
                                        )}"
                                    >

                                        ${formatCountdown(
                                            remaining
                                        )}

                                    </div>

                                </div>

                            `;

                        }

                        else {

                            actionButton = `

                                <span
                                    class="expired-text"
                                >

                                    Kadaluarsa

                                </span>

                            `;

                        }

                    }


                    /* ========================================
                       GAGAL / EXPIRE
                    ======================================== */

                    else {

                        actionButton = `

                            <span
                                class="no-print"
                            >

                                -

                            </span>

                        `;

                    }


                    /* ========================================
                       ROW
                    ======================================== */

                    return `

                        <tr>

                            <td>
                                ${
                                    index + 1
                                }
                            </td>


                            <td>

                                <div
                                    class="product-name"
                                >

                                    ${namaProduk}

                                </div>


                                <div
                                    class="product-type"
                                >

                                    ${jenis}

                                </div>

                            </td>


                            <td>

                                ${tanggal}

                            </td>


                            <td>

                                <span
                                    class="price"
                                >

                                    ${total}

                                </span>

                            </td>


                            <td>

                                <div
                                    class="order-code"
                                >

                                    ${orderId}

                                </div>

                            </td>


                            <td>

                                <span
                                    class="
                                        status-badge
                                        ${status.className}
                                    "
                                >

                                    ${escapeHTML(
                                        status.label
                                    )}

                                </span>

                            </td>


                            <td>

                                ${actionButton}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /* ========================================================
       EVENT BAYAR LAGI
    ======================================================== */

    const payAgainButtons =
        transactionTable.querySelectorAll(
            ".btn-pay-again"
        );


    payAgainButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const orderId =
                        button.getAttribute(
                            "data-pay-order"
                        );


                    const transaction =
                        transactions.find(
                            function(item) {

                                return String(
                                    item.order_id
                                ) ===
                                String(
                                    orderId
                                );

                            }
                        );


                    if (
                        !transaction
                    ) {

                        alert(
                            "Data transaksi tidak ditemukan."
                        );

                        return;

                    }


                    bayarLagi(
                        transaction,
                        button
                    );

                }
            );

        }
    );

}


// ============================================================
// COUNTDOWN
// ============================================================

function startCountdown(
    transactions
) {

    if (
        countdownInterval
    ) {

        clearInterval(
            countdownInterval
        );

    }


    countdownInterval =
        setInterval(
            function() {

                let adaExpired =
                    false;


                transactions.forEach(
                    function(transaction) {

                        const status =
                            String(
                                transaction.transaction_status ||
                                ""
                            ).toLowerCase();


                        if (
                            status !==
                            "pending"
                        ) {

                            return;

                        }


                        const orderId =
                            String(
                                transaction.order_id
                            );


                        const remaining =
                            getRemainingSeconds(
                                transaction.created_at
                            );


                        const countdownElement =
                            transactionTable.querySelector(
                                '[data-countdown-order="' +
                                CSS.escape(
                                    orderId
                                ) +
                                '"]'
                            );


                        const payButton =
                            transactionTable.querySelector(
                                '[data-pay-order="' +
                                CSS.escape(
                                    orderId
                                ) +
                                '"]'
                            );


                        /* ====================================
                           WAKTU HABIS
                        ==================================== */

                        if (
                            remaining <=
                            0
                        ) {

                            adaExpired =
                                true;


                            if (
                                countdownElement
                            ) {

                                countdownElement.textContent =
                                    "Kadaluarsa";

                            }


                            if (
                                payButton
                            ) {

                                payButton.disabled =
                                    true;

                            }


                            return;

                        }


                        /* ====================================
                           UPDATE COUNTDOWN
                        ==================================== */

                        if (
                            countdownElement
                        ) {

                            countdownElement.textContent =
                                formatCountdown(
                                    remaining
                                );

                        }

                    }
                );


                /* ============================================
                   RELOAD SETELAH EXPIRE
                ============================================ */

                if (
                    adaExpired
                ) {

                    clearInterval(
                        countdownInterval
                    );


                    countdownInterval =
                        null;


                    setTimeout(
                        function() {

                            loadRiwayat();

                        },
                        500
                    );

                }

            },
            1000
        );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadRiwayat();

    }
);