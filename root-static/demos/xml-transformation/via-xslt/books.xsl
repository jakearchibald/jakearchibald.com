<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" doctype-public="about:legacy-compat" />

  <xsl:template name="book">
    <div class="book">
      <img class="cover" src="{cover}" alt="" />
      <div class="book-info">
        <div>
          <span class="title">
            <xsl:value-of select="title" />
          </span> - <span class="author">
            <xsl:value-of select="../name" />
          </span>
        </div>
        <div>
          <span class="genre">
            <xsl:value-of select="genre" />
          </span>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="/">
    <html>
      <head>
        <title>Some books</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="styles.css" />
      </head>
      <body>
        <h1>Some books</h1>
        <ul class="book-list">
          <xsl:for-each select="authors/author/book">
            <li>
              <xsl:call-template name="book" />
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
