const API_URL =
    "../admin-php/elearning.php";

const LOGIN_STATUS_API =
    "../proses/status_login.php";

const RIWAYAT_API =
    "../proses/riwayat.php";


/* =====================================================
   AMBIL ID COURSE DARI URL
===================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    urlParams.get("id");


/* =====================================================
   ELEMENT
===================================================== */

const loadingDetail =
    document.getElementById(
        "loadingDetail"
    );

const detailContent =
    document.getElementById(
        "detailContent"
    );

const errorDetail =
    document.getElementById(
        "errorDetail"
    );


const courseImage =
    document.getElementById(
        "courseImage"
    );

const courseCategory =
    document.getElementById(
        "courseCategory"
    );

const courseSubcategory =
    document.getElementById(
        "courseSubcategory"
    );

const courseName =
    document.getElementById(
        "courseName"
    );

const courseDescription =
    document.getElementById(
        "courseDescription"
    );


const aboutCourse =
    document.getElementById(
        "aboutCourse"
    );


const courseDuration =
    document.getElementById(
        "courseDuration"
    );

const courseSchedule =
    document.getElementById(
        "courseSchedule"
    );

const courseVariation =
    document.getElementById(
        "courseVariation"
    );

const coursePrice =
    document.getElementById(
        "coursePrice"
    );


const benefitGrid =
    document.getElementById(
        "benefitGrid"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function formatRupiah(
    number
) {

    const value =
        Number(
            number
        ) || 0;


    /*
     * Harga 0 = GRATIS
     */

    if (
        value <= 0
    ) {

        return "Gratis";

    }


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
        value
    );

}


/* =====================================================
   DATA PROMO
===================================================== */

function getPromoData(
    course
) {

    const hargaNormal =
        Number(
            course.harga
        ) || 0;


    /*
     * Nilai 0 harus tetap dipertahankan.
     */

    let hargaPromo =
        0;


    if (
        course.harga_promo !== null &&
        course.harga_promo !== undefined &&
        course.harga_promo !== ""
    ) {

        hargaPromo =
            Number(
                course.harga_promo
            );

    }


    if (
        !Number.isFinite(
            hargaPromo
        )
    ) {

        hargaPromo =
            0;

    }


    const promoAktif =
        Number(
            course.promo_aktif
        ) === 1 ||

        course.promo_aktif ===
            true ||

        course.promo_aktif ===
            "1";


    let diskon =
        0;


    /*
     * HARGA NORMAL 0
     *
     * Course gratis.
     */

    if (
        hargaNormal <= 0
    ) {

        diskon =
            0;

    }


    /*
     * PROMO GRATIS
     *
     * Harga normal > 0
     * Harga promo = 0
     */

    else if (
        promoAktif &&
        hargaPromo === 0
    ) {

        diskon =
            100;

    }


    /*
     * PROMO NORMAL
     */

    else if (
        promoAktif &&
        hargaNormal > 0 &&
        hargaPromo > 0 &&
        hargaPromo <
        hargaNormal
    ) {

        diskon =
            Math.round(
                (
                    (
                        hargaNormal -
                        hargaPromo
                    ) /
                    hargaNormal
                ) *
                100
            );

    }


    return {

        aktif:
            promoAktif,

        hargaNormal:
            hargaNormal,

        hargaPromo:
            hargaPromo,

        diskon:
            diskon

    };

}


/* =====================================================
   TAMPILKAN HARGA
===================================================== */

