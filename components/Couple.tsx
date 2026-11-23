/**
 * The two of them, drawn as little cartoon people (taken from the photo):
 * she has long wavy light-brown hair, a black top with white flowers, black trousers;
 * he has a full dark beard, a black shirt, beige trousers and white sneakers.
 * Every moving part is its own group so the page can swing legs and arms.
 */

const SKIN_H = "#f1c9a5";
const SKIN_M = "#e6b48b";

export function Her() {
  return (
    <svg className="fig her" viewBox="0 0 120 224" aria-hidden="true">
      <g className="body">
        {/* long hair behind */}
        <path d="M32 62 C22 88 24 112 32 130 C36 138 30 142 26 146 C42 150 52 142 56 130 L64 130 C68 142 78 150 94 146 C90 142 84 138 88 130 C96 112 98 88 88 62 Z" fill="#a9764a" />
        <path d="M32 96 C30 110 32 124 38 134 M44 100 C42 114 44 126 48 134 M88 96 C90 110 88 124 82 134" stroke="#d6aa78" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* legs */}
        <g className="legL">
          <path d="M42 138 L39 208 H58 L60 138 Z" fill="#1d1d24" />
          <ellipse cx="47" cy="211" rx="13" ry="5.4" fill="#a8683a" />
        </g>
        <g className="legR">
          <path d="M60 138 L62 208 H81 L78 138 Z" fill="#1d1d24" />
          <ellipse cx="73" cy="211" rx="13" ry="5.4" fill="#a8683a" />
        </g>

        {/* black top with little white flowers */}
        <path d="M38 98 C38 92 46 90 52 90 L68 90 C74 90 82 92 82 98 L84 120 C84 132 82 140 82 142 H38 C38 140 36 132 36 120 Z" fill="#1d1d24" />
        <g fill="#fff">
          <circle cx="47" cy="128" r="2.6" /><circle cx="52" cy="124" r="2.6" /><circle cx="51" cy="131" r="2.6" /><circle cx="43" cy="123" r="2.2" /><circle cx="57" cy="132" r="1.8" />
        </g>
        <path d="M50 93 C54 100 66 100 70 93" stroke="#34343e" strokeWidth="1.6" fill="none" />

        {/* neck */}
        <path d="M53 78 V92 C57 98 63 98 67 92 V78 Z" fill={SKIN_H} />

        {/* arms */}
        <g className="armL">
          <path d="M40 96 C34 106 33 116 33 126" stroke={SKIN_H} strokeWidth="10" strokeLinecap="round" fill="none" />
          <rect x="29.5" y="118" width="7" height="3.4" rx="1.6" fill="#35a86a" />
          <circle cx="33" cy="131" r="5.4" fill={SKIN_H} />
        </g>
        <g className="armR">
          <path d="M80 96 C86 106 87 116 87 126" stroke={SKIN_H} strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="87" cy="131" r="5.4" fill={SKIN_H} />
          <circle className="ringGem" cx="89.8" cy="133" r="2" fill="#ffe7a1" />
        </g>

        {/* head */}
        <g className="head">
          <ellipse cx="60" cy="58" rx="28" ry="31" fill={SKIN_H} />
          <path d="M31 56 C30 32 46 22 62 24 C80 24 92 38 90 58 C86 46 78 40 68 38 C56 42 44 44 36 66 C32 64 31 60 31 56 Z" fill="#a9764a" />
          <path d="M44 34 C52 30 62 30 72 34 M38 46 C44 38 50 36 58 35" stroke="#d6aa78" strokeWidth="3" strokeLinecap="round" fill="none" />
          <g className="eyes" fill="#2c1d16">
            <ellipse className="eye" cx="48" cy="60" rx="3.2" ry="3.8" />
            <ellipse className="eye" cx="72" cy="60" rx="3.2" ry="3.8" />
          </g>
          <path d="M43 54 C45 51 51 51 53 54 M67 54 C69 51 75 51 77 54" stroke="#6a4630" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M60 62 C58 67 58 69 61 70" stroke="#c9946f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M51 76 C56 82 64 82 69 76" stroke="#b5483f" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <ellipse cx="41" cy="71" rx="5" ry="3" fill="#f08d86" opacity="0.45" />
          <ellipse cx="79" cy="71" rx="5" ry="3" fill="#f08d86" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

export function Him() {
  return (
    <svg className="fig him" viewBox="0 0 130 232" aria-hidden="true">
      <g className="body">
        {/* beige trousers, white sneakers */}
        <g className="legL">
          <path d="M40 146 L37 210 H62 L67 146 Z" fill="#d8c3a0" />
          <path d="M31 212 C31 222 64 222 64 211 L61 204 H37 Z" fill="#f6f6f2" stroke="#cfcfc8" strokeWidth="1" />
        </g>
        <g className="legR">
          <path d="M63 146 L68 210 H93 L90 146 Z" fill="#d8c3a0" />
          <path d="M66 211 C66 222 99 222 99 212 L93 204 H69 Z" fill="#f6f6f2" stroke="#cfcfc8" strokeWidth="1" />
        </g>

        {/* black shirt, broad */}
        <path d="M28 104 C28 96 38 92 48 92 H82 C92 92 102 96 102 104 L106 132 C106 142 98 148 98 150 H32 C32 148 24 142 24 132 Z" fill="#1d1d24" />
        <path d="M65 94 V150" stroke="#34343e" strokeWidth="1.4" />
        <path d="M52 94 L65 108 L78 94" stroke="#34343e" strokeWidth="1.6" fill="none" />
        <circle cx="65" cy="118" r="1.2" fill="#34343e" /><circle cx="65" cy="132" r="1.2" fill="#34343e" /><circle cx="65" cy="145" r="1.2" fill="#34343e" />

        <path d="M54 82 V96 C60 104 70 104 76 96 V82 Z" fill={SKIN_M} />

        <g className="armL">
          <path d="M32 102 C26 110 24 118 24 126" stroke="#1d1d24" strokeWidth="15" strokeLinecap="round" fill="none" />
          <path d="M24 124 C24 130 24 134 25 138" stroke={SKIN_M} strokeWidth="11" strokeLinecap="round" fill="none" />
          <rect x="19.5" y="132" width="10" height="3.6" rx="1.6" fill="#9aa0a8" />
          <circle cx="25" cy="144" r="6" fill={SKIN_M} />
          <rect x="19" y="142" width="9" height="15" rx="1.6" fill="#2e2e36" stroke="#aaa" strokeWidth="0.8" />
        </g>
        <g className="armR">
          <path d="M98 102 C104 110 106 118 106 126" stroke="#1d1d24" strokeWidth="15" strokeLinecap="round" fill="none" />
          <path d="M106 124 C106 130 106 134 105 138" stroke={SKIN_M} strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="105" cy="144" r="6" fill={SKIN_M} />
        </g>

        <g className="head">
          <ellipse cx="65" cy="60" rx="32" ry="34" fill={SKIN_M} />
          <path d="M33 58 C30 32 46 22 66 22 C86 22 100 34 97 58 C94 46 88 40 80 38 C70 42 58 42 50 38 C42 42 36 48 33 58 Z" fill="#1c1512" />
          <path d="M33 62 C33 92 48 100 65 100 C82 100 97 92 97 62 C93 70 90 74 84 74 C78 70 52 70 46 74 C40 74 37 70 33 62 Z" fill="#241a16" />
          <path d="M52 78 C58 74 72 74 78 78 C74 82 56 82 52 78 Z" fill="#241a16" />
          <g className="eyes" fill="#1c1512">
            <ellipse className="eye" cx="52" cy="62" rx="3.4" ry="3.8" />
            <ellipse className="eye" cx="78" cy="62" rx="3.4" ry="3.8" />
          </g>
          <path d="M46 55 C49 52 55 52 58 55 M72 55 C75 52 81 52 84 55" stroke="#1c1512" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M65 64 C62 70 62 72 66 72" stroke="#b9805c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M56 82 C61 87 69 87 74 82" stroke="#f3d8c8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <ellipse cx="44" cy="72" rx="5" ry="3" fill="#e9857b" opacity="0.3" />
          <ellipse cx="86" cy="72" rx="5" ry="3" fill="#e9857b" opacity="0.3" />
        </g>
      </g>
    </svg>
  );
}
