/* ============================================================
   KELAS SAYA
   BELAJARYUK
============================================================ */

const API_URL =
    "../proses/kelas.php";


let kelasData =
    [];


let activeFilter =
    "all";


let currentSearch =
    "";


/* ============================================================
   ESCAPE HTML
============================================================ */

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


/* ============================================================
   ESCAPE ATTRIBUTE
============================================================ */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* ============================================================
   FORMAT TANGGAL
============================================================ */

function formatTanggal(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(
        date
    );

}


/* ============================================================
   IMAGE ERROR
============================================================ */

function imageError(
    image
) {

    if (
        !image
    ) {

        return;

    }


    image.style.display =
        "none";


    const wrapper =
        image.parentElement;


    if (
        !wrapper
    ) {

        return;

    }


    if (
        wrapper.querySelector(
            ".kelas-image-placeholder"
        )
    ) {

        return;

    }


    const placeholder =
        document.createElement(
            "div"
        );


    placeholder.className =
        "kelas-image-placeholder";


    placeholder.textContent =
        "Gambar tidak tersedia";


    wrapper.appendChild(
        placeholder
    );

}


/* ============================================================
   UPDATE SUMMARY
============================================================ */

function updateSummary(
    data
) {

    const total =
        Array.isArray(data)
            ? data.length
            : 0;


    const elearning =
        Array.isArray(data)
            ? data.filter(
                function (item) {

                    return (
                        String(
                            item.jenis_produk ||
                            ""
                        ).toLowerCase() ===
                        "elearning"
                    );

                }
            ).length
            : 0;


    const bootcamp =
        Array.isArray(data)
            ? data.filter(
                function (item) {

                    return (
                        String(
                            item.jenis_produk ||
                            ""
                        ).toLowerCase() ===
                        "bootcamp"
                    );

                }
            ).length
            : 0;


    const totalKelas =
        document.getElementById(
            "totalKelas"
        );


    const totalElearning =
        document.getElementById(
            "totalElearning"
        );


    const totalBootcamp =
        document.getElementById(
            "totalBootcamp"
        );


    if (
        totalKelas
    ) {

        totalKelas.textContent =
            total;

    }


    if (
        totalElearning
    ) {

        totalElearning.textContent =
            elearning;

    }


    if (
        totalBootcamp
    ) {

        totalBootcamp.textContent =
            bootcamp;

    }

}


/* ============================================================
   UPDATE COUNT
============================================================ */

function updateCount(
    total
) {

    const count =
        document.getElementById(
            "kelasCount"
        );


    if (
        count
    ) {

        count.textContent =
            total;

    }

}


/* ============================================================
   LOAD DATA
============================================================ */

async function loadKelas() {

    const grid =
        document.getElementById(
            "kelasGrid"
        );


    if (
        !grid
    ) {

        return;

    }


    grid.innerHTML = `

        <div class="kelas-loading">

            <span class="loading-dot"></span>

            Memuat kelas kamu...

        </div>

    `;


    try {

        const response =
            await fetch(
                API_URL +
                "?_=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const rawText =
            await response.text();


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
                "Response PHP:",
                rawText
            );


            throw new Error(
                "Response server bukan JSON."
            );

        }


        console.log(
            "Data Kelas Saya:",
            result
        );


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Server error: " +
                response.status
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil kelas."
            );

        }


        if (
            Array.isArray(
                result
            )
        ) {

            kelasData =
                result;

        }

        else if (
            result &&
            Array.isArray(
                result.data
            )
        ) {

            kelasData =
                result.data;

        }

        else {

            kelasData =
                [];

        }


        updateSummary(
            kelasData
        );


        filterAndRender();

    }


    catch (
    error
    ) {

        console.error(
            "LOAD KELAS ERROR:",
            error
        );


        const totalKelas =
            document.getElementById(
                "totalKelas"
            );


        const totalElearning =
            document.getElementById(
                "totalElearning"
            );


        const totalBootcamp =
            document.getElementById(
                "totalBootcamp"
            );


        if (
            totalKelas
        ) {

            totalKelas.textContent =
                "0";

        }


        if (
            totalElearning
        ) {

            totalElearning.textContent =
                "0";

        }


        if (
            totalBootcamp
        ) {

            totalBootcamp.textContent =
                "0";

        }


        grid.innerHTML = `

            <div class="kelas-error">

                <strong>
                    Gagal memuat Kelas Saya
                </strong>

                ${escapeHTML(
            error.message
        )}

                <br>

                <button
                    type="button"
                    class="btn-retry"
                    onclick="loadKelas()"
                >

                    Coba Lagi

                </button>

            </div>

        `;

    }

}