function renderPrice(
    course
) {

    if (
        !coursePrice
    ) {

        return;

    }


    const promo =
        getPromoData(
            course
        );


    console.log(
        "=== HARGA DETAIL ==="
    );


    console.log(
        "Harga normal:",
        promo.hargaNormal
    );


    console.log(
        "Harga promo:",
        promo.hargaPromo
    );


    console.log(
        "Promo aktif:",
        promo.aktif
    );


    console.log(
        "Diskon:",
        promo.diskon + "%"
    );


    /*
     * COURSE GRATIS
     *
     * harga normal = 0
     */

    if (
        promo.hargaNormal <= 0
    ) {

        coursePrice.innerHTML = `

            <strong
                style="
                    color:#16a34a;
                    font-size:15px;
                    line-height:1.2;
                    font-weight:700;
                "
            >

                Gratis

            </strong>

        `;

        return;

    }


    /*
     * PROMO GRATIS
     *
     * harga normal > 0
     * harga promo = 0
     */

    if (
        promo.aktif &&
        promo.hargaPromo === 0
    ) {

        coursePrice.innerHTML = `

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    align-items:flex-end;
                    gap:3px;
                    width:100%;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:flex-end;
                        gap:6px;
                        flex-wrap:wrap;
                    "
                >

                    <span
                        style="
                            color:#94a3b8;
                            font-size:10px;
                            font-weight:500;
                            text-decoration:line-through;
                        "
                    >

                        ${formatRupiah(
                            promo.hargaNormal
                        )}

                    </span>


                    <span
                        style="
                            display:inline-flex;
                            align-items:center;
                            justify-content:center;
                            padding:3px 6px;
                            border-radius:999px;
                            background:#fef2f2;
                            border:1px solid #fee2e2;
                            color:#dc2626;
                            font-size:10px;
                            font-weight:800;
                            white-space:nowrap;
                        "
                    >

                        100% OFF

                    </span>

                </div>


                <strong
                    style="
                        color:#16a34a;
                        font-size:15px;
                        line-height:1.2;
                        font-weight:700;
                    "
                >

                    Gratis

                </strong>

            </div>

        `;

        return;

    }


    /*
     * PROMO NORMAL
     */

    if (
        promo.aktif &&
        promo.hargaPromo > 0 &&
        promo.hargaPromo <
        promo.hargaNormal
    ) {

        coursePrice.innerHTML = `

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    align-items:flex-end;
                    gap:3px;
                    width:100%;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:flex-end;
                        gap:6px;
                        flex-wrap:wrap;
                    "
                >

                    <span
                        style="
                            color:#94a3b8;
                            font-size:10px;
                            font-weight:500;
                            text-decoration:line-through;
                        "
                    >

                        ${formatRupiah(
                            promo.hargaNormal
                        )}

                    </span>


                    <span
                        style="
                            display:inline-flex;
                            align-items:center;
                            justify-content:center;
                            padding:3px 6px;
                            border-radius:999px;
                            background:#fef2f2;
                            border:1px solid #fee2e2;
                            color:#dc2626;
                            font-size:10px;
                            font-weight:800;
                            white-space:nowrap;
                        "
                    >

                        ${promo.diskon}% OFF

                    </span>

                </div>


                <strong
                    style="
                        color:#2563eb;
                        font-size:15px;
                        line-height:1.2;
                        font-weight:700;
                    "
                >

                    ${formatRupiah(
                        promo.hargaPromo
                    )}

                </strong>

            </div>

        `;

        return;

    }


    /*
     * TANPA PROMO
     */

    coursePrice.innerHTML = `

        <strong
            style="
                color:#2563eb;
                font-size:14px;
                font-weight:700;
            "
        >

            ${formatRupiah(
                promo.hargaNormal
            )}

        </strong>

    `;

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
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


/* =====================================================
   AMBIL BENEFIT
===================================================== */

function getBenefits(
    benefit
) {

    if (
        !benefit
    ) {

        return [];

    }


    let benefits =
        [];


    /* =================================================
       ARRAY
    ================================================= */

    if (
        Array.isArray(
            benefit
        )
    ) {

        benefits =
            benefit;

    }


    /* =================================================
       STRING
    ================================================= */

    else {

        const value =
            String(
                benefit
            ).trim();


        if (
            !value
        ) {

            return [];

        }


        /* =============================================
           JSON
        ============================================= */

        try {

            const parsed =
                JSON.parse(
                    value
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                benefits =
                    parsed;

            }

        } catch (error) {

            /* bukan JSON */

        }


        /* =============================================
           STRING BIASA
        ============================================= */

        if (
            benefits.length === 0
        ) {

            benefits =
                value
                    .split(
                        /[,|\n]+/
                    )
                    .map(
                        function(
                            item
                        ) {

                            return item.trim();

                        }
                    )
                    .filter(
                        function(
                            item
                        ) {

                            return item !== "";

                        }
                    );

        }

    }


    return benefits
        .map(
            function(
                item
            ) {

                return String(
                    item
                ).trim();

            }
        )
        .filter(
            function(
                item
            ) {

                return item !== "";

            }
        )
        .slice(
            0,
            10
        );

}


/* =====================================================
   TAMPILKAN BENEFIT
===================================================== */

function renderBenefits(
    benefit
) {

    const benefits =
        getBenefits(
            benefit
        );


    if (
        !benefitGrid
    ) {

        return;

    }


    if (
        benefits.length === 0
    ) {

        benefitGrid.innerHTML = `

            <div
                class="benefit-card"
                style="
                    grid-column:1/-1;
                    padding:14px 16px;
                    background:#f8fafc;
                    border-radius:12px;
                    color:#64748b;
                    font-size:13px;
                "
            >

                Belum ada benefit.

            </div>

        `;

        return;

    }


    benefitGrid.innerHTML =
        benefits
            .map(
                function(
                    item
                ) {

                    return `

                        <div
                            class="benefit-card"
                            style="
                                padding:12px 16px;
                                text-align:left;
                                display:flex;
                                align-items:center;
                                gap:8px;
                                background:#f8fafc;
                                border:1px solid #e2e8f0;
                                border-radius:10px;
                            "
                        >

                            <span
                                style="
                                    color:#2563eb;
                                    font-weight:bold;
                                "
                            >

                                ✓

                            </span>


                            <span
                                style="
                                    font-size:12.5px;
                                    font-weight:600;
                                    color:#334155;
                                "
                            >

                                ${escapeHTML(
                                    item
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join(
                ""
            );

}


/* =====================================================
   LOGIN STATUS
===================================================== */

async function checkLoginStatus() {

    const localLogin =
        localStorage.getItem(
            "belajaryuk_login"
        );


    if (
        localLogin === "true"
    ) {

        return true;

    }


    try {

        const response =
            await fetch(
                LOGIN_STATUS_API +
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


        if (
            !response.ok
        ) {

            return false;

        }


        const result =
            await response.json();


        console.log(
            "STATUS LOGIN:",
            result
        );


        if (
            result.logged_in === true
        ) {

            localStorage.setItem(
                "belajaryuk_login",
                "true"
            );


            if (
                result.nama
            ) {

                localStorage.setItem(
                    "belajaryuk_nama",
                    result.nama
                );

            }


            if (
                result.email
            ) {

                localStorage.setItem(
                    "belajaryuk_email",
                    result.email
                );

            }


            return true;

        }


        return false;

    } catch (error) {

        console.error(
            "LOGIN STATUS ERROR:",
            error
        );


        return false;

    }

}


/* =====================================================
   CEK COURSE SUDAH DIBELI
   MENGGUNAKAN riwayat.php
===================================================== */

async function checkCoursePurchased(
    productId
) {

    try {

        const loggedIn =
            await checkLoginStatus();


        if (
            !loggedIn
        ) {

            return false;

        }


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


        if (
            !response.ok
        ) {

            console.error(
                "RIWAYAT STATUS HTTP ERROR:",
                response.status
            );

            return false;

        }


        const result =
            await response.json();


        console.log(
            "RIWAYAT UNTUK CEK COURSE:",
            result
        );


        let transactions =
            [];


        /*
         * Jika response berbentuk:
         *
         * {
         *    success: true,
         *    data: [...]
         * }
         */

        if (
            result &&
            Array.isArray(
                result.data
            )
        ) {

            transactions =
                result.data;

        }


        /*
         * Jika response langsung array
         */

        else if (
            Array.isArray(
                result
            )
        ) {

            transactions =
                result;

        }


        if (
            !transactions.length
        ) {

            return false;

        }


        const targetId =
            Number(
                productId
            );


        /*
         * Hanya transaksi yang SUDAH LUNAS
         *
         * settlement = termasuk course gratis
         * capture    = pembayaran berhasil
         */

        const purchased =
            transactions.some(
                function(
                    transaction
                ) {

                    const transactionProductId =
                        Number(
                            transaction.produk_id
                        );


                    const transactionType =
                        String(
                            transaction.jenis_produk ||
                            ""
                        ).toLowerCase();


                    const transactionStatus =
                        String(
                            transaction.transaction_status ||
                            ""
                        ).toLowerCase();


                    const isSettlement =
                        transactionStatus ===
                        "settlement";


                    const isCapture =
                        transactionStatus ===
                        "capture";


                    return (

                        transactionType ===
                        "elearning"

                        &&

                        transactionProductId ===
                        targetId

                        &&

                        (
                            isSettlement ||
                            isCapture
                        )

                    );

                }
            );


        console.log(
            "COURSE ID:",
            targetId
        );


        console.log(
            "SUDAH DIBELI:",
            purchased
        );


        return purchased;

    } catch (error) {

        console.error(
            "CHECK COURSE PURCHASED ERROR:",
            error
        );


        return false;

    }

}


/* =====================================================
   TAMPILKAN BUTTON BELUM / SUDAH BELI
===================================================== */

function setButtonBuy(
    course
) {

    if (
        !registerButton
    ) {

        return;

    }


    registerButton.disabled =
        false;


    registerButton.textContent =
        "Beli Course";


    registerButton.onclick =
        function() {

            startPayment(
                course
            );

        };

}


/* =====================================================
   TAMPILKAN BUTTON MULAI BELAJAR
===================================================== */

function setButtonStartLearning(
    course
) {

    if (
        !registerButton
    ) {

        return;

    }


    registerButton.disabled =
        false;


    registerButton.textContent =
        "Mulai Belajar";


    registerButton.onclick =
        function() {

            /*
             * Untuk sementara diarahkan
             * ke halaman Kelas Saya.
             *
             * Course ID ikut dikirim.
             */

            window.location.href =
                "kelas.html?id=" +
                encodeURIComponent(
                    course.id
                );

        };

}


/* =====================================================
   UPDATE BUTTON STATUS
===================================================== */

async function updatePurchaseButton(
    course
) {

    if (
        !registerButton ||
        !course
    ) {

        return;

    }


    /*
     * Default:
     * Beli Course
     */

    setButtonBuy(
        course
    );


    const sudahBeli =
        await checkCoursePurchased(
            course.id
        );


    if (
        sudahBeli
    ) {

        setButtonStartLearning(
            course
        );

    }

}


/* =====================================================
   BAYAR E-LEARNING
===================================================== */

async function startPayment(
    course
) {

    if (
        !course
    ) {

        alert(
            "Data course tidak ditemukan."
        );

        return;

    }


    if (
        !course.id
    ) {

        alert(
            "ID course tidak ditemukan."
        );

        return;

    }


    /* =================================================
       LOGIN
    ================================================= */

    const loggedIn =
        await checkLoginStatus();


    if (
        !loggedIn
    ) {

        window.location.href =
            "../proses/masuk.php?redirect=" +
            encodeURIComponent(
                window.location.href
            );

        return;

    }


    /* =================================================
       BUTTON
    ================================================= */

    const originalText =
        registerButton
            ? registerButton.textContent
            : "Beli Course";


    if (
        registerButton
    ) {

        registerButton.disabled =
            true;

        registerButton.textContent =
            "Memproses...";

    }


    try {

        /* =================================================
           REQUEST KE PHP
        ================================================= */

        const response =
            await fetch(
                "../proses/create_payment.php",
                {
                    method:
                        "POST",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            jenis_produk:
                                "elearning",

                            produk_id:
                                Number(
                                    course.id
                                )

                        })

                }
            );


        /* =================================================
           AMBIL RESPONSE TEXT
        ================================================= */

        const responseText =
            await response.text();


        console.log(
            "================================================"
        );


        console.log(
            "CREATE PAYMENT HTTP STATUS:",
            response.status
        );


        console.log(
            "CREATE PAYMENT RAW RESPONSE:",
            responseText
        );


        console.log(
            "================================================"
        );


        /* =================================================
           PARSE JSON
        ================================================= */

        let result =
            null;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (
            jsonError
        ) {

            console.error(
                "JSON PARSE ERROR:",
                jsonError
            );


            throw new Error(
                "Response dari server bukan JSON:\n" +
                responseText
            );

        }


        /* =================================================
           HTTP ERROR
        ================================================= */

        if (
            !response.ok
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Server error: " +
                      response.status
            );

        }


        /* =================================================
           SUCCESS
        ================================================= */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Gagal membuat pembayaran."
            );

        }


        /* =================================================
           DATA
        ================================================= */

        if (
            !result.data
        ) {

            throw new Error(
                "Data pembayaran tidak ditemukan."
            );

        }


        const paymentData =
            result.data;


        /* =================================================
           CEK COURSE GRATIS
        ================================================= */

        if (
            paymentData.is_free === true
        ) {

            console.log(
                "COURSE GRATIS:"
            );


            console.log(
                paymentData
            );


            alert(
                "Course berhasil ditambahkan. Selamat belajar!"
            );


            /*
             * LANGSUNG UBAH BUTTON
             * menjadi Mulai Belajar
             */

            setButtonStartLearning(
                course
            );


            return;

        }


        /* =================================================
           CEK SNAP TOKEN
        ================================================= */

        const snapToken =
            paymentData.snap_token ||
            "";


        if (
            !snapToken
        ) {

            console.error(
                "RESPONSE TANPA SNAP TOKEN:",
                result
            );


            throw new Error(
                "Snap Token tidak ditemukan."
            );

        }


        console.log(
            "SNAP TOKEN BERHASIL DIDAPAT:"
        );


        console.log(
            snapToken
        );


        /* =================================================
           CEK SNAP JS
        ================================================= */

        if (
            typeof window.snap ===
            "undefined"
        ) {

            alert(
                "Midtrans belum termuat. Silakan refresh halaman."
            );


            console.error(
                "window.snap tidak ditemukan."
            );

            return;

        }


        /* =================================================
           BUKA MIDTRANS
        ================================================= */

        window.snap.pay(
            snapToken,
            {

                onSuccess:
                    function(
                        paymentResult
                    ) {

                        console.log(
                            "================================================"
                        );


                        console.log(
                            "MIDTRANS SUCCESS"
                        );


                        console.log(
                            paymentResult
                        );


                        console.log(
                            "================================================"
                        );


                        alert(
                            "Pembayaran berhasil. Terima kasih!"
                        );


                        /*
                         * PAYMENT BERHASIL
                         * UBAH BUTTON
                         */

                        setButtonStartLearning(
                            course
                        );

                    },


                onPending:
                    function(
                        paymentResult
                    ) {

                        console.log(
                            "================================================"
                        );


                        console.log(
                            "MIDTRANS PENDING"
                        );


                        console.log(
                            paymentResult
                        );


                        console.log(
                            "================================================"
                        );


                        alert(
                            "Pembayaran dibuat dan masih menunggu pembayaran."
                        );

                    },


                onError:
                    function(
                        paymentResult
                    ) {

                        console.error(
                            "================================================"
                        );


                        console.error(
                            "MIDTRANS ERROR"
                        );


                        console.error(
                            paymentResult
                        );


                        console.error(
                            "================================================"
                        );


                        alert(
                            "Pembayaran gagal. Silakan coba lagi."
                        );

                    },


                onClose:
                    function() {

                        console.log(
                            "Popup Midtrans ditutup."
                        );

                    }

            }
        );

    } catch (
        error
    ) {

        console.error(
            "================================================"
        );


        console.error(
            "PAYMENT ERROR:"
        );


        console.error(
            error
        );


        console.error(
            "================================================"
        );


        alert(
            error.message
        );

    } finally {

        /*
         * Hanya kembalikan tombol kalau
         * belum berubah menjadi Mulai Belajar.
         */

        if (
            registerButton &&
            registerButton.textContent ===
            "Memproses..."
        ) {

            registerButton.disabled =
                false;

            registerButton.textContent =
                originalText;

        }

    }

}


/* =====================================================
   LOAD DETAIL COURSE
===================================================== */

async function loadCourseDetail() {

    /* =================================================
       CEK ID
    ================================================= */

    if (
        !courseId
    ) {

        if (
            loadingDetail
        ) {

            loadingDetail.style.display =
                "none";

        }


        if (
            errorDetail
        ) {

            errorDetail.style.display =
                "block";

        }


        return;

    }


    try {

        /* =================================================
           REQUEST
        ================================================= */

        const response =
            await fetch(
                `${API_URL}?id=${encodeURIComponent(
                    courseId
                )}`,
                {
                    method:
                        "GET",

                    cache:
                        "no-cache",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP Error ${response.status}`
            );

        }


        /* =================================================
           JSON
        ================================================= */

        const result =
            await response.json();


        console.log(
            "Detail course dari database:",
            result
        );


        /* =================================================
           VALIDASI
        ================================================= */

        if (
            !result.success ||
            !result.data
        ) {

            throw new Error(
                result.message ||
                "Course tidak ditemukan."
            );

        }


        const course =
            result.data;


        /* =================================================
           DEBUG
        ================================================= */

        console.log(
            "=== DATA COURSE ==="
        );


        console.log(
            "ID:",
            course.id
        );


        console.log(
            "Nama:",
            course.nama_produk
        );


        console.log(
            "Harga normal:",
            course.harga
        );


        console.log(
            "Harga promo:",
            course.harga_promo
        );


        console.log(
            "Promo aktif:",
            course.promo_aktif
        );


        console.log(
            "Data lengkap:",
            course
        );


        /* =================================================
           DATA
        ================================================= */

        const nama =
            course.nama_produk ||
            "Course";


        const deskripsi =
            course.deskripsi ||
            "Belum ada deskripsi course.";


        const subkategori =
            course.subkategori ||
            "E-Learning";


        const durasi =
            course.durasi ||
            "-";


        const jadwal =
            course.jadwal ||
            "-";


        /* =================================================
           GAMBAR
        ================================================= */

        if (
            courseImage
        ) {

            if (
                course.gambar
            ) {

                let imagePath =
                    String(
                        course.gambar
                    ).trim();


                if (
                    imagePath.startsWith(
                        "../"
                    )
                ) {

                    courseImage.src =
                        imagePath;

                }

                else if (
                    imagePath.startsWith(
                        "http://"
                    ) ||
                    imagePath.startsWith(
                        "https://"
                    ) ||
                    imagePath.startsWith(
                        "/"
                    )
                ) {

                    courseImage.src =
                        imagePath;

                }

                else {

                    courseImage.src =
                        "../" +
                        imagePath;

                }

            }

            else {

                courseImage.src =
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80";

            }


            courseImage.alt =
                nama;

        }


        /* =================================================
           HERO
        ================================================= */

        if (
            courseCategory
        ) {

            courseCategory.textContent =
                "E-LEARNING";

        }


        if (
            courseSubcategory
        ) {

            courseSubcategory.textContent =
                subkategori.toUpperCase();

        }


        if (
            courseName
        ) {

            courseName.textContent =
                nama;

        }


        if (
            courseDescription
        ) {

            courseDescription.textContent =
                deskripsi;

        }


        /* =================================================
           TENTANG PROGRAM
        ================================================= */

        if (
            aboutCourse
        ) {

            aboutCourse.textContent =
                deskripsi;

        }


        /* =================================================
           RINGKASAN
        ================================================= */

        if (
            courseDuration
        ) {

            courseDuration.textContent =
                durasi;

        }


        if (
            courseSchedule
        ) {

            courseSchedule.textContent =
                jadwal;

        }


        if (
            courseVariation
        ) {

            courseVariation.textContent =
                subkategori;

        }


        /* =================================================
           HARGA
        ================================================= */

        renderPrice(
            course
        );


        /* =================================================
           BENEFIT
        ================================================= */

        renderBenefits(
            course.benefit
        );


        /* =================================================
           BUTTON DEFAULT
        ================================================= */

        setButtonBuy(
            course
        );


        /* =================================================
           CEK STATUS PEMBELIAN
        ================================================= */

        await updatePurchaseButton(
            course
        );


        /* =================================================
           TITLE
        ================================================= */

        document.title =
            `${nama} - BELAJARYUK`;


        /* =================================================
           SHOW DETAIL
        ================================================= */

        if (
            loadingDetail
        ) {

            loadingDetail.style.display =
                "none";

        }


        if (
            detailContent
        ) {

            detailContent.style.display =
                "block";

        }


        if (
            errorDetail
        ) {

            errorDetail.style.display =
                "none";

        }

    } catch (
        error
    ) {

        console.error(
            "Gagal mengambil detail course:",
            error
        );


        if (
            loadingDetail
        ) {

            loadingDetail.style.display =
                "none";

        }


        if (
            detailContent
        ) {

            detailContent.style.display =
                "none";

        }


        if (
            errorDetail
        ) {

            errorDetail.style.display =
                "block";

        }

    }

}


/* =====================================================
   JALANKAN
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadCourseDetail();

    }
);