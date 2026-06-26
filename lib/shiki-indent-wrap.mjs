const RE_NON_BLANK = /[^ \t]/;

function wrapSpan(className, children) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { class: className },
    children,
  };
}

/**
 * A shiki transformer that splits each line into two cells: the leading
 * indentation and the rest of the line. Combined with CSS that lays each line
 * out as a two-column grid (`auto 1fr`), this lets long lines wrap while their
 * wrapped continuation stays aligned under the line's content, preserving the
 * visual indent.
 *
 * Modelled on `transformerRenderIndentGuides` from `@shikijs/transformers`,
 * but rather than splitting the indent into per-level guide spans, it peels off
 * the whole leading-whitespace run into a single `.indent` cell and wraps the
 * remainder in a `.content` cell.
 */
export function transformerIndentWrap() {
  return {
    name: 'indent-wrap',
    code(hast) {
      // Each `.line` becomes a block-level grid, so the literal "\n" text nodes
      // shiki puts between lines would otherwise render as blank lines (and
      // double up the block break). Drop them.
      hast.children = hast.children.filter(
        (node) => !(node.type === 'text' && node.value.trim() === ''),
      );

      for (const line of hast.children) {
        if (line.type !== 'element') continue;

        const indentChildren = [];
        let indentText = '';

        // Peel leading-whitespace-only tokens, and the leading whitespace of
        // the first token that also contains content, into the indent cell.
        while (line.children.length) {
          const child = line.children[0];
          const text = child.type === 'element' ? child.children[0] : child;
          if (!text || text.type !== 'text') break;

          const nonBlankIndex = text.value.search(RE_NON_BLANK);

          if (nonBlankIndex === -1) {
            // Whole token is whitespace — move it wholesale into the indent.
            indentText += text.value;
            indentChildren.push(line.children.shift());
            continue;
          }

          if (nonBlankIndex > 0) {
            // Token starts with whitespace then has content — split it. The
            // indent slice keeps the token's styling so it looks identical.
            const leading = text.value.slice(0, nonBlankIndex);
            indentText += leading;
            text.value = text.value.slice(nonBlankIndex);

            if (child.type === 'element') {
              indentChildren.push({
                ...child,
                children: [{ type: 'text', value: leading }],
              });
            } else {
              indentChildren.push({ type: 'text', value: leading });
            }
          }
          break;
        }

        // The grid lays the indent and content out as separate cells, which
        // copy as separate lines. To keep copied lines intact, the indent is
        // also embedded in the content as a zero-width, select-only prefix
        // (see the `.copy-indent` CSS), and the visible `.indent` cell is
        // excluded from selection.
        const contentChildren = indentText
          ? [wrapSpan('copy-indent', [{ type: 'text', value: indentText }]), ...line.children]
          : line.children;

        line.children = [
          wrapSpan('indent', indentChildren),
          wrapSpan('content', contentChildren),
        ];
      }
      return hast;
    },
  };
}
