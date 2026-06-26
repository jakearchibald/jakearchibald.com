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
      // double up the block break). Wrap each one in a `.newline` span that CSS
      // takes out of flow, so it no longer affects layout but is still picked
      // up when the code is copied.
      hast.children = hast.children.map((node) =>
        node.type === 'text' && node.value.trim() === ''
          ? wrapSpan('newline', [node])
          : node,
      );

      for (const line of hast.children) {
        if (line.type !== 'element') continue;
        if (line.properties?.class === 'newline') continue;

        const indentChildren = [];

        // Peel leading-whitespace-only tokens, and the leading whitespace of
        // the first token that also contains content, into the indent cell.
        while (line.children.length) {
          const child = line.children[0];
          const text = child.type === 'element' ? child.children[0] : child;
          if (!text || text.type !== 'text') break;

          const nonBlankIndex = text.value.search(RE_NON_BLANK);

          if (nonBlankIndex === -1) {
            // Whole token is whitespace — move it wholesale into the indent.
            indentChildren.push(line.children.shift());
            continue;
          }

          if (nonBlankIndex > 0) {
            // Token starts with whitespace then has content — split it. The
            // indent slice keeps the token's styling so it looks identical.
            const indentText = text.value.slice(0, nonBlankIndex);
            text.value = text.value.slice(nonBlankIndex);

            if (child.type === 'element') {
              indentChildren.push({
                ...child,
                children: [{ type: 'text', value: indentText }],
              });
            } else {
              indentChildren.push({ type: 'text', value: indentText });
            }
          }
          break;
        }

        line.children = [
          wrapSpan('indent', indentChildren),
          wrapSpan('content', line.children),
        ];
      }
      return hast;
    },
  };
}
