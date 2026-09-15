/* ========================================
   BELAJARYUK - ADMIN DASHBOARD
   ADMIN.JS
======================================== */


/* ========================================
   GLOBAL
======================================== */

let salesChart = null;

let currentPeriod = 1;


/* ========================================
   FORMAT RUPIAH
======================================== */

function formatRupiah(number) {

    number = Number(number) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);

}


/* ========================================
   FORMAT NUMBER
======================================== */

function formatNumber(number) {

    number = Number(number) || 0;

    return new Intl.NumberFormat("id-ID").format(number);

}


/* ========================================
   TOGGLE SIDEBAR
======================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.querySelector(".overlay");


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle("open");


    if (overlay) {

        overlay.classList.toggle("show");

    }


    document.body.classList.toggle(
        "sidebar-open"
    );

}


/* ========================================
   CLOSE SIDEBAR
======================================== */

function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.querySelector(".overlay");


    if (sidebar) {

        sidebar.classList.remove("open");

    }


    if (overlay) {

        overlay.classList.remove("show");

    }


    document.body.classList.remove(
        "sidebar-open"
    );

}


/* ========================================
   CLOSE SIDEBAR WHEN CLICK MENU
======================================== */

function setupSidebarLinks() {

    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {
        return;
    }


    const links =
        sidebar.querySelectorAll(
            ".sidebar-nav a"
        );


    links.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    });

}


/* ========================================
   GET ELEMENT
======================================== */

function getElement(id) {

    return document.getElementById(id);

}


/* ========================================
   SET TEXT
======================================== */

function setText(id, value) {

    const element = getElement(id);

    if (element) {

        element.textContent = value;

    }

}


/* ========================================
   UPDATE STATISTICS
======================================== */

function updateStatistics(data) {

    const stats =
        data.stats || {};


    setText(
        "totalSales",
        formatRupiah(
            stats.total_sales || 0
        )
    );


    setText(
        "totalElearning",
        formatNumber(
            stats.total_elearning || 0
        )
    );


    setText(
        "totalBootcamp",
        formatNumber(
            stats.total_bootcamp || 0
        )
    );


    setText(
        "totalUsers",
        formatNumber(
            stats.total_users || 0
        )
    );


    setText(
        "productElearning",
        formatNumber(
            stats.total_elearning || 0
        ) + " terjual"
    );


    setText(
        "productBootcamp",
        formatNumber(
            stats.total_bootcamp || 0
        ) + " terjual"
    );

}


/* ========================================
   MONTH NAME
======================================== */

function getMonthName(monthNumber) {

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


    return months[
        Number(monthNumber) - 1
    ] || "-";

}


/* ========================================
   UPDATE MONTHLY SALES
======================================== */

function updateMonthlySales(monthlyData) {

    const container =
        getElement("monthGrid");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !monthlyData ||
        monthlyData.length === 0
    ) {

        container.innerHTML = `
            <div class="loading-data">
                Belum ada data penjualan.
            </div>
        `;

        return;

    }


    monthlyData.forEach(function (item) {

        const month =
            item.month ||
            item.bulan ||
            item.month_number ||
            1;


        const total =
            item.total ||
            item.total_sales ||
            item.penjualan ||
            0;


        const monthElement =
            document.createElement("div");


        monthElement.className =
            "month-item";


        monthElement.innerHTML = `

            <span class="month-name">
                ${getMonthName(month)}
            </span>

            <span class="month-value">
                ${formatRupiah(total)}
            </span>

        `;


        container.appendChild(
            monthElement
        );

    });

}


/* ========================================
   UPDATE TRANSACTIONS
======================================== */

