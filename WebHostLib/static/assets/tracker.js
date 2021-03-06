const adjustTableHeight = () => {
    const tablesContainer = document.getElementById('tables-container');
    const upperDistance = tablesContainer.getBoundingClientRect().top;

    const containerHeight = window.innerHeight - upperDistance;
    tablesContainer.style.maxHeight = `calc(${containerHeight}px - 1rem)`;

    const tableWrappers = document.getElementsByClassName('table-wrapper');
    for(let i=0; i < tableWrappers.length; i++){
        const maxHeight = (window.innerHeight - upperDistance) / 2;
        tableWrappers[i].style.maxHeight = `calc(${maxHeight}px - 1rem)`;
    }
};

window.addEventListener('load', () => {
    const tables = $(".table").DataTable({
        paging: false,
        info: false,
        dom: "t",
        columnDefs: [
            {
                targets: 'hours',
                render: function (data, type, row) {
                    if (type === "sort" || type === 'type') {
                        if (data === "None")
                            return -1;

                        return parseInt(data);
                    }
                    if (data === "None")
                        return data;

                    let hours   = Math.floor(data / 3600);
                    let minutes = Math.floor((data - (hours * 3600)) / 60);

                    if (minutes < 10) {minutes = "0"+minutes;}
                    return hours+':'+minutes;
                }
            },
            {
                targets: 'number',
                render: function (data, type, row) {
                    if (type === "sort" || type === 'type') {
                        return parseFloat(data);
                    }
                    return data;
                }
            },
            {
                targets: 'fraction',
                render: function (data, type, row) {
                    let splitted = data.split("/", 1);
                    let current = splitted[0]
                    if (type === "sort" || type === 'type') {
                        return parseInt(current);
                    }
                    return data;
                }
            },
        ],

        // DO NOT use the scrollX or scrollY options. They cause DataTables to split the thead from
        // the tbody and render two separate tables.
    });

    document.getElementById('search').addEventListener('keyup', (event) => {
        tables.search(event.target.value);
        console.info(tables.search());
        tables.draw();
    });

    const update = () => {
        const target = $("<div></div>");
        const tracker = document.getElementById('tracker-wrapper').getAttribute('data-tracker');
        target.load("/tracker/" + tracker, function (response, status) {
            if (status === "success") {
                target.find(".table").each(function (i, new_table) {
                    const new_trs = $(new_table).find("tbody>tr");
                    const old_table = tables.eq(i);
                    const topscroll = $(old_table.settings()[0].nScrollBody).scrollTop();
                    const leftscroll = $(old_table.settings()[0].nScrollBody).scrollLeft();
                    old_table.clear();
                    old_table.rows.add(new_trs).draw();
                    $(old_table.settings()[0].nScrollBody).scrollTop(topscroll);
                    $(old_table.settings()[0].nScrollBody).scrollLeft(leftscroll);
                });
                $("#multi-stream-link").replaceWith(target.find("#multi-stream-link"));
            } else {
                console.log("Failed to connect to Server, in order to update Table Data.");
                console.log(response);
            }
        })
    }

    setInterval(update, 30000);

    window.addEventListener('resize', () => {
        adjustTableHeight();
        tables.draw();
    });

    $(".table-wrapper").scrollsync({
        y_sync: true,
        x_sync: true
    });

    adjustTableHeight();
});
