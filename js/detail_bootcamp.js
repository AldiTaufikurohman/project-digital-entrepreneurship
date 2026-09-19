const API_URL =
    "../admin-php/bootcamp.php";

const LOGIN_STATUS_API =
    "../proses/status_login.php";

const PAYMENT_API =
    "../proses/create_payment.php";


/* =====================================================
   AMBIL ID BOOTCAMP DARI URL

   Contoh:
   detail_bootcamp.html?id=5
===================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const bootcampId =
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

const courseMentor =
    document.getElementById(
        "courseMentor"
    );

const courseQuota =
    document.getElementById(
        "courseQuota"
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
    value
) {

    const number =
        Number(
            value
        ) || 0;


    /*
     * Harga 0 = GRATIS
     */

    if (
        number <= 0
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
        number
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =====================================================
   NORMALIZE DATE
===================================================== */

function normalizeDate(
    value
) {

    if (!value) {

        return "";

    }


    return String(
        value
    )
        .split("T")[0]
        .split(" ")[0];

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    value
) {

    const text =
        normalizeDate(
            value
        );


    if (!text) {

        return "-";

    }


    const parts =
        text.split("-");


    if (
        parts.length !== 3
    ) {

        return text;

    }


    const months = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"

    ];


    const day =
        Number(
            parts[2]
        );


    const monthIndex =
        Number(
            parts[1]
        ) - 1;


    const year =
        parts[0];


    return (

        day +
        " " +
        (
            months[
                monthIndex
            ] ||
            parts[1]
        ) +
        " " +
        year

    );

}


/* =====================================================
   HITUNG DURASI
===================================================== */

function calculateDuration(
    startDate,
    endDate
) {

    const startText =
        normalizeDate(
            startDate
        );


    const endText =
        normalizeDate(
            endDate
        );


    if (
        !startText ||
        !endText
    ) {

        return "-";

    }


    const start =
        new Date(
            startText +
            "T00:00:00"
        );


    const end =
        new Date(
            endText +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {

        return "-";

    }


    const difference =
        Math.round(
            (
                end.getTime() -
                start.getTime()
            ) /
            86400000
        ) + 1;


    if (
        difference <= 0
    ) {

        return "-";

    }


    return (
        difference +
        " hari"
    );

}


/* =====================================================
   PARSE BENEFIT
===================================================== */

function parseBenefits(
    benefit
) {

    if (!benefit) {

        return [];

    }


    /* =================================================
       ARRAY
    ================================================= */

    if (
        Array.isArray(
            benefit
        )
    ) {

        return benefit
            .map(
                function(item) {

                    return String(
                        item
                    ).trim();

                }
            )
            .filter(
                Boolean
            );

    }


    const value =
        String(
            benefit
        ).trim();


    if (!value) {

        return [];

    }


    /* =================================================
       JSON ARRAY
    ================================================= */

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

            return parsed
                .map(
                    function(item) {

                        return String(
                            item
                        ).trim();

                    }
                )
                .filter(
                    Boolean
                );

        }

    } catch (error) {

        /* Bukan JSON */

    }


    /* =================================================
       STRING BIASA
    ================================================= */

    return value
        .split(
            /[,|\n]+/
        )
        .map(
            function(item) {

                return item.trim();

            }
        )
        .filter(
            Boolean
        );

}


/* =====================================================
   RENDER BENEFIT
===================================================== */