function updateTransactions(
    transactions
) {

    const table =
        getElement("transactionTable");


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        !transactions ||
        transactions.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-data"
                >
                    Belum ada transaksi.
                </td>

            </tr>

        `;

        return;

    }


    transactions.forEach(function (item) {


        const nama =
            item.nama ||
            item.user_name ||
            item.pembeli ||
            "-";


        const produk =
            item.produk ||
            item.product_name ||
            item.nama_produk ||
            "-";


        const tanggal =
            item.tanggal ||
            item.date ||
            item.created_at ||
            "-";


        const total =
            item.total ||
            item.total_harga ||
            item.amount ||
            0;


        const status =
            item.status ||
            "Sukses";


        const statusLower =
            String(status).toLowerCase();


        let statusClass =
            "status-success";


        if (
            statusLower.includes("pending") ||
            statusLower.includes("menunggu")
        ) {

            statusClass =
                "status-pending";

        }


        if (
            statusLower.includes("gagal") ||
            statusLower.includes("failed")
        ) {

            statusClass =
                "status-failed";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(nama)}
            </td>

            <td>
                ${escapeHtml(produk)}
            </td>

            <td>
                ${escapeHtml(
                    formatDate(tanggal)
                )}
            </td>

            <td>
                ${formatRupiah(total)}
            </td>

            <td>

                <span
                    class="status ${statusClass}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


/* ========================================
   ESCAPE HTML
======================================== */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ========================================
   FORMAT DATE
======================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ========================================
   CREATE CHART
======================================== */

function createSalesChart(
    chartData
) {

    const canvas =
        getElement("salesChart");


    if (!canvas) {
        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js belum tersedia."
        );

        return;

    }


    const context =
        canvas.getContext("2d");


    if (salesChart) {

        salesChart.destroy();

        salesChart = null;

    }


    let labels = [];

    let values = [];


    if (
        chartData &&
        Array.isArray(chartData)
    ) {

        chartData.forEach(
            function (item) {

                labels.push(
                    item.label ||
                    item.bulan ||
                    item.month ||
                    item.year ||
                    "-"
                );


                values.push(
                    Number(
                        item.value ||
                        item.total ||
                        item.total_sales ||
                        item.penjualan ||
                        0
                    )
                );

            }
        );

    }


    if (labels.length === 0) {

        labels = [
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


        values = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

    }


    salesChart =
        new Chart(
            context,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Penjualan",

                            data:
                                values,

                            borderColor:
                                "#6366F1",

                            backgroundColor:
                                "rgba(99, 102, 241, 0.10)",

                            borderWidth: 2,

                            fill: true,

                            tension: 0.35,

                            pointRadius: 3,

                            pointHoverRadius: 5,

                            pointBackgroundColor:
                                "#6366F1"

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            formatRupiah(
                                                context.parsed.y
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            ticks: {

                                color:
                                    "#94A3B8",

                                font: {

                                    size: 10,

                                    family:
                                        "Plus Jakarta Sans"

                                }

                            }

                        },


                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    "#F1F5F9"

                            },

                            ticks: {

                                color:
                                    "#94A3B8",

                                font: {

                                    size: 10,

                                    family:
                                        "Plus Jakarta Sans"

                                },

                                callback:
                                    function (
                                        value
                                    ) {

                                        return formatCompactRupiah(
                                            value
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* ========================================
   COMPACT RUPIAH
======================================== */

function formatCompactRupiah(
    number
) {

    number = Number(number) || 0;


    if (number >= 1000000000) {

        return "Rp " +
            (number / 1000000000)
                .toFixed(1)
                .replace(".0", "") +
            " M";

    }


    if (number >= 1000000) {

        return "Rp " +
            (number / 1000000)
                .toFixed(1)
                .replace(".0", "") +
            " jt";

    }


    if (number >= 1000) {

        return "Rp " +
            (number / 1000)
                .toFixed(0) +
            " rb";

    }


    return "Rp " + number;

}


/* ========================================
   LOAD DASHBOARD
======================================== */

async function loadDashboard(
    period = 1
) {

    currentPeriod = period;


    try {

        const response =
            await fetch(
                `../admin-php/dashboard.php?period=${period}`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Data dashboard:",
            data
        );


        if (data.success === false) {

            throw new Error(
                data.message ||
                "Gagal mengambil data."
            );

        }


        updateStatistics(data);


        updateMonthlySales(
            data.monthly_sales ||
            data.monthly ||
            []
        );


        updateTransactions(
            data.transactions ||
            data.recent_transactions ||
            []
        );


        createSalesChart(
            data.chart ||
            data.sales_chart ||
            data.chart_data ||
            []
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showDashboardError();

    }

}


/* ========================================
   SHOW DASHBOARD ERROR
======================================== */

function showDashboardError() {

    /*
       Jangan bikin halaman blank
       kalau PHP belum tersambung.
    */


    const totalSales =
        getElement("totalSales");


    const totalElearning =
        getElement("totalElearning");


    const totalBootcamp =
        getElement("totalBootcamp");


    const totalUsers =
        getElement("totalUsers");


    if (totalSales) {

        totalSales.textContent =
            "Rp 0";

    }


    if (totalElearning) {

        totalElearning.textContent =
            "0";

    }


    if (totalBootcamp) {

        totalBootcamp.textContent =
            "0";

    }


    if (totalUsers) {

        totalUsers.textContent =
            "0";

    }


    updateMonthlySales([]);


    updateTransactions([]);


    createSalesChart([]);

}


/* ========================================
   CHANGE PERIOD
======================================== */

function changePeriod() {

    const filter =
        getElement("periodFilter");


    if (!filter) {
        return;
    }


    const period =
        Number(filter.value) || 1;


    loadDashboard(period);

}


/* ========================================
   HANDLE ESC KEY
======================================== */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeSidebar();

            }

        }
    );

}


/* ========================================
   HANDLE RESIZE
======================================== */

function setupResizeHandler() {

    window.addEventListener(
        "resize",
        function () {

            /*
               Chart.js akan responsive
               otomatis.
            */

            if (salesChart) {

                salesChart.resize();

            }

        }
    );

}


/* ========================================
   DOM READY
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "BelajarYuk Admin Dashboard aktif."
        );


        /* ================================
           SIDEBAR
        ================================= */

        setupSidebarLinks();


        /* ================================
           ESC KEY
        ================================= */

        setupEscapeKey();


        /* ================================
           RESIZE
        ================================= */

        setupResizeHandler();


        /* ================================
           LOAD DASHBOARD
        ================================= */

        loadDashboard(1);

    }
);