/* ============================================================
   FILTER + SEARCH
============================================================ */

function filterAndRender() {

    let filtered =
        Array.isArray(
            kelasData
        )
            ? [...kelasData]
            : [];


    /* ========================================================
       FILTER TYPE
    ======================================================== */

    if (
        activeFilter !==
        "all"
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    return (
                        String(
                            item.jenis_produk ||
                            ""
                        ).toLowerCase() ===
                        activeFilter
                    );

                }
            );

    }


    /* ========================================================
       SEARCH
    ======================================================== */

    if (
        currentSearch
    ) {

        filtered =
            filtered.filter(
                function (item) {

                    const nama =
                        String(
                            item.nama_produk ||
                            ""
                        ).toLowerCase();


                    const kategori =
                        String(
                            item.kategori ||
                            ""
                        ).toLowerCase();


                    const subkategori =
                        String(
                            item.subkategori ||
                            ""
                        ).toLowerCase();


                    const deskripsi =
                        String(
                            item.deskripsi ||
                            ""
                        ).toLowerCase();


                    const text =
                        (
                            nama +
                            " " +
                            kategori +
                            " " +
                            subkategori +
                            " " +
                            deskripsi
                        );


                    return text.includes(
                        currentSearch
                    );

                }
            );

    }


    updateCount(
        filtered.length
    );


    renderKelas(
        filtered
    );

}


/* ============================================================
   RENDER
============================================================ */

function renderKelas(
    data
) {

    const grid =
        document.getElementById(
            "kelasGrid"
        );


    if (
        !grid
    ) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        if (
            kelasData.length === 0
        ) {

            grid.innerHTML = `

                <div class="kelas-empty">

                    <div class="kelas-empty-icon">

                        KL

                    </div>


                    <h3>
                        Belum ada kelas
                    </h3>


                    <p>

                        Kamu belum memiliki
                        course atau bootcamp.
                        Yuk pilih pembelajaran
                        yang ingin kamu ikuti.

                    </p>


                    <a href="elearning.html">

                        Lihat E-Learning

                    </a>

                </div>

            `;

        }

        else {

            grid.innerHTML = `

                <div class="kelas-empty">

                    <div class="kelas-empty-icon">

                        --

                    </div>


                    <h3>
                        Kelas tidak ditemukan
                    </h3>


                    <p>

                        Tidak ada kelas yang
                        sesuai dengan pencarian
                        atau filter yang dipilih.

                    </p>

                </div>

            `;

        }


        return;

    }


    grid.innerHTML =
        data
            .map(
                createKelasCard
            )
            .join(
                ""
            );

}


/* ============================================================
   CREATE CARD
============================================================ */

