SELECT
    COUNT(CASE WHEN CONVERT(DATE, b.created_at) = '2025-07-22' THEN 1 END) AS todaysBreaks,
    COUNT(CASE WHEN b.status != 'Resolved' AND b.ageing > 5 THEN 1 END) AS agedBreaks,
    COUNT(CASE WHEN b.status != 'Resolved' THEN 1 END) AS openBreaks,
    (CAST(COUNT(CASE WHEN b.status = 'Resolved' THEN 1 END) AS DECIMAL(10,2)) * 100 / COUNT(*)) AS resolvedPercentage
FROM
    break_data b
WHERE
    CONVERT(DATE, b.created_at) BETWEEN '2025-07-15' AND '2025-07-22';

-- 2. Query for "Break Trends" Line Chart
SELECT
    CONVERT(VARCHAR(12), b.created_at, 107) AS name, -- Format: Mon dd, yyyy
    COUNT(*) AS breaks
FROM
    break_data b
WHERE
    CONVERT(DATE, b.created_at) BETWEEN '2025-07-15' AND '2025-07-22'
GROUP BY
    CONVERT(VARCHAR(12), b.created_at, 107)
ORDER BY
    CONVERT(DATE, b.created_at) ASC;

-- 3. Query for "Breaks by Category" Pie Chart
SELECT
    bc.name,
    COUNT(b.id) AS value
FROM
    break_data b
JOIN
    break_category bc ON b.break_category_ref = bc.id
WHERE
    CONVERT(DATE, b.created_at) BETWEEN '2025-07-15' AND '2025-07-22'
GROUP BY
    bc.name;

-- 4. Query for "Assignee Health" Panel
SELECT
    b.assignee AS name,
    COUNT(CASE WHEN b.status = 'Open' THEN 1 END) AS open,
    COUNT(CASE WHEN b.status = 'Resolved' THEN 1 END) AS resolved,
    COUNT(*) AS value
FROM
    break_data b
WHERE
    CONVERT(DATE, b.created_at) BETWEEN '2025-07-15' AND '2025-07-22'
GROUP BY
    b.assignee;

-- 5. Query for the "Break Details" Table (Initial Page)
SELECT TOP 5
    b.id,
    bc.name AS category,
    bsc.name AS subCategory,
    b.assignee,
    b.status,
    b.ageing
FROM
    break_data b
LEFT JOIN
    break_category bc ON b.break_category_ref = bc.id
LEFT JOIN
    break_subcategory bsc ON b.sub_cat_ref = bsc.id
WHERE
    CONVERT(DATE, b.created_at) BETWEEN '2025-07-15' AND '2025-07-22'
ORDER BY
    b.created_at DESC;
