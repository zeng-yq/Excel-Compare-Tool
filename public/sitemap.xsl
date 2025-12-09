<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>XML Sitemap</title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style type="text/css">
                    :root {
                        --bg-color: #ffffff;
                        --text-color: #111827;
                        --link-color: #2563eb;
                        --link-hover: #1d4ed8;
                        --border-color: #e5e7eb;
                        --header-bg: #f9fafb;
                        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    }

                    body {
                        font-family: var(--font-sans);
                        color: var(--text-color);
                        background-color: var(--bg-color);
                        margin: 0;
                        padding: 40px 20px;
                        line-height: 1.5;
                    }

                    .container {
                        max-width: 1024px;
                        margin: 0 auto;
                    }

                    h1 {
                        font-size: 2rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                        letter-spacing: -0.025em;
                    }

                    p.desc {
                        color: #6b7280;
                        margin-bottom: 2rem;
                        font-size: 1rem;
                    }

                    .table-wrapper {
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.875rem;
                    }

                    th {
                        background-color: var(--header-bg);
                        text-align: left;
                        padding: 12px 24px;
                        font-weight: 600;
                        color: #374151;
                        border-bottom: 1px solid var(--border-color);
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 0.05em;
                    }

                    td {
                        padding: 16px 24px;
                        border-bottom: 1px solid var(--border-color);
                        color: #4b5563;
                    }

                    tr:last-child td {
                        border-bottom: none;
                    }

                    tr:hover td {
                        background-color: #f9fafb;
                    }

                    a {
                        color: var(--link-color);
                        text-decoration: none;
                        font-weight: 500;
                    }

                    a:hover {
                        color: var(--link-hover);
                        text-decoration: underline;
                    }
                    
                    /* Responsive */
                    @media (max-width: 640px) {
                        td, th { padding: 12px 16px; }
                        td:not(:first-child), th:not(:first-child) { display: none; } /* Hide extra columns on mobile */
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Sitemap</h1>
                    <p class="desc">
                        Generated for ExcelCompare.org. Contains 
                        <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs.
                    </p>

                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th width="60%">URL Location</th>
                                    <th width="20%">Last Modified</th>
                                    <th width="10%">Freq</th>
                                    <th width="10%">Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="sitemap:urlset/sitemap:url">
                                    <tr>
                                        <td>
                                            <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                                        </td>
                                        <td><xsl:value-of select="sitemap:lastmod"/></td>
                                        <td><xsl:value-of select="sitemap:changefreq"/></td>
                                        <td><xsl:value-of select="sitemap:priority"/></td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>