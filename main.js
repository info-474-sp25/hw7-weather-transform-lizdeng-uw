// SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container and group element for the chart
const svgLine = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// LOAD AND TRANSFORM DATA
d3.csv("weather.csv").then(data => {
    // --- CASE 1: FLATTEN ---
    // 1.1: Rename and reformat
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear(); // Corrected to use () after getFullYear
        d.precip = +d.average_precipitation;     // Convert precipitation to numeric
    });

    console.log("=== CASE 1: FLATTEN ===");
    console.log("Formatted data:", data);

    // 1.2: Filter — no filter, use full data
    const filteredData = data;
    console.log("Filtered data 1:", filteredData);

    // 1.3: Group and aggregate
    const groupedData = d3.groups(filteredData, d => d.city, d => d.year)
        .map(([city, years]) => ({
            city,
            values: years.map(([year, entries]) => ({
                year,
                avgPrecip: d3.mean(entries, e => e.precip)
            }))
        }));

    console.log("Grouped data 1:", groupedData);

    // 1.4: Flatten
    const flattenedData = groupedData.flatMap(({ city, values }) =>
        values.map(({ year, avgPrecip }) => ({
            city,
            year,
            avgPrecip
        }))
    );

    console.log("elideng - Final flattened data:", flattenedData);
    console.log("---------------------------------------------------------------------");

    // --- CASE 2: PIVOT ---
    // 2.1: Rename and reformat
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear();
        d.month = new Date(d.date).getMonth() + 1;
        d.actualPrecip = +d.actual_precipitation;
        d.avgPrecip = +d.average_precipitation;
        d.recordPrecip = +d.record_precipitation;
    });

    console.log("=== CASE 2: PIVOT ===");
    console.log("Raw data:", data);

    // 2.2: Filter to year 2014
    const filteredData2 = data.filter(d => d.year === 2014);
    console.log("Filtered data 2:", filteredData2);

    // 2.3: Group and aggregate by month
    const groupedData2 = d3.groups(filteredData2, d => d.month)
        .map(([month, entries]) => ({
            month,
            avgActualPrecip: d3.mean(entries, e => e.actualPrecip),
            avgAvgPrecip: d3.mean(entries, e => e.avgPrecip),
            avgRecordPrecip: d3.mean(entries, e => e.recordPrecip)
        }));

    console.log("Grouped data 2:", groupedData2);

    // 2.4: Pivot
    const pivotedData = groupedData2.flatMap(({ month, avgActualPrecip, avgAvgPrecip, avgRecordPrecip }) => [
        { month, precip: avgActualPrecip, type: "Actual" },
        { month, precip: avgAvgPrecip, type: "Average" },
        { month, precip: avgRecordPrecip, type: "Record" }
    ]);

    console.log("elideng - Final pivoted data:", pivotedData);
});
