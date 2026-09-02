# Fonts

Both families are self-hosted. The site tells people it never sees their
details; loading a webfont from Google would hand a third party an IP address
and a referrer on every page view, which is a smaller version of the same
promise being broken.

`*.ttf` here are the upstream files, used by `build-og-images.mjs` to draw the
Open Graph cards in Node. The browser gets `public/fonts/*.woff2`, subset to
Latin — five faces, about 76KB in total.

To regenerate after changing a weight:

    pip3 install fonttools brotli

    SUBSET='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+2000-206F,U+2074,U+2082,U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD'
    python3 -m fontTools.subset scripts/fonts/Poppins-Regular.ttf \
      --unicodes="$SUBSET" --layout-features='*' \
      --flavor=woff2 --output-file=public/fonts/poppins-400.woff2

The subset range covers Latin-1 plus general punctuation, the subscript 2 that
CO₂ needs, and the marks the copy actually uses. Adding a character outside it
(a currency symbol, a diacritic) means regenerating with a wider range.

Both families are licensed under the SIL Open Font License; see OFL.txt.
