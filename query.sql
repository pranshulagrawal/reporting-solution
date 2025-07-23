-- This script is adapted for very old versions of Sybase ASE.
-- It avoids CASE statements by using scalar and correlated subqueries.
-- This is designed for maximum compatibility but may be less performant.

-- 1. Query for KPI Cards (Using scalar subqueries to avoid CASE)
SELECT
    (SELECT COUNT(*) FROM break_data b WHERE CONVERT(VARCHAR, b.created_at, 112) = '20250722' AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS todaysBreaks,
    (SELECT COUNT(*) FROM break_data b WHERE b.status != 'Resolved' AND b.ageing > 5 AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS agedBreaks,
    (SELECT COUNT(*) FROM break_data b WHERE b.status != 'Resolved' AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS openBreaks,
    (CAST((SELECT COUNT(*) FROM break_data b WHERE b.status = 'Resolved' AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS DECIMAL(10,2)) * 100 / (SELECT COUNT(*) FROM break_data b WHERE b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00')) AS resolvedPercentage;

-- 2. Query for "Break Trends" Line Chart (No CASE statement, no change needed)
SELECT
    CONVERT(VARCHAR(12), b.created_at, 107) AS name, -- Format: Mon dd, yyyy
    COUNT(*) AS breaks
FROM
    break_data b
WHERE
    b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00'
GROUP BY
    CONVERT(VARCHAR(12), b.created_at, 107)
ORDER BY
    MIN(b.created_at) ASC;

-- 3. Query for "Breaks by Category" Pie Chart (No CASE statement, no change needed)
SELECT
    bc.name,
    COUNT(b.id) AS value
FROM
    break_data b,
    break_category bc
WHERE
    b.break_category_ref = bc.id
AND
    b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00'
GROUP BY
    bc.name;

-- 4. Query for "Assignee Health" Panel (Using correlated subqueries to avoid CASE)
SELECT
    distinct_assignees.assignee AS name,
    (SELECT COUNT(*) FROM break_data b WHERE b.assignee = distinct_assignees.assignee AND b.status = 'Open' AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS open,
    (SELECT COUNT(*) FROM break_data b WHERE b.assignee = distinct_assignees.assignee AND b.status = 'Resolved' AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS resolved,
    (SELECT COUNT(*) FROM break_data b WHERE b.assignee = distinct_assignees.assignee AND b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00') AS value
FROM
    (SELECT DISTINCT assignee FROM break_data WHERE created_at >= '2025-07-15 00:00:00' AND created_at < '2025-07-23 00:00:00') AS distinct_assignees;

-- 5. Query for the "Break Details" Table (No CASE statement, no change needed)
SELECT TOP 5
    b.id,
    bc.name AS category,
    bsc.name AS subCategory,
    b.assignee,
    b.status,
    b.ageing
FROM
    break_data b,
    break_category bc,
    break_subcategory bsc
WHERE
    b.break_category_ref *= bc.id
AND
    b.sub_cat_ref *= bsc.id
AND
    b.created_at >= '2025-07-15 00:00:00' AND b.created_at < '2025-07-23 00:00:00'
ORDER BY
    b.created_at DESC;