function createKelasCard(
    item
) {

    const jenis =
        String(
            item.jenis_produk ||
            ""
        ).toLowerCase();


    const isElearning =
        jenis ===
        "elearning";


    const nama =
        escapeHTML(
            item.nama_produk ||
            "Tanpa Nama"
        );


    const kategori =
        escapeHTML(
            item.kategori ||
            (
                isElearning
                    ? "E-Learning"
                    : "Bootcamp"
            )
        );


    const subkategori =
        escapeHTML(
            item.subkategori ||
            ""
        );


    const deskripsi =
        escapeHTML(
            item.deskripsi ||
            (
                isElearning
                    ? "Course pembelajaran digital."
                    : "Program bootcamp Belajaryuk."
            )
        );


    const durasi =
        escapeHTML(
            item.durasi ||
            ""
        );


    const jadwal =
        escapeHTML(
            item.jadwal ||
            ""
        );


    const tanggalMulai =
        escapeHTML(
            item.tanggal_mulai ||
            ""
        );


    const tanggalBerakhir =
        escapeHTML(
            item.tanggal_berakhir ||
            ""
        );


    const produkId =
        Number(
            item.produk_id
        ) || 0;


    /* ========================================================
       IMAGE
    ======================================================== */

    let imageHTML =
        "";


    let imagePath =
        String(
            item.gambar ||
            ""
        ).trim();


    if (
        imagePath !== ""
    ) {

        if (
            imagePath.startsWith(
                "http://"
            ) ||
            imagePath.startsWith(
                "https://"
            )
        ) {

            imagePath =
                imagePath;

        }

        else if (
            imagePath.startsWith(
                "../"
            )
        ) {

            imagePath =
                imagePath;

        }

        else {

            imagePath =
                "../" +
                imagePath;

        }


        imageHTML = `

            <img
                src="${escapeAttribute(
            imagePath
        )}"
                alt="${escapeAttribute(
            item.nama_produk ||
            ""
        )}"
                onerror="imageError(this)"
            >

        `;

    }

    else {

        imageHTML = `

            <div
                class="kelas-image-placeholder"
            >

                ${isElearning
                ? "E-Learning"
                : "Bootcamp"
            }

            </div>

        `;

    }


    /* ========================================================
       CATEGORY
    ======================================================== */

    const categoryHTML = `

        <div class="kelas-category">

            <span>

                ${kategori}

            </span>


            ${subkategori
            ?
            `
                    <span class="secondary">
                        ${subkategori}
                    </span>
                    `
            :
            ""
        }

        </div>

    `;


    /* ========================================================
       META
    ======================================================== */

    let metaHTML =
        "";


    if (
        isElearning
    ) {

        metaHTML = `

            <div class="kelas-meta">

                ${durasi
                ?
                `
                        <span class="kelas-meta-item">
                            ${durasi}
                        </span>
                        `
                :
                ""
            }


                ${jadwal
                ?
                `
                        <span class="kelas-meta-item">
                            ${jadwal}
                        </span>
                        `
                :
                ""
            }

            </div>

        `;

    }

    else {

        metaHTML = `

            <div class="kelas-meta">

                ${tanggalMulai
                ?
                `
                        <span class="kelas-meta-item">

                            Mulai:
                            ${formatTanggal(
                    tanggalMulai
                )}

                        </span>
                        `
                :
                ""
            }


                ${tanggalBerakhir
                ?
                `
                        <span class="kelas-meta-item">

                            Selesai:
                            ${formatTanggal(
                    tanggalBerakhir
                )}

                        </span>
                        `
                :
                ""
            }

            </div>

        `;

    }


    /* ========================================================
       LINK
    ======================================================== */

    const detailURL =
        isElearning
            ? `detail.html?id=${produkId}`
            : `detail_bootcamp.html?id=${produkId}`;


    /* ========================================================
       TRANSACTION DATE
    ======================================================== */

    const tanggalBeli =
        formatTanggal(
            item.settlement_time ||
            item.transaction_time ||
            item.created_at
        );


    /* ========================================================
       RETURN CARD
    ======================================================== */

    return `

        <article class="kelas-card">


            <!-- IMAGE -->

            <div class="kelas-image">

                ${imageHTML}


                <span class="kelas-type-badge">

                    ${isElearning
            ? "E-Learning"
            : "Bootcamp"
        }

                </span>


                <span class="kelas-access-badge">

                    Akses Aktif

                </span>

            </div>


            <!-- BODY -->

            <div class="kelas-card-body">


                <!-- CATEGORY -->

                ${categoryHTML}


                <!-- TITLE -->

                <h3 class="kelas-title">

                    ${nama}

                </h3>


                <!-- DESCRIPTION -->

                <p class="kelas-description">

                    ${deskripsi}

                </p>


                <!-- META -->

                ${metaHTML}


                <!-- FOOTER -->

                <div class="kelas-card-footer">


                    <div class="kelas-purchased">

                        <span class="kelas-purchased-label">

                            Diakses sejak

                        </span>


                        <span class="kelas-purchased-date">

                            ${tanggalBeli}

                        </span>

                    </div>


                    <a
                        href="${detailURL}"
                        class="btn-mulai-belajar"
                    >

                        Mulai Belajar

                    </a>

                </div>


            </div>


        </article>

    `;

}


/* ============================================================
   SEARCH SETUP
============================================================ */

function setupSearch() {

    const search =
        document.getElementById(
            "searchKelas"
        );


    if (
        !search
    ) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            currentSearch =
                String(
                    this.value ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            filterAndRender();

        }
    );

}


/* ============================================================
   FILTER SETUP
============================================================ */

function setupFilter() {

    const buttons =
        document.querySelectorAll(
            ".kelas-filter-btn"
        );


    if (
        !buttons.length
    ) {

        return;

    }


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    activeFilter =
                        String(
                            this.dataset.filter ||
                            "all"
                        ).toLowerCase();


                    filterAndRender();

                }
            );

        }
    );

}


/* ============================================================
   START
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearch();

        setupFilter();

        loadKelas();

    }
);