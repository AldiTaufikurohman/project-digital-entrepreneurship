const BOOTCAMP_API =
    "../admin-php/bootcamp.php";

const LOGIN_STATUS_API =
    "../proses/status_login.php";


let bootcampData = [];

let activeFilter =
    "Semua Batch";

let searchKeyword =
    "";

let selectedBootcampId =
    null;


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

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
   RUPIAH
===================================================== */

function formatRupiah(value) {

    const number =
        Number(value) || 0;


    /*
     * Harga 0 = GRATIS
     */

    if (
        number <= 0
    ) {

        return "Gratis";

    }


    return (
        "Rp " +
        number.toLocaleString(
            "id-ID"
        )
    );

}


/* =====================================================
   DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const text =
        String(value)
            .trim()
            .split("T")[0]
            .split(" ")[0];


    const parts =
        text.split("-");


    if (
        parts.length !== 3
    ) {

        return text;

    }


    const month = [

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


    return (

        Number(
            parts[2]
        ) +
        " " +
        (
            month[
                Number(
                    parts[1]
                ) - 1
            ] ||
            parts[1]
        ) +
        " " +
        parts[0]

    );

}


/* =====================================================
   NORMALIZE DATE
===================================================== */

function normalizeDate(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .split("T")[0]
        .split(" ")[0];

}


/* =====================================================
   HITUNG DURASI
   Contoh:
   18 Okt - 21 Okt = 4 hari
===================================================== */