function renderBenefits(
    benefit
) {

    if (
        !benefitGrid
    ) {

        return;

    }


    const benefits =
        parseBenefits(
            benefit
        );


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
            .slice(
                0,
                10
            )
            .map(
                function(item) {

                    return `

                        <div
                            class="benefit-card"
                            style="
                                padding:12px 16px;
                                text-align:left;
                                display:flex;
                                align-items:center;
                                background:#f8fafc;
                                border:1px solid #e2e8f0;
                                border-radius:10px;
                            "
                        >

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
            .join("");

}


/* =====================================================
   PROMO DATA
===================================================== */

function getPromoData(
    bootcamp
) {

    const hargaNormal =
        Number(
            bootcamp.harga
        ) || 0;


    /*
     * Nilai 0 tetap dipertahankan.
     */

    let hargaPromo =
        0;


    if (
        bootcamp.harga_promo !== null &&
        bootcamp.harga_promo !== undefined &&
        bootcamp.harga_promo !== ""
    ) {

        hargaPromo =
            Number(
                bootcamp.harga_promo
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
            bootcamp.promo_aktif
        ) === 1 ||
        bootcamp.promo_aktif === true ||
        bootcamp.promo_aktif === "1";


    let diskon =
        0;


    /*
     * HARGA NORMAL 0
     *
     * Bootcamp sudah gratis.
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
   RENDER PRICE
===================================================== */

function renderPrice(
    bootcamp
) {

    if (
        !coursePrice
    ) {

        return;

    }


    const promo =
        getPromoData(
            bootcamp
        );


    console.log(
        "=== HARGA BOOTCAMP DETAIL ==="
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


    /* =================================================
       HARGA NORMAL GRATIS
    ================================================= */

    if (
        promo.hargaNormal <= 0
    ) {

        coursePrice.innerHTML = `

            <strong
                style="
                    color:#16a34a;
                    font-size:16px;
                    font-weight:800;
                "
            >

                Gratis

            </strong>

        `;

        return;

    }


    /* =================================================
       PROMO GRATIS
    ================================================= */

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
                    gap:4px;
                    width:100%;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:flex-end;
                        gap:7px;
                        flex-wrap:wrap;
                    "
                >

                    <span
                        style="
                            color:#94a3b8;
                            font-size:11px;
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
                            padding:4px 7px;
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
                        font-size:16px;
                        line-height:1.2;
                        font-weight:800;
                    "
                >

                    Gratis

                </strong>

            </div>

        `;

        return;

    }


    /* =================================================
       PROMO NORMAL
    ================================================= */

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
                    gap:4px;
                    width:100%;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:flex-end;
                        gap:7px;
                        flex-wrap:wrap;
                    "
                >

                    <span
                        style="
                            color:#94a3b8;
                            font-size:11px;
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
                            padding:4px 7px;
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
                        font-weight:800;
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


    /* =================================================
       TANPA PROMO
    ================================================= */

    coursePrice.innerHTML = `

        <strong
            style="
                color:#2563eb;
                font-size:16px;
                font-weight:800;
            "
        >

            ${formatRupiah(
                promo.hargaNormal
            )}

        </strong>

    `;

}


/* =====================================================
   IMAGE
===================================================== */

function setImage(
    bootcamp
) {

    if (
        !courseImage
    ) {

        return;

    }


    let imagePath =
        bootcamp.gambar
            ? String(
                bootcamp.gambar
            ).trim()
            : "";


    if (
        imagePath
    ) {

        if (
            imagePath.startsWith(
                "http://"
            ) ||
            imagePath.startsWith(
                "https://"
            )
        ) {

            courseImage.src =
                imagePath;

        }

        else if (
            imagePath.startsWith(
                "../"
            )
        ) {

            courseImage.src =
                imagePath;

        }

        else if (
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
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85";

    }


    courseImage.alt =
        bootcamp.judul ||
        bootcamp.nama_bootcamp ||
        "Bootcamp";

}


/* =====================================================
   IMAGE ERROR
===================================================== */

if (
    courseImage
) {

    courseImage.addEventListener(
        "error",
        function() {

            this.onerror =
                null;


            this.src =
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85";

        }
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
   PEMBAYARAN
===================================================== */

async function startPayment(
    bootcamp
) {

    /* =================================================
       VALIDASI BOOTCAMP
    ================================================= */

    if (
        !bootcamp ||
        !bootcamp.id
    ) {

        alert(
            "Data bootcamp tidak valid."
        );

        return;

    }


    /* =================================================
       CEK LOGIN
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

    const button =
        document.getElementById(
            "registerButton"
        );


    const originalText =
        button
            ? button.textContent
            : "Beli Bootcamp";


    if (
        button
    ) {

        button.disabled =
            true;

        button.textContent =
            "Memproses...";

        button.style.opacity =
            "0.7";

        button.style.cursor =
            "not-allowed";

    }


    try {

        /* =================================================
           REQUEST CREATE PAYMENT
        ================================================= */

        const response =
            await fetch(
                PAYMENT_API,
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
                                "bootcamp",

                            produk_id:
                                Number(
                                    bootcamp.id
                                )

                        })

                }
            );


        /* =================================================
           RAW RESPONSE
        ================================================= */

        const rawText =
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
            rawText
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
                    rawText
                );

        }

        catch (
            parseError
        ) {

            console.error(
                "JSON PARSE ERROR:",
                parseError
            );


            throw new Error(
                "Response server bukan JSON."
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
           VALIDASI SUCCESS
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
           DATA PAYMENT
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


        console.log(
            "PAYMENT DATA:",
            paymentData
        );


        /* =================================================
           BOOTCAMP GRATIS
        ================================================= */

        if (
            paymentData.is_free === true
        ) {

            console.log(
                "BOOTCAMP GRATIS"
            );


            alert(
                "Bootcamp berhasil didaftarkan. Selamat belajar!"
            );


            /*
             * Tidak membuka Midtrans.
             */

            window.location.href =
                "riwayat.html";


            return;

        }


        /* =================================================
           SNAP TOKEN
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
                "Snap token tidak ditemukan."
            );

        }


        /* =================================================
           CEK SNAP JS
        ================================================= */

        if (
            typeof window.snap ===
            "undefined"
        ) {

            throw new Error(
                "Midtrans Snap belum tersedia. Periksa koneksi internet."
            );

        }


        console.log(
            "SNAP TOKEN:",
            snapToken
        );


        /* =================================================
           BUKA MIDTRANS
        ================================================= */

        window.snap.pay(
            snapToken,
            {

                /* =========================================
                   SUCCESS
                ========================================= */

                onSuccess:
                    function(
                        paymentResult
                    ) {

                        console.log(
                            "PEMBAYARAN BERHASIL:",
                            paymentResult
                        );


                        alert(
                            "Pembayaran berhasil!"
                        );


                        window.location.href =
                            "riwayat.html";

                    },


                /* =========================================
                   PENDING
                ========================================= */

                onPending:
                    function(
                        paymentResult
                    ) {

                        console.log(
                            "PEMBAYARAN PENDING:",
                            paymentResult
                        );


                        alert(
                            "Pembayaran belum selesai. Silakan selesaikan pembayaran melalui Midtrans."
                        );

                    },


                /* =========================================
                   ERROR
                ========================================= */

                onError:
                    function(
                        paymentResult
                    ) {

                        console.error(
                            "MIDTRANS PAYMENT ERROR:",
                            paymentResult
                        );


                        alert(
                            "Pembayaran gagal."
                        );

                    },


                /* =========================================
                   CLOSE
                ========================================= */

                onClose:
                    function() {

                        console.log(
                            "Midtrans ditutup oleh pengguna."
                        );

                    }

            }
        );

    }

    catch (
        error
    ) {

        console.error(
            "PAYMENT ERROR:",
            error
        );


        alert(
            "Gagal memproses pembayaran: " +
            error.message
        );

    }

    finally {

        if (
            button
        ) {

            button.disabled =
                false;

            button.textContent =
                originalText;

            button.style.opacity =
                "1";

            button.style.cursor =
                "pointer";

        }

    }

}


