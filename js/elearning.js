/* =====================================================
   E-LEARNING USER
   Tampilan kartu disamakan dengan BOOTCAMP
===================================================== */

const API_URL =
    "../admin-php/elearning.php";


let courses =
    [];

let selectedCategory =
    "all";


/* =====================================================
   LOAD COURSE
===================================================== */

async function loadCourses() {

    const grid =
        document.getElementById(
            "courseGridUser"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = `

        <div class="user-course-empty">

            <strong>
                Memuat course...
            </strong>

            Silakan tunggu sebentar.

        </div>

    `;


    try {

        const response =
            await fetch(
                API_URL +
                "?_=" +
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
                "Server error: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Data course dari database:",
            result
        );


        /* =================================================
           RESPONSE
        ================================================= */

        if (
            Array.isArray(
                result
            )
        ) {

            courses =
                result;

        }

        else if (
            result &&
            Array.isArray(
                result.data
            )
        ) {

            courses =
                result.data;

        }

        else {

            courses =
                [];

        }


        console.log(
            "Data promo:",
            courses.map(
                function(course) {

                    return {

                        id:
                            course.id,

                        nama:
                            course.nama_produk,

                        harga:
                            course.harga,

                        harga_promo:
                            course.harga_promo,

                        promo_aktif:
                            course.promo_aktif

                    };

                }
            )
        );


        renderCourses(
            courses
        );


        updateCourseTotal(
            courses.length
        );


    } catch (error) {

        console.error(
            "ERROR LOAD COURSE:",
            error
        );


        grid.innerHTML = `

            <div class="user-course-empty">

                <strong>
                    Gagal memuat course
                </strong>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =====================================================
   PROMO DATA
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
     * Promo aktif + harga promo 0
     * berarti gratis / diskon 100%.
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
        hargaPromo < hargaNormal
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
   RENDER COURSES
===================================================== */

function renderCourses(
    data
) {

    const grid =
        document.getElementById(
            "courseGridUser"
        );


    if (!grid) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        grid.innerHTML = `

            <div class="user-course-empty">

                <strong>
                    Belum ada course
                </strong>

                Course E-Learning belum
                tersedia saat ini.

            </div>

        `;

        return;

    }


    grid.innerHTML =
        data
            .map(
                createCourseCard
            )
            .join(
                ""
            );

}


/* =====================================================
   CREATE COURSE CARD
===================================================== */

function createCourseCard(
    course
) {

    const id =
        Number(
            course.id
        ) || 0;


    const nama =
        course.nama_produk ||
        "Tanpa Nama";


    const deskripsi =
        course.deskripsi ||
        "Tidak ada deskripsi course.";


    const kategori =
        course.kategori ||
        "E-Learning";


    const subkategori =
        course.subkategori ||
        "";


    const durasi =
        course.durasi ||
        "-";


    const jadwal =
        course.jadwal ||
        "-";


    const benefits =
        parseBenefits(
            course.benefit
        );


    const promo =
        getPromoData(
            course
        );


    /*
     * PROMO NORMAL
     *
     * Harga promo > 0
     * dan lebih kecil dari harga normal.
     */

    const promoNormalValid =
        promo.aktif &&
        promo.hargaNormal > 0 &&
        promo.hargaPromo > 0 &&
        promo.hargaPromo <
        promo.hargaNormal;


    /*
     * PROMO GRATIS
     *
     * Harga promo = 0.
     */

    const promoGratis =
        promo.aktif &&
        promo.hargaNormal > 0 &&
        promo.hargaPromo === 0;


    /*
     * COURSE GRATIS
     *
     * Harga normal = 0.
     */

    const courseGratis =
        promo.hargaNormal <= 0;


    /* =================================================
       GAMBAR
    ================================================= */

    let gambar =
        "";


    if (
        course.gambar &&
        String(
            course.gambar
        ).trim() !== ""
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

            gambar =
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

            gambar =
                imagePath;

        }

        else {

            gambar =
                "../" +
                imagePath;

        }

    }


    let imageHTML =
        "";


    if (
        gambar
    ) {

        imageHTML = `

            <img
                src="${escapeAttribute(
                    gambar
                )}"
                alt="${escapeAttribute(
                    nama
                )}"
                onerror="imageError(this)"
            >

        `;

    }

    else {

        imageHTML = `

            <div
                class="course-no-image"
            >

                Belum ada gambar

            </div>

        `;

    }


    /* =================================================
       SUBCATEGORY
    ================================================= */

    let subcategoryHTML =
        "";


    if (
        subkategori
    ) {

        subcategoryHTML = `

            <span
                class="subcat-tag"
            >

                ${escapeHTML(
                    subkategori
                )}

            </span>

        `;

    }


    /* =================================================
       BENEFITS
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
                                        title="${escapeAttribute(
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
       META
       DURASI + JADWAL
    ================================================= */

    const metaHTML = `

        <div
            class="course-meta"
        >

            <span
                title="${escapeAttribute(
                    durasi
                )}"
            >

                ${escapeHTML(
                    durasi
                )}

            </span>


            <span
                title="${escapeAttribute(
                    jadwal
                )}"
            >

                ${escapeHTML(
                    jadwal
                )}

            </span>

        </div>

    `;


    /* =================================================
       PRICE
    ================================================= */

    let hargaHTML =
        "";


    /*
     * COURSE GRATIS
     *
     * harga normal = 0
     */

    if (
        courseGratis
    ) {

        hargaHTML = `

            <span
                class="course-price-normal"
            >

                Gratis

            </span>

        `;

    }


    /*
     * PROMO GRATIS
     *
     * harga normal > 0
     * harga promo = 0
     */

    else if (
        promoGratis
    ) {

        hargaHTML = `

            <div
                class="course-price-promo"
            >

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
        promoNormalValid
    ) {

        hargaHTML = `

            <div
                class="course-price-promo"
            >

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

        hargaHTML = `

            <span
                class="course-price-normal"
            >

                ${formatRupiah(
                    promo.hargaNormal
                )}

            </span>

        `;

    }


    /* =================================================
       PROMO BADGE
    ================================================= */

    let promoBadgeHTML =
        "";


    if (
        promoGratis
    ) {

        promoBadgeHTML = `

            <span
                class="promo-badge"
            >

                100% OFF

            </span>

        `;

    }

    else if (
        promoNormalValid &&
        promo.diskon > 0
    ) {

        promoBadgeHTML = `

            <span
                class="promo-badge"
            >

                ${promo.diskon}% OFF

            </span>

        `;

    }


    /* =================================================
       CARD
    ================================================= */

    return `

        <article
            class="course-card-modern"
        >


            <!-- IMAGE -->

            <div
                class="card-img-wrapper"
            >

                ${imageHTML}


                <!-- E-LEARNING -->

                <span
                    class="badge-level"
                >

                    E-Learning

                </span>


                <!-- PROMO -->

                ${promoBadgeHTML}

            </div>


            <!-- BODY -->

            <div
                class="card-body-custom"
            >


                <!-- CATEGORY -->

                <div
                    class="course-category-row"
                >

                    <span
                        class="cat-tag"
                    >

                        ${escapeHTML(
                            kategori
                        )}

                    </span>


                    ${subcategoryHTML}

                </div>


                <!-- TITLE -->

                <h4
                    class="card-title-custom"
                >

                    ${escapeHTML(
                        nama
                    )}

                </h4>


                <!-- DESCRIPTION -->

                <p
                    class="course-description-user"
                >

                    ${escapeHTML(
                        deskripsi
                    )}

                </p>


                <!-- META -->

                ${metaHTML}


                <!-- BENEFIT -->

                ${benefitHTML}


                <!-- FOOTER -->

                <div
                    class="course-footer"
                >


                    <!-- PRICE -->

                    <div
                        class="course-price-box"
                    >

                        <span
                            class="course-price-label"
                        >

                            Harga

                        </span>


                        ${hargaHTML}

                    </div>


                    <!-- DETAIL -->

                    <a
                        href="detail.html?id=${id}"
                        class="btn-primary-full"
                    >

                        Lihat Detail

                    </a>


                </div>


            </div>


        </article>

    `;

}


/* =====================================================
   PARSE BENEFIT
===================================================== */

function parseBenefits(
    benefit
) {

    if (
        !benefit
    ) {

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


    const value =
        String(
            benefit
        ).trim();


    if (
        !value
    ) {

        return [];

    }


    /*
       Support JSON
    */

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

    }

    catch (error) {

        // lanjut split biasa

    }


    /*
       Support:
       Benefit 1, Benefit 2
       atau Benefit 1 | Benefit 2
    */

    return value
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
   SEARCH + FILTER
===================================================== */

function filterCourses() {

    const searchInput =
        document.getElementById(
            "searchCourseUser"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        courses.filter(
            function(course) {

                const nama =
                    String(
                        course.nama_produk ||
                        ""
                    ).toLowerCase();


                const deskripsi =
                    String(
                        course.deskripsi ||
                        ""
                    ).toLowerCase();


                const kategori =
                    String(
                        course.kategori ||
                        ""
                    ).toLowerCase();


                const subkategori =
                    String(
                        course.subkategori ||
                        ""
                    ).toLowerCase();


                const benefit =
                    String(
                        course.benefit ||
                        ""
                    ).toLowerCase();


                const durasi =
                    String(
                        course.durasi ||
                        ""
                    ).toLowerCase();


                const jadwal =
                    String(
                        course.jadwal ||
                        ""
                    ).toLowerCase();


                const text =
                    nama +
                    " " +
                    deskripsi +
                    " " +
                    kategori +
                    " " +
                    subkategori +
                    " " +
                    benefit +
                    " " +
                    durasi +
                    " " +
                    jadwal;


                const cocokSearch =
                    text.includes(
                        keyword
                    );


                let cocokKategori =
                    true;


                if (
                    selectedCategory !==
                    "all"
                ) {

                    cocokKategori =
                        subkategori.toLowerCase() ===
                        selectedCategory.toLowerCase();

                }


                return (
                    cocokSearch &&
                    cocokKategori
                );

            }
        );


    renderCourses(
        filtered
    );


    updateCourseTotal(
        filtered.length
    );

}


/* =====================================================
   SEARCH EVENT
===================================================== */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchCourseUser"
        );


    if (
        !searchInput
    ) {

        return;

    }


    searchInput.addEventListener(
        "input",
        function() {

            filterCourses();

        }
    );

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function setupCategoryFilter() {

    const buttons =
        document.querySelectorAll(
            "#courseFilters .pill-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    buttons.forEach(
                        function(btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    selectedCategory =
                        this.dataset.category ||
                        "all";


                    filterCourses();

                }
            );

        }
    );

}


/* =====================================================
   TOTAL COURSE
===================================================== */

function updateCourseTotal(
    total
) {

    const label =
        document.getElementById(
            "courseTotalLabel"
        );


    if (
        !label
    ) {

        return;

    }


    label.textContent =
        total +
        " Course Tersedia";

}


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
   IMAGE ERROR
===================================================== */

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
            ".course-no-image"
        )
    ) {

        return;

    }


    const noImage =
        document.createElement(
            "div"
        );


    noImage.className =
        "course-no-image";


    noImage.textContent =
        "Gambar tidak tersedia";


    wrapper.appendChild(
        noImage
    );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupSearch();

        setupCategoryFilter();

        loadCourses();

    }
);