function calculateDuration(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {

        return "-";

    }


    const start =
        new Date(
            normalizeDate(
                startDate
            )
        );


    const end =
        new Date(
            normalizeDate(
                endDate
            )
        );


    if (
        isNaN(
            start.getTime()
        ) ||
        isNaN(
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
            (
                1000 *
                60 *
                60 *
                24
            )
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


    if (
        Array.isArray(
            benefit
        )
    ) {

        return benefit
            .map(
                function(value) {

                    return String(
                        value
                    ).trim();

                }
            )
            .filter(
                Boolean
            );

    }


    try {

        const parsed =
            JSON.parse(
                benefit
            );


        if (
            Array.isArray(
                parsed
            )
        ) {

            return parsed
                .map(
                    function(value) {

                        return String(
                            value
                        ).trim();

                    }
                )
                .filter(
                    Boolean
                );

        }

    } catch (error) {

        // bukan JSON

    }


    return String(
        benefit
    )
        .split(
            /[,|\n]+/
        )
        .map(
            function(value) {

                return value.trim();

            }
        )
        .filter(
            Boolean
        );

}


/* =====================================================
   PROMO DATA
===================================================== */

function getPromoData(
    item
) {

    const hargaNormal =
        Number(
            item.harga
        ) || 0;


    /*
     * Nilai 0 harus tetap dianggap valid.
     */

    let hargaPromo =
        0;


    if (
        item.harga_promo !== null &&
        item.harga_promo !== undefined &&
        item.harga_promo !== ""
    ) {

        hargaPromo =
            Number(
                item.harga_promo
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
            item.promo_aktif
        ) === 1 ||
        item.promo_aktif === true ||
        item.promo_aktif === "1";


    let diskon =
        0;


    /*
     * Harga normal 0
     * berarti gratis.
     */

    if (
        hargaNormal <= 0
    ) {

        diskon =
            0;

    }


    /*
     * Harga promo 0
     * berarti GRATIS / 100% OFF.
     */

    else if (
        promoAktif &&
        hargaPromo === 0
    ) {

        diskon =
            100;

    }


    /*
     * Promo normal.
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
   STATUS
===================================================== */

function getBootcampStatus(
    item
) {

    const kuota =
        Number(
            item.kuota ||
            item.kuota_peserta ||
            0
        );


    if (
        kuota <= 0
    ) {

        return {

            text:
                "Penuh",

            className:
                "full"

        };

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const tanggalMulai =
        item.tanggal_mulai
            ? new Date(
                normalizeDate(
                    item.tanggal_mulai
                )
            )
            : null;


    const tanggalBerakhir =
        item.tanggal_berakhir
            ? new Date(
                normalizeDate(
                    item.tanggal_berakhir
                )
            )
            : null;


    if (
        tanggalBerakhir &&
        !isNaN(
            tanggalBerakhir.getTime()
        ) &&
        today >
        tanggalBerakhir
    ) {

        return {

            text:
                "Selesai",

            className:
                "done"

        };

    }


    if (
        tanggalMulai &&
        !isNaN(
            tanggalMulai.getTime()
        ) &&
        today <
        tanggalMulai
    ) {

        return {

            text:
                "Segera Dibuka",

            className:
                "soon"

        };

    }


    return {

        text:
            "Dibuka",

        className:
            ""

    };

}


/* =====================================================
   LOAD DATA
===================================================== */

async function loadBootcamp() {

    const grid =
        document.getElementById(
            "bootcampGrid"
        );


    const count =
        document.getElementById(
            "bootcampCount"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = `

        <div class="user-course-empty">

            <strong>
                Memuat data bootcamp...
            </strong>

            Silakan tunggu sebentar.

        </div>

    `;


    try {

        const response =
            await fetch(
                BOOTCAMP_API +
                "?action=list&_=" +
                Date.now(),
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


        if (
            !response.ok
        ) {

            throw new Error(
                "Server error " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "DATA BOOTCAMP USER:",
            result
        );


        if (
            Array.isArray(
                result
            )
        ) {

            bootcampData =
                result;

        }

        else {

            bootcampData =
                result &&
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];

        }


        if (
            count
        ) {

            count.textContent =
                bootcampData.length +
                " Bootcamp";

        }


        applyFilters();

    } catch (error) {

        console.error(
            "LOAD BOOTCAMP ERROR:",
            error
        );


        grid.innerHTML = `

            <div class="user-course-empty">

                <strong>
                    Gagal mengambil data bootcamp
                </strong>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =====================================================
   FILTER
===================================================== */

function applyFilters() {

    let filtered =
        [...bootcampData];


    if (
        activeFilter !==
        "Semua Batch"
    ) {

        filtered =
            filtered.filter(
                function(item) {

                    return String(
                        item.kategori ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                        String(
                            activeFilter
                        )
                            .trim()
                            .toLowerCase();

                }
            );

    }


    if (
        searchKeyword
    ) {

        filtered =
            filtered.filter(
                function(item) {

                    const text = [

                        item.judul,

                        item.nama_bootcamp,

                        item.nama_produk,

                        item.kategori,

                        item.mentor,

                        item.deskripsi,

                        item.benefit

                    ]
                        .map(
                            function(value) {

                                return String(
                                    value ||
                                    ""
                                )
                                    .toLowerCase();

                            }
                        )
                        .join(
                            " "
                        );


                    return text.includes(
                        searchKeyword
                    );

                }
            );

    }


    renderBootcamp(
        filtered
    );

}


/* =====================================================
   RENDER
===================================================== */

function renderBootcamp(
    data
) {

    const grid =
        document.getElementById(
            "bootcampGrid"
        );


    if (!grid) {

        return;

    }


    if (
        !data.length
    ) {

        grid.innerHTML = `

            <div class="user-course-empty">

                <strong>
                    Bootcamp tidak ditemukan
                </strong>

                Coba gunakan pencarian
                atau kategori lain.

            </div>

        `;

        return;

    }


    grid.innerHTML =
        data
            .map(
                createBootcampCard
            )
            .join("");

}


/* =====================================================
   CREATE CARD
   FORMAT MIRIP E-LEARNING
===================================================== */

function createBootcampCard(
    item
) {

    const id =
        Number(
            item.id
        ) || 0;


    const judul =
        item.judul ||
        item.nama_bootcamp ||
        item.nama_produk ||
        "Bootcamp";


    const kategori =
        item.kategori ||
        "Bootcamp";


    const mentor =
        item.mentor ||
        "Belum ditentukan";


    const kuota =
        Number(
            item.kuota ||
            item.kuota_peserta ||
            0
        );


    const deskripsi =
        item.deskripsi ||
        "Belum ada deskripsi.";


    const benefits =
        parseBenefits(
            item.benefit
        );


    const harga =
        Number(
            item.harga
        ) || 0;


    const promo =
        getPromoData(
            item
        );


    /*
     * PROMO NORMAL
     */

    const promoValid =
        promo.aktif &&
        promo.hargaNormal > 0 &&
        promo.hargaPromo > 0 &&
        promo.hargaPromo <
        promo.hargaNormal;


    /*
     * PROMO GRATIS
     */

    const promoGratis =
        promo.aktif &&
        promo.hargaNormal > 0 &&
        promo.hargaPromo === 0;


    /*
     * HARGA NORMAL GRATIS
     */

    const bootcampGratis =
        promo.hargaNormal <= 0;


    const tanggalMulai =
        formatDate(
            item.tanggal_mulai
        );


    const tanggalBerakhir =
        formatDate(
            item.tanggal_berakhir
        );


    const durasi =
        calculateDuration(
            item.tanggal_mulai,
            item.tanggal_berakhir
        );


    const status =
        getBootcampStatus(
            item
        );


    /* =================================================
       IMAGE
    ================================================= */

    let imagePath =
        item.gambar ||
        "";


    imagePath =
        String(
            imagePath
        ).trim();


    if (
        imagePath &&
        !imagePath.startsWith(
            "http://"
        ) &&
        !imagePath.startsWith(
            "https://"
        ) &&
        !imagePath.startsWith(
            "../"
        ) &&
        !imagePath.startsWith(
            "/"
        )
    ) {

        imagePath =
            "../" +
            imagePath;

    }


    const imageHTML =
        imagePath
            ? `

                <img
                    src="${escapeHTML(
                        imagePath
                    )}"
                    alt="${escapeHTML(
                        judul
                    )}"
                    onerror="
                        this.style.display='none';

                        const fallback=document.createElement('div');

                        fallback.style.cssText='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eef2ff;color:#4338ca;font-size:12px;font-weight:700;';

                        fallback.textContent='Belum ada gambar';

                        this.parentElement.appendChild(fallback);
                    "
                >

            `
            : `

                <div
                    style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eef2ff;
                        color:#4338ca;
                        font-size:12px;
                        font-weight:700;
                    "
                >

                    Belum ada gambar

                </div>

            `;


    /* =================================================
       BENEFIT
    ================================================= */

    let benefitHTML =
        "";


    if (
        benefits.length > 0
    ) {

        benefitHTML = `

            <div
                class="course-benefits"
            >

                ${
                    benefits
                        .slice(
                            0,
                            3
                        )
                        .map(
                            function(
                                benefit
                            ) {

                                return `

                                    <span
                                        class="benefit-chip"
                                        title="${escapeHTML(
                                            benefit
                                        )}"
                                    >

                                        ${escapeHTML(
                                            benefit
                                        )}

                                    </span>

                                `;

                            }
                        )
                        .join(
                            ""
                        )
                }

            </div>

        `;

    }


    /* =================================================
       PRICE
    ================================================= */

    let priceHTML =
        "";


    /*
     * HARGA NORMAL = 0
     */

    if (
        bootcampGratis
    ) {

        priceHTML = `

            <span
                class="course-price-normal"
            >

                Gratis

            </span>

        `;

    }


    /*
     * PROMO = 0
     *
     * Contoh:
     * harga = 1000000
     * harga_promo = 0
     * promo_aktif = 1
     */

    else if (
        promoGratis
    ) {

        priceHTML = `

            <div class="course-price-promo">

                <span
                    class="course-price-old"
                >

                    ${formatRupiah(
                        promo.hargaNormal
                    )}

                </span>


                <div
                    class="course-price-new-row"
                >

                    <span
                        class="course-price-new"
                    >

                        Gratis

                    </span>


                    <span
                        class="course-discount"
                    >

                        100% OFF

                    </span>

                </div>

            </div>

        `;

    }


    /*
     * PROMO NORMAL
     */

    else if (
        promoValid
    ) {

        priceHTML = `

            <div class="course-price-promo">

                <span
                    class="course-price-old"
                >

                    ${formatRupiah(
                        promo.hargaNormal
                    )}

                </span>


                <div
                    class="course-price-new-row"
                >

                    <span
                        class="course-price-new"
                    >

                        ${formatRupiah(
                            promo.hargaPromo
                        )}

                    </span>


                    ${
                        promo.diskon > 0
                            ? `

                                <span
                                    class="course-discount"
                                >

                                    ${promo.diskon}% OFF

                                </span>

                            `
                            : ""
                    }

                </div>

            </div>

        `;

    }


    /*
     * HARGA NORMAL
     */

    else {

        priceHTML = `

            <span
                class="course-price-normal"
            >

                ${formatRupiah(
                    harga
                )}

            </span>

        `;

    }


    /* =================================================
       PROMO BADGE
    ================================================= */

    let promoBadgeHTML =
        "";


    /*
     * 100% OFF
     */

    if (
        promoGratis
    ) {

        promoBadgeHTML = `

            <span
                class="promo-badge-toggle"
            >

                100% OFF

            </span>

        `;

    }


    /*
     * PROMO NORMAL
     */

    else if (
        promoValid &&
        promo.diskon > 0
    ) {

        promoBadgeHTML = `

            <span
                class="promo-badge-toggle"
            >

                ${promo.diskon}% OFF

            </span>

        `;

    }


    /* =================================================
       CARD
       URUTAN:
       CATEGORY
       TITLE
       DESCRIPTION
       MENTOR / PESERTA / DURASI
       BENEFIT
       DATE
       PRICE + BUTTON
    ================================================= */

    return `

        <article
            class="bootcamp-card-modern"
            data-id="${id}"
            data-kategori="${escapeHTML(
                kategori
            )}"
        >


            <!-- IMAGE -->

            <div
                class="card-img-wrapper"
            >

                ${imageHTML}


                <!-- STATUS -->

                <span
                    class="
                        badge-status
                        ${status.className}
                    "
                >

                    ${escapeHTML(
                        status.text
                    )}

                </span>


                <!-- PROMO -->

                ${promoBadgeHTML}

            </div>


            <!-- BODY -->

            <div
                class="card-body-custom"
            >


                <!-- CATEGORY -->

                <span
                    class="cat-tag"
                >

                    ${escapeHTML(
                        kategori
                    )}

                </span>


                <!-- TITLE -->

                <h3
                    class="card-title-custom"
                >

                    ${escapeHTML(
                        judul
                    )}

                </h3>


                <!-- DESCRIPTION -->

                <p
                    class="course-description-user"
                >

                    ${escapeHTML(
                        deskripsi
                    )}

                </p>


                <!-- META -->

                <div
                    class="course-meta"
                >

                    <span>

                        ${escapeHTML(
                            mentor
                        )}

                    </span>


                    <span>

                        ${kuota}
                        peserta

                    </span>


                    <span>

                        ${escapeHTML(
                            durasi
                        )}

                    </span>

                </div>


                <!-- BENEFIT -->

                ${benefitHTML}


                <!-- TANGGAL -->

                <div
                    class="date-box"
                >

                    ${escapeHTML(
                        tanggalMulai
                    )}

                    —

                    ${escapeHTML(
                        tanggalBerakhir
                    )}

                </div>


                <!-- FOOTER -->

                <div
                    class="card-footer-user"
                >


                    <!-- PRICE -->

                    <div
                        class="price-user"
                    >

                        <span
                            class="price-user-label"
                        >

                            Harga

                        </span>


                        ${priceHTML}

                    </div>


                    <!-- BUTTON -->

                    <button
                        type="button"
                        class="btn-primary-full"
                        ${
                            kuota <= 0
                                ? "disabled"
                                : ""
                        }
                        onclick="
                            openRegisterModal(
                                ${id},
                                '${escapeHTML(
                                    judul
                                ).replace(
                                    /'/g,
                                    "\\'"
                                )}'
                            )
                        "
                    >

                        ${
                            kuota <= 0
                                ? "Penuh"
                                : "Lihat Detail"
                        }

                    </button>


                </div>


            </div>


        </article>

    `;

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
            "LOGIN STATUS:",
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
   OPEN REGISTER MODAL
===================================================== */

async function openRegisterModal(
    id,
    title
) {

    selectedBootcampId =
        id;


    const isLoggedIn =
        await checkLoginStatus();


    if (
        isLoggedIn
    ) {

        window.location.href =
            "detail_bootcamp.html?id=" +
            encodeURIComponent(
                selectedBootcampId
            );


        return;

    }


    const modal =
        document.getElementById(
            "bootcampRegisterModal"
        );


    const titleElement =
        document.getElementById(
            "registerModalTitle"
        );


    if (
        titleElement
    ) {

        titleElement.textContent =
            title
                ? "Pendaftaran " +
                  title
                : "Pendaftaran Bootcamp";

    }


    if (
        modal
    ) {

        modal.classList.add(
            "show"
        );

    }

}


/* =====================================================
   CLOSE REGISTER MODAL
===================================================== */

function closeBootcampRegisterModal() {

    const modal =
        document.getElementById(
            "bootcampRegisterModal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "show"
        );

    }


    selectedBootcampId =
        null;

}


/* =====================================================
   CONTINUE REGISTRATION
===================================================== */

function continueBootcampRegistration() {

    if (
        !selectedBootcampId
    ) {

        return;

    }


    const returnUrl =
        "bootcamp.html" +
        "?bootcamp=" +
        encodeURIComponent(
            selectedBootcampId
        );


    window.location.href =
        "../proses/masuk.php?redirect=" +
        encodeURIComponent(
            returnUrl
        );

}


/* =====================================================
   SEARCH
===================================================== */

const searchBootcampUser =
    document.getElementById(
        "searchBootcampUser"
    );


if (
    searchBootcampUser
) {

    searchBootcampUser.addEventListener(
        "input",
        function() {

            searchKeyword =
                this.value
                    .trim()
                    .toLowerCase();


            applyFilters();

        }
    );

}


/* =====================================================
   FILTER BUTTON
===================================================== */

document
    .querySelectorAll(
        "#bootcampFilters .pill-btn"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    activeFilter =
                        this.dataset.filter ||
                        "Semua Batch";


                    document
                        .querySelectorAll(
                            "#bootcampFilters .pill-btn"
                        )
                        .forEach(
                            function(item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    this.classList.add(
                        "active"
                    );


                    applyFilters();

                }
            );

        }
    );


/* =====================================================
   REGISTER MODAL OUTSIDE CLICK
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "bootcampRegisterModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeBootcampRegisterModal();

        }

    }
);


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeBootcampRegisterModal();

        }

    }
);


/* =====================================================
   START
===================================================== */

function initBootcampUser() {

    loadBootcamp();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initBootcampUser
    );

}

else {

    initBootcampUser();

}