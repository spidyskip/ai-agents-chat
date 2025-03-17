/**
 * Utility for formatting responses in Markdown
 */
export class MarkdownFormatter {
    /**
     * Format a heading with the specified level
     * @param text The heading text
     * @param level The heading level (1-6)
     */
    static heading(text: string, level = 1): string {
      const headingLevel = Math.min(Math.max(level, 1), 6)
      const prefix = "#".repeat(headingLevel)
      return `${prefix} ${text}\n\n`
    }
  
    /**
     * Format text as bold
     * @param text The text to format
     */
    static bold(text: string): string {
      return `**${text}**`
    }
  
    /**
     * Format text as italic
     * @param text The text to format
     */
    static italic(text: string): string {
      return `*${text}*`
    }
  
    /**
     * Format text as code
     * @param text The text to format
     */
    static inlineCode(text: string): string {
      return `\`${text}\``
    }
  
    /**
     * Format a code block with optional language
     * @param code The code content
     * @param language The programming language (optional)
     */
    static codeBlock(code: string, language = ""): string {
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`
    }
  
    /**
     * Create a bulleted list from an array of items
     * @param items Array of list items
     */
    static bulletList(items: string[]): string {
      return items.map((item) => `- ${item}`).join("\n") + "\n\n"
    }
  
    /**
     * Create a numbered list from an array of items
     * @param items Array of list items
     */
    static numberedList(items: string[]): string {
      return items.map((item, index) => `${index + 1}. ${item}`).join("\n") + "\n\n"
    }
  
    /**
     * Create a blockquote
     * @param text The text to quote
     */
    static blockquote(text: string): string {
      return (
        text
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      )
    }
  
    /**
     * Create a horizontal rule
     */
    static horizontalRule(): string {
      return "---\n\n"
    }
  
    /**
     * Create a link
     * @param text The link text
     * @param url The URL
     */
    static link(text: string, url: string): string {
      return `[${text}](${url})`
    }
  
    /**
     * Create an image
     * @param altText The alt text
     * @param url The image URL
     */
    static image(altText: string, url: string): string {
      return `![${altText}](${url})`
    }
  
    /**
     * Create a table
     * @param headers Array of header cells
     * @param rows Array of row arrays
     */
    static table(headers: string[], rows: string[][]): string {
      const headerRow = `| ${headers.join(" | ")} |`
      const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`
      const dataRows = rows.map((row) => `| ${row.join(" | ")} |`)
  
      return [headerRow, separatorRow, ...dataRows].join("\n") + "\n\n"
    }
  
    /**
     * Format a response with a consistent structure
     * @param title The response title
     * @param sections Array of section objects with headings and content
     * @param summary Optional summary text
     */
    static formatResponse(
      title: string,
      sections: Array<{ heading: string; content: string }>,
      summary?: string,
    ): string {
      let output = this.heading(title, 1)
  
      if (summary) {
        output += `${summary}\n\n`
      }
  
      sections.forEach((section) => {
        output += this.heading(section.heading, 2)
        output += `${section.content}\n\n`
      })
  
      return output
    }
  }
  
  