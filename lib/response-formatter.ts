import { MarkdownFormatter as MD } from "./markdown-formatter"

/**
 * Service for formatting different types of responses
 */
export class ResponseFormatter {
  /**
   * Format an error message
   * @param title Error title
   * @param message Error message
   * @param code Optional error code
   */
  static formatError(title: string, message: string, code?: string): string {
    let output = MD.heading(`Error: ${title}`, 2)

    if (code) {
      output += MD.bold("Error Code: ") + MD.inlineCode(code) + "\n\n"
    }

    output += message + "\n\n"
    output += MD.blockquote("Please try again or contact support if the issue persists.")

    return output
  }

  /**
   * Format a success message
   * @param title Success title
   * @param message Success message
   */
  static formatSuccess(title: string, message: string): string {
    let output = MD.heading(`Success: ${title}`, 2)
    output += message + "\n\n"
    return output
  }

  /**
   * Format a code explanation
   * @param title Explanation title
   * @param code The code to explain
   * @param language The programming language
   * @param explanation The explanation text
   */
  static formatCodeExplanation(title: string, code: string, language: string, explanation: string): string {
    let output = MD.heading(title, 2)
    output += explanation + "\n\n"
    output += MD.codeBlock(code, language)
    return output
  }

  /**
   * Format a list of steps
   * @param title The title for the steps
   * @param steps Array of step descriptions
   * @param isNumbered Whether to use numbered list (true) or bullet list (false)
   */
  static formatSteps(title: string, steps: string[], isNumbered = true): string {
    let output = MD.heading(title, 2)

    if (isNumbered) {
      output += MD.numberedList(steps)
    } else {
      output += MD.bulletList(steps)
    }

    return output
  }

  /**
   * Format a comparison between items
   * @param title Comparison title
   * @param items Array of items to compare
   * @param properties Array of property names to compare
   */
  static formatComparison(title: string, items: Array<{ [key: string]: any }>, properties: string[]): string {
    let output = MD.heading(title, 2)

    // Create headers with property names
    const headers = ["Item", ...properties]

    // Create rows with item values
    const rows = items.map((item) => {
      const itemName = item.name || "Unnamed Item"
      return [itemName, ...properties.map((prop) => String(item[prop] || "-"))]
    })

    output += MD.table(headers, rows)
    return output
  }

  /**
   * Format a definition list
   * @param title The title for the definitions
   * @param definitions Object with terms and their definitions
   */
  static formatDefinitions(title: string, definitions: { [term: string]: string }): string {
    let output = MD.heading(title, 2)

    Object.entries(definitions).forEach(([term, definition]) => {
      output += MD.bold(term) + "\n"
      output += definition + "\n\n"
    })

    return output
  }
}