/* =====================================================
   REGISTER BUTTON
===================================================== */

function setupRegisterButton(
    bootcamp
) {

    if (
        !registerButton
    ) {

        return;

    }


    const kuota =
        Number(
            bootcamp.kuota ||
            bootcamp.kuota_peserta ||
            0
        );


    /* =================================================
       KUOTA PENUH
    ================================================= */

    if (
        kuota <= 0
    ) {

        registerButton.textContent =
            "Kuota Penuh";

        registerButton.disabled =
            true;

        registerButton.style.opacity =
            "0.6";

        registerButton.style.cursor =
            "not-allowed";

        return;

    }


    /* =================================================
       BUTTON AKTIF
    ================================================= */

    registerButton.textContent =
        "Beli Bootcamp";

    registerButton.disabled =
        false;

    registerButton.style.opacity =
        "1";

    registerButton.style.cursor =
        "pointer";


    /* =================================================
       PAYMENT
    ================================================= */

    registerButton.onclick =
        function() {

            startPayment(
                bootcamp
            );

        };

}


/* =====================================================
   LOAD DETAIL
===================================================== */

async function loadBootcampDetail() {

    /* =================================================
       CEK ID
    ================================================= */

    if (
        !bootcampId
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
           REQUEST KE PHP
        ================================================= */

        const response =
            await fetch(
                `${API_URL}?id=${encodeURIComponent(
                    bootcampId
                )}&_=${Date.now()}`,
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        /* =================================================
           RAW RESPONSE
        ================================================= */

        const rawText =
            await response.text();


        console.log(
            "BOOTCAMP RAW RESPONSE:",
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
            parseError
        ) {

            console.error(
                "BOOTCAMP JSON PARSE ERROR:",
                parseError
            );


            throw new Error(
                "Response API bootcamp bukan JSON."
            );

        }


        /* =================================================
           HTTP ERROR
        ================================================= */

        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "HTTP Error " +
                response.status
            );

        }


        console.log(
            "Detail bootcamp:",
            result
        );


        /* =================================================
           VALIDASI
        ================================================= */

        if (
            !result ||
            result.success !== true ||
            !result.data
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Bootcamp tidak ditemukan."
            );

        }


        let bootcamp =
            result.data;


        /* =================================================
           SUPPORT DATA ARRAY
        ================================================= */

        if (
            Array.isArray(
                bootcamp
            )
        ) {

            bootcamp =
                bootcamp[0];

        }


        if (
            !bootcamp ||
            !bootcamp.id
        ) {

            throw new Error(
                "Data bootcamp tidak ditemukan."
            );

        }


        console.log(
            "DATA BOOTCAMP LENGKAP:",
            bootcamp
        );


        /* =================================================
           DATA UTAMA
        ================================================= */

        const judul =
            bootcamp.judul ||
            bootcamp.nama_bootcamp ||
            bootcamp.nama_produk ||
            "Bootcamp";


        const kategori =
            bootcamp.kategori ||
            "Bootcamp";


        const mentor =
            bootcamp.mentor ||
            "Belum ditentukan";


        const kuota =
            Number(
                bootcamp.kuota ||
                bootcamp.kuota_peserta ||
                0
            );


        const deskripsi =
            bootcamp.deskripsi ||
            "Belum ada deskripsi bootcamp.";


        const durasi =
            calculateDuration(
                bootcamp.tanggal_mulai,
                bootcamp.tanggal_berakhir
            );


        const tanggalMulai =
            formatDate(
                bootcamp.tanggal_mulai
            );


        const tanggalBerakhir =
            formatDate(
                bootcamp.tanggal_berakhir
            );


        /* =================================================
           IMAGE
        ================================================= */

        setImage(
            bootcamp
        );


        /* =================================================
           HERO CATEGORY
        ================================================= */

        if (
            courseCategory
        ) {

            courseCategory.textContent =
                "BOOTCAMP";

        }


        if (
            courseSubcategory
        ) {

            courseSubcategory.textContent =
                kategori.toUpperCase();

        }


        /* =================================================
           HERO TITLE
        ================================================= */

        if (
            courseName
        ) {

            courseName.textContent =
                judul;

        }


        /* =================================================
           HERO DESCRIPTION
        ================================================= */

        if (
            courseDescription
        ) {

            courseDescription.textContent =
                deskripsi;

        }


        /* =================================================
           ABOUT
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
            courseMentor
        ) {

            courseMentor.textContent =
                mentor;

        }


        if (
            courseQuota
        ) {

            if (
                kuota > 0
            ) {

                courseQuota.textContent =
                    kuota +
                    " peserta";

            }

            else {

                courseQuota.textContent =
                    "Kuota penuh";

            }

        }


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
                tanggalMulai +
                " - " +
                tanggalBerakhir;

        }


        if (
            courseVariation
        ) {

            courseVariation.textContent =
                kategori;

        }


        /* =================================================
           PRICE
        ================================================= */

        renderPrice(
            bootcamp
        );


        /* =================================================
           BENEFITS
        ================================================= */

        renderBenefits(
            bootcamp.benefit
        );


        /* =================================================
           REGISTER / PAYMENT
        ================================================= */

        setupRegisterButton(
            bootcamp
        );


        /* =================================================
           TITLE
        ================================================= */

        document.title =
            judul +
            " - BELAJARYUK";


        /* =================================================
           SHOW CONTENT
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

    }

    catch (
        error
    ) {

        console.error(
            "GAGAL DETAIL BOOTCAMP:",
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
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadBootcampDetail();

    }